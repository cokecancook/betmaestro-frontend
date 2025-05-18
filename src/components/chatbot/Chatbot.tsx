
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
  | 'PROCESSING_AMOUNT' // Can be considered transient if AI call follows immediately
  | 'SHOWING_STRATEGY' 
  | 'AWAITING_CONFIRMATION'
  | 'PROCESSING_BET' // Can be considered transient
  | 'BET_PLACED'
  | 'ERROR_BALANCE'
  | 'PROMPT_PREMIUM'
  | 'IDLE_AFTER_NO'
  | 'ERROR_GENERIC';

const Chatbot: React.FC = () => {
  const { user, balance, addBet, updateBalance } = useAppContext();
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
          addMessage('ai', `${response.welcomeMessage} ${response.initialQuestion}`, undefined, [
            {label: "50€", value: "50"},
            {label: "100€", value: "100"},
            {label: "200€", value: "200"}
          ]);
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
          setMessages(prev => prev.slice(0, -1)); // Remove placeholder
          addMessage('ai', "Please enter a valid positive number for your bet amount.", undefined, [
            {label: "50€", value: "50"}, {label: "100€", value: "100"}, {label: "200€", value: "200"}
          ]);
          setIsAiTyping(false);
        } else if (amount > balance) {
          setMessages(prev => prev.slice(0, -1)); // Remove placeholder
          addMessage('ai', `Your bet of ${amount}€ exceeds your wallet balance of ${balance}€. Please enter a smaller amount or recharge your wallet.`, undefined, [
            {label: "50€", value: "50"}, {label: "100€", value: "100"}, {label: "200€", value: "200"}
          ]);
          setIsAiTyping(false);
        } else {
          setCurrentBetAmount(amount);
          setChatState('PROCESSING_AMOUNT'); 
          try {
            const strategy = await generateBettingStrategy({ walletBalance: balance, betAmount: amount });
            setMessages(prev => prev.slice(0, -1)); // Remove placeholder
            addMessage('ai', `Here's a strategy for your ${amount}€ bet:`, strategy, [{label: "Yes, place bet", value: "yes"}, {label: "No, thanks", value: "no"}]);
            setChatState('AWAITING_CONFIRMATION');
          } catch (error) {
            console.error("Error generating strategy:", error);
            setMessages(prev => prev.slice(0, -1)); // Remove placeholder
            addMessage('ai', "Sorry, I couldn't generate a strategy right now. Please try again.");
            setChatState('AWAITING_AMOUNT'); // Go back to awaiting amount
          } finally {
            setIsAiTyping(false);
          }
        }
        break;

      case 'AWAITING_CONFIRMATION':
        if (text.toLowerCase() === 'yes') {
          if (user?.plan === 'premium') {
            setChatState('PROCESSING_BET');
            // Simulate placing bet
            setTimeout(() => {
              const newBet: Bet = { 
                id: uuidv4(),
                gameDate: new Date().toISOString().split('T')[0], // Simplified
                homeTeam: "Team A", awayTeam: "Team B", 
                betAmount: currentBetAmount!,
                odds: 1.8, 
                betWinnerTeam: "Team A", 
                betDate: new Date().toISOString().split('T')[0],
              };
              addBet(newBet);
              const newBalance = balance - currentBetAmount!;
              updateBalance(newBalance);
              setMessages(prev => prev.slice(0, -1)); // Remove placeholder
              addMessage('ai', `Bets placed for ${currentBetAmount}€! Your new balance is ${newBalance.toFixed(2)}€. Good luck! What's next?`, undefined, [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
              toast({ title: "Bet Placed!", description: `Your ${currentBetAmount}€ bet has been successfully placed.` });
              setChatState('IDLE_AFTER_NO'); 
              setIsAiTyping(false);
            }, 1500);
          } else { // Not premium
            setMessages(prev => prev.slice(0, -1)); // Remove placeholder
            addMessage('ai', "Placing bets is a Premium feature. Please upgrade your plan in your Profile to proceed.", undefined, [{label: "Go to Profile", value: "profile"}, {label: "Maybe later", value: "later"}]);
            setChatState('PROMPT_PREMIUM');
            setIsAiTyping(false);
          }
        } else if (text.toLowerCase() === 'no') {
          setMessages(prev => prev.slice(0, -1)); // Remove placeholder
          addMessage('ai', "Okay, no problem. Is there anything else I can help you with today?", undefined, [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
          setChatState('IDLE_AFTER_NO');
          setIsAiTyping(false);
        } else { // Invalid response
          setMessages(prev => prev.slice(0, -1)); // Remove placeholder
          addMessage('ai', "Please answer with 'Yes' or 'No'.", undefined, [{label: "Yes, place bet", value: "yes"}, {label: "No, thanks", value: "no"}]);
          // Stay in AWAITING_CONFIRMATION
          setIsAiTyping(false);
        }
        break;
      
      case 'PROMPT_PREMIUM':
        setMessages(prev => prev.slice(0, -1)); // Remove placeholder
        if (text.toLowerCase() === 'profile') {
          addMessage('ai', "Great! Taking you to your profile now.");
          toast({ title: "Redirecting to Profile..."});
          setTimeout(() => window.location.pathname = '/profile', 500); 
        } else { // 'later'
          addMessage('ai', "Alright. Let me know if you change your mind or need help with something else!", undefined, [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
        }
        setChatState('IDLE_AFTER_NO');
        setIsAiTyping(false);
        break;

      case 'IDLE_AFTER_NO':
        if (text.toLowerCase() === 'new_bet' && user) {
           try {
            const response = await chatBotWelcomeMessage({ userName: user.name, walletBalance: balance });
            setMessages(prev => prev.slice(0, -1)); // Remove placeholder
            addMessage('ai', `${response.initialQuestion}`, undefined, [
              {label: "50€", value: "50"}, {label: "100€", value: "100"}, {label: "200€", value: "200"}
            ]);
            setChatState('AWAITING_AMOUNT');
          } catch (error) {
            console.error("Error starting new bet:", error);
            setMessages(prev => prev.slice(0, -1)); // Remove placeholder
            addMessage('ai', "I had trouble starting a new bet. Please try asking for a 'new bet' again.");
            setChatState('AWAITING_AMOUNT'); 
          } finally {
            setIsAiTyping(false);
          }
        } else if (text.toLowerCase() === 'end_chat') {
          setMessages(prev => prev.slice(0, -1)); // Remove placeholder
          addMessage('ai', "Thanks for using BetMaestro! Have a great day.");
          setChatState('ERROR_GENERIC'); // Effectively ends the conversation flow
          setIsAiTyping(false);
        } else {
          setMessages(prev => prev.slice(0, -1)); // Remove placeholder
          addMessage('ai', "Sorry, I didn't quite get that. Please choose an option or type 'new bet' or 'end chat'.", undefined,  [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
          // Stays in IDLE_AFTER_NO
          setIsAiTyping(false);
        }
        break;

      default:
        setMessages(prev => prev.slice(0, -1)); // Remove placeholder
        addMessage('ai', "I'm not sure how to handle that right now. Let's try starting over. How much would you like to bet?");
        setChatState('AWAITING_AMOUNT');
        setIsAiTyping(false);
        break;
    }
    // setIsAiTyping(false) moved into specific branches above
  };
  
  const getInputPlaceholder = () => {
    if (chatState === 'AWAITING_AMOUNT') return "Enter bet amount or choose an option";
    if (chatState === 'AWAITING_CONFIRMATION' || chatState === 'PROMPT_PREMIUM' || chatState === 'IDLE_AFTER_NO') return "Choose an option or type your response";
    if (isAiTyping && messages.some(m => m.isLoading)) return "Waiting for BetMaestro...";
    return "Type your message...";
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-1px)] max-h-[calc(100vh-4rem-1px)] bg-background rounded-lg shadow-lg overflow-hidden"> {/* Adjust height based on TopMenu */}
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}> {/* Added space-y-4 for overall message spacing */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onOptionClick={handleHumanMessage} />
        ))}
      </ScrollArea>
      <ChatInput 
        onSendMessage={handleHumanMessage} 
        // quickReplies prop removed
        disabled={isAiTyping || !['AWAITING_AMOUNT', 'AWAITING_CONFIRMATION', 'PROMPT_PREMIUM', 'IDLE_AFTER_NO'].includes(chatState)}
        placeholder={getInputPlaceholder()}
      />
    </div>
  );
};

export default Chatbot;
