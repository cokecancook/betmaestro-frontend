
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage as ChatMessageType, GenerateBettingStrategyOutput, User, Bet } from '@/types';
import { useAppContext } from '@/contexts/AppContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatBotWelcomeMessage } from '@/ai/flows/chatbot-welcome-message';
import { generateBettingStrategy } from '@/ai/flows/generate-betting-strategy';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; // For generating unique message IDs

type ChatState = 
  | 'GREETING' 
  | 'AWAITING_AMOUNT' 
  | 'PROCESSING_AMOUNT' 
  | 'SHOWING_STRATEGY' 
  | 'AWAITING_CONFIRMATION'
  | 'PROCESSING_BET'
  | 'BET_PLACED'
  | 'ERROR_BALANCE'
  | 'PROMPT_PREMIUM'
  | 'IDLE_AFTER_NO'
  | 'ERROR_GENERIC';

const Chatbot: React.FC = () => {
  const { user, balance, addBet, updateBalance } = useAppContext(); // Removed setPlan as it's not used here
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [chatState, setChatState] = useState<ChatState>('GREETING');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [currentBetAmount, setCurrentBetAmount] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((sender: 'ai' | 'human', text?: string, strategy?: GenerateBettingStrategyOutput, options?: {label: string, value: string}[], isLoading?: boolean) => {
    setMessages(prev => [...prev, { id: uuidv4(), sender, text, strategy, options, isLoading }]);
  }, []);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector<HTMLDivElement>('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        });
      }
    }
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (user && balance !== undefined && chatState === 'GREETING') {
      setIsAiTyping(true);
      addMessage('ai', undefined, undefined, undefined, true); // Placeholder for typing
      chatBotWelcomeMessage({ userName: user.name, walletBalance: balance })
        .then(response => {
          setMessages(prev => prev.slice(0, -1)); // Remove placeholder
          addMessage('ai', `${response.welcomeMessage} ${response.initialQuestion}`);
          setChatState('AWAITING_AMOUNT');
        })
        .catch(error => {
          console.error("Error getting welcome message:", error);
          setMessages(prev => prev.slice(0, -1)); // Remove placeholder on error
          addMessage('ai', "Sorry, I'm having trouble starting up. Please try again later.");
          setChatState('ERROR_GENERIC');
        })
        .finally(() => setIsAiTyping(false));
    }
  }, [user, balance, chatState, addMessage]);


  const handleHumanMessage = async (text: string) => {
    addMessage('human', text);
    setIsAiTyping(true);
    addMessage('ai', undefined, undefined, undefined, true); // AI typing placeholder

    switch (chatState) {
      case 'AWAITING_AMOUNT':
        const amount = parseFloat(text);
        if (isNaN(amount) || amount <= 0) {
          setMessages(prev => prev.slice(0, -1));
          addMessage('ai', "Please enter a valid positive number for your bet amount.");
          // setChatState('AWAITING_AMOUNT'); // Stays in this state
        } else if (amount > balance) {
          setMessages(prev => prev.slice(0, -1));
          addMessage('ai', `Your bet of ${amount}€ exceeds your wallet balance of ${balance}€. Please enter a smaller amount or recharge your wallet.`);
          // setChatState('AWAITING_AMOUNT'); // Stays in this state
        } else {
          setCurrentBetAmount(amount);
          setChatState('PROCESSING_AMOUNT'); // Transient state
          try {
            const strategy = await generateBettingStrategy({ walletBalance: balance, betAmount: amount });
            setMessages(prev => prev.slice(0, -1)); // Remove placeholder
            addMessage('ai', `Here's a strategy for your ${amount}€ bet:`, strategy, [{label: "Yes, place bet", value: "yes"}, {label: "No, thanks", value: "no"}]);
            setChatState('AWAITING_CONFIRMATION');
          } catch (error) {
            console.error("Error generating strategy:", error);
            setMessages(prev => prev.slice(0, -1)); // Remove placeholder
            addMessage('ai', "Sorry, I couldn't generate a strategy right now. Please try again.");
            setChatState('AWAITING_AMOUNT');
          }
        }
        break;

      case 'AWAITING_CONFIRMATION':
        setMessages(prev => prev.slice(0, -1)); // Remove AI typing placeholder from start of handleHumanMessage
        if (text.toLowerCase() === 'yes') {
          if (user?.plan === 'premium') {
            setChatState('PROCESSING_BET');
            // No "Placing your bets..." message, loader is already there
            // Simulate placing bet
            setTimeout(() => {
              const newBet: Bet = { 
                id: uuidv4(),
                gameDate: new Date().toISOString().split('T')[0],
                homeTeam: "Team A", awayTeam: "Team B", 
                betAmount: currentBetAmount!,
                odds: 1.8, 
                betWinnerTeam: "Team A", 
                betDate: new Date().toISOString().split('T')[0],
                // betResult will be undefined (pending) by default
              };
              addBet(newBet);
              const newBalance = balance - currentBetAmount!;
              updateBalance(newBalance);
              setMessages(prev => prev.slice(0, -1)); // Remove AI typing placeholder
              addMessage('ai', `Bets placed for ${currentBetAmount}€! Your new balance is ${newBalance.toFixed(2)}€. Good luck!`);
              toast({ title: "Bet Placed!", description: `Your ${currentBetAmount}€ bet has been successfully placed.` });
              setChatState('IDLE_AFTER_NO'); 
            }, 1500);
          } else {
             setMessages(prev => prev.slice(0, -1)); // Remove AI typing placeholder
            addMessage('ai', "Placing bets is a Premium feature. Please upgrade your plan in your Profile to proceed.", undefined, [{label: "Go to Profile", value: "profile"}, {label: "Maybe later", value: "later"}]);
            setChatState('PROMPT_PREMIUM');
          }
        } else if (text.toLowerCase() === 'no') {
           setMessages(prev => prev.slice(0, -1)); // Remove AI typing placeholder
          addMessage('ai', "Okay, no problem. Is there anything else I can help you with today?", undefined, [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
          setChatState('IDLE_AFTER_NO');
        } else {
            setMessages(prev => prev.slice(0, -1)); // Remove AI typing placeholder
           addMessage('ai', "Please answer with 'Yes' or 'No'.", undefined, [{label: "Yes, place bet", value: "yes"}, {label: "No, thanks", value: "no"}]);
           // Stay in AWAITING_CONFIRMATION
        }
        break;
      
      case 'PROMPT_PREMIUM':
        setMessages(prev => prev.slice(0, -1)); // Remove AI typing placeholder
        if (text.toLowerCase() === 'profile') {
          addMessage('ai', "Great! Taking you to your profile now.");
          toast({ title: "Redirecting to Profile..."});
          // Using window.location for simplicity in this context. Consider Next.js router if passed or available globally.
          setTimeout(() => window.location.pathname = '/profile', 500); 
        } else {
          addMessage('ai', "Alright. Let me know if you change your mind or need help with something else!", undefined, [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
        }
        setChatState('IDLE_AFTER_NO');
        break;

      case 'IDLE_AFTER_NO':
        if (text.toLowerCase() === 'new_bet' && user) {
           try {
            const response = await chatBotWelcomeMessage({ userName: user.name, walletBalance: balance });
            setMessages(prev => prev.slice(0, -1)); 
            addMessage('ai', `${response.initialQuestion}`);
            setChatState('AWAITING_AMOUNT');
          } catch (error) {
            console.error("Error starting new bet:", error);
            setMessages(prev => prev.slice(0, -1)); 
            addMessage('ai', "I had trouble starting a new bet. Please try asking for a 'new bet' again.");
            setChatState('AWAITING_AMOUNT'); 
          }
        } else if (text.toLowerCase() === 'end_chat') {
          setMessages(prev => prev.slice(0, -1)); 
          addMessage('ai', "Thanks for using BetMaestro! Have a great day.");
          setChatState('ERROR_GENERIC'); 
        } else {
          setMessages(prev => prev.slice(0, -1)); 
          addMessage('ai', "Sorry, I didn't quite get that. Please choose an option or type 'new bet' or 'end chat'.", undefined, getQuickReplies());
          // Stays in IDLE_AFTER_NO
        }
        break;

      default:
        setMessages(prev => prev.slice(0, -1)); // Remove placeholder
        addMessage('ai', "I'm not sure how to handle that right now. Let's try starting over. How much would you like to bet?");
        setChatState('AWAITING_AMOUNT');
        break;
    }
    setIsAiTyping(false);
  };

  const getQuickReplies = () => {
    if (chatState === 'AWAITING_CONFIRMATION') {
      return [{ label: "Yes, place bet", value: "yes" }, { label: "No, thanks", value: "no" }];
    }
    if (chatState === 'PROMPT_PREMIUM') {
      return [{label: "Go to Profile", value: "profile"}, {label: "Maybe later", value: "later"}];
    }
     if (chatState === 'IDLE_AFTER_NO') {
      return [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}];
    }
    return undefined;
  };
  
  const getInputPlaceholder = () => {
    if (chatState === 'AWAITING_AMOUNT') return "Enter bet amount (e.g., 50)";
    if (chatState === 'AWAITING_CONFIRMATION' || chatState === 'PROMPT_PREMIUM' || chatState === 'IDLE_AFTER_NO') return "Type 'Yes' or 'No', or choose an option";
    if (isAiTyping && !messages.some(m => m.isLoading && m.text === undefined)) return "Waiting for BetMaestro..."; // More specific if AI is typing but no visible loader msg
    return "Type your message...";
  }


  return (
    <div className="flex flex-col h-[calc(100vh-4rem-1px)] max-h-[calc(100vh-4rem-1px)] bg-background rounded-lg shadow-lg overflow-hidden"> {/* Adjust height based on TopMenu */}
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onOptionClick={handleHumanMessage} />
        ))}
      </ScrollArea>
      <ChatInput 
        onSendMessage={handleHumanMessage} 
        quickReplies={getQuickReplies()}
        disabled={isAiTyping || !['AWAITING_AMOUNT', 'AWAITING_CONFIRMATION', 'PROMPT_PREMIUM', 'IDLE_AFTER_NO'].includes(chatState)}
        placeholder={getInputPlaceholder()}
      />
    </div>
  );
};

export default Chatbot;
