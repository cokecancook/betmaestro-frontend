
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

const LOCAL_STORAGE_MESSAGES_KEY = 'betMaestroChatMessages';
const LOCAL_STORAGE_CHAT_STATE_KEY = 'betMaestroChatState';
const LOCAL_STORAGE_CURRENT_BET_AMOUNT_KEY = 'betMaestroCurrentBetAmount';

const Chatbot: React.FC = () => {
  const { user, balance, addBet, updateBalance } = useAppContext();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [chatState, setChatState] = useState<ChatState>('GREETING');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [currentBetAmount, setCurrentBetAmount] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isRestored, setIsRestored] = useState(false);

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

  // Load state from localStorage on mount
  useEffect(() => {
    const storedMessagesJSON = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
    const storedChatState = localStorage.getItem(LOCAL_STORAGE_CHAT_STATE_KEY) as ChatState | null;
    const storedBetAmountJSON = localStorage.getItem(LOCAL_STORAGE_CURRENT_BET_AMOUNT_KEY);

    let restoredMessages: ChatMessageType[] = [];
    let loadedChatState: ChatState = 'GREETING'; // Default if nothing stored
    let restoredBetAmount: number | null = null;

    if (storedMessagesJSON) {
      try {
        const parsedMessages = JSON.parse(storedMessagesJSON) as ChatMessageType[];
        if (Array.isArray(parsedMessages)) {
          restoredMessages = parsedMessages.filter(m => !m.isLoading); // Filter out "Thinking..." placeholders
        }
      } catch (e) {
        console.error("Error parsing stored messages:", e);
        localStorage.removeItem(LOCAL_STORAGE_MESSAGES_KEY);
      }
    }

    if (storedChatState) {
      loadedChatState = storedChatState;
    }

    if (storedBetAmountJSON) {
      try {
        restoredBetAmount = JSON.parse(storedBetAmountJSON) as number;
      } catch (e) {
        console.error("Error parsing stored bet amount:", e);
        localStorage.removeItem(LOCAL_STORAGE_CURRENT_BET_AMOUNT_KEY);
      }
    }

    if (restoredMessages.length > 0) {
      setMessages(restoredMessages);
      setCurrentBetAmount(restoredBetAmount);
      
      // Adjust chatState if it was left in a processing state
      if (loadedChatState === 'PROCESSING_AMOUNT') {
        setChatState('AWAITING_AMOUNT'); // User will need to re-enter amount or interact
      } else if (loadedChatState === 'PROCESSING_BET') {
        setChatState('AWAITING_CONFIRMATION'); // User will need to re-confirm
      } else {
        setChatState(loadedChatState);
      }
    } else {
      // No messages restored, ensure it's GREETING state for a fresh start
      setMessages([]);
      setChatState('GREETING');
      setCurrentBetAmount(null);
    }
    setIsRestored(true);
  }, []); // Run once on mount

  // Initial greeting (dependent on restoration and user/balance)
   useEffect(() => {
    if (isRestored && user && balance !== undefined) {
      if (messages.length === 0 && chatState === 'GREETING') { // Only greet if truly a fresh session
        setIsAiTyping(true);
        addMessage('ai', undefined, undefined, undefined, true); 
        chatBotWelcomeMessage({ userName: user.name, walletBalance: balance })
          .then(response => {
            setMessages(prev => prev.filter(m => !m.isLoading)); // Remove placeholder
            addMessage('ai', `${response.welcomeMessage} ${response.initialQuestion}`, undefined, [
              {label: "50€", value: "50"},
              {label: "100€", value: "100"},
              {label: "200€", value: "200"}
            ]);
            setChatState('AWAITING_AMOUNT');
          })
          .catch(error => {
            console.error("Error getting welcome message:", error);
            setMessages(prev => prev.filter(m => !m.isLoading)); // Remove placeholder on error
            addMessage('ai', "Sorry, I'm having trouble starting up. Please try again later.");
            setChatState('ERROR_GENERIC');
          })
          .finally(() => setIsAiTyping(false));
      }
    }
  }, [isRestored, user, balance, addMessage, messages.length, chatState]);


  // Save states to localStorage
  useEffect(() => {
    if (isRestored) {
      const messagesToSave = messages.filter(m => !m.isLoading);
      if (messagesToSave.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(messagesToSave));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_MESSAGES_KEY); // Clear if no actual messages to save
      }
    }
  }, [messages, isRestored]);

  useEffect(() => {
    if (isRestored) {
      localStorage.setItem(LOCAL_STORAGE_CHAT_STATE_KEY, chatState);
    }
  }, [chatState, isRestored]);

  useEffect(() => {
    if (isRestored) {
      if (currentBetAmount !== null) {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_BET_AMOUNT_KEY, JSON.stringify(currentBetAmount));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_CURRENT_BET_AMOUNT_KEY);
      }
    }
  }, [currentBetAmount, isRestored]);


  const handleHumanMessage = async (text: string) => {
    addMessage('human', text);
    setIsAiTyping(true);
    addMessage('ai', undefined, undefined, undefined, true); // AI typing placeholder

    // Remove AI typing placeholder robustly before adding new AI message or on error
    const removeAiTypingPlaceholder = () => {
      setMessages(prev => prev.filter(m => !m.isLoading));
      setIsAiTyping(false);
    };

    switch (chatState) {
      case 'AWAITING_AMOUNT':
        const amount = parseFloat(text);
        if (isNaN(amount) || amount <= 0) {
          removeAiTypingPlaceholder();
          addMessage('ai', "Please enter a valid positive number for your bet amount.", undefined, [
            {label: "50€", value: "50"}, {label: "100€", value: "100"}, {label: "200€", value: "200"}
          ]);
        } else if (amount > balance) {
          removeAiTypingPlaceholder();
          addMessage('ai', `Your bet of ${amount}€ exceeds your wallet balance of ${balance}€. Please enter a smaller amount or recharge your wallet.`, undefined, [
            {label: "50€", value: "50"}, {label: "100€", value: "100"}, {label: "200€", value: "200"}
          ]);
        } else {
          setCurrentBetAmount(amount);
          setChatState('PROCESSING_AMOUNT'); 
          try {
            const strategy = await generateBettingStrategy({ walletBalance: balance, betAmount: amount });
            removeAiTypingPlaceholder();
            addMessage('ai', `Here's a strategy for your ${amount}€ bet:`, strategy, [{label: "Yes, place bet", value: "yes"}, {label: "No, thanks", value: "no"}]);
            setChatState('AWAITING_CONFIRMATION');
          } catch (error) {
            console.error("Error generating strategy:", error);
            removeAiTypingPlaceholder();
            addMessage('ai', "Sorry, I couldn't generate a strategy right now. Please try again.");
            setChatState('AWAITING_AMOUNT'); 
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
                gameDate: new Date().toISOString().split('T')[0], 
                homeTeam: "Team A", awayTeam: "Team B", 
                betAmount: currentBetAmount!,
                odds: 1.8, 
                betWinnerTeam: "Team A", 
                betDate: new Date().toISOString().split('T')[0],
              };
              addBet(newBet);
              const newBalance = balance - currentBetAmount!;
              updateBalance(newBalance);
              removeAiTypingPlaceholder();
              addMessage('ai', `Bets placed for ${currentBetAmount}€! Your new balance is ${newBalance.toFixed(2)}€. Good luck! What's next?`, undefined, [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
              toast({ title: "Bet Placed!", description: `Your ${currentBetAmount}€ bet has been successfully placed.` });
              setChatState('IDLE_AFTER_NO'); 
            }, 1500);
          } else { 
            removeAiTypingPlaceholder();
            addMessage('ai', "Placing bets is a Premium feature. Please upgrade your plan in your Profile to proceed.", undefined, [{label: "Go to Profile", value: "profile"}, {label: "Maybe later", value: "later"}]);
            setChatState('PROMPT_PREMIUM');
          }
        } else if (text.toLowerCase() === 'no') {
          removeAiTypingPlaceholder();
          addMessage('ai', "Okay, no problem. Is there anything else I can help you with today?", undefined, [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
          setChatState('IDLE_AFTER_NO');
        } else { 
          removeAiTypingPlaceholder();
          addMessage('ai', "Please answer with 'Yes' or 'No'.", undefined, [{label: "Yes, place bet", value: "yes"}, {label: "No, thanks", value: "no"}]);
        }
        break;
      
      case 'PROMPT_PREMIUM':
        removeAiTypingPlaceholder();
        if (text.toLowerCase() === 'profile') {
          addMessage('ai', "Great! Taking you to your profile now.");
          toast({ title: "Redirecting to Profile..."});
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
            removeAiTypingPlaceholder();
            addMessage('ai', `${response.initialQuestion}`, undefined, [
              {label: "50€", value: "50"}, {label: "100€", value: "100"}, {label: "200€", value: "200"}
            ]);
            setChatState('AWAITING_AMOUNT');
          } catch (error) {
            console.error("Error starting new bet:", error);
            removeAiTypingPlaceholder();
            addMessage('ai', "I had trouble starting a new bet. Please try asking for a 'new bet' again.");
            setChatState('AWAITING_AMOUNT'); 
          }
        } else if (text.toLowerCase() === 'end_chat') {
          removeAiTypingPlaceholder();
          addMessage('ai', "Thanks for using BetMaestro! Have a great day.");
          setChatState('IDLE_AFTER_NO'); // Keep input active
        } else {
          removeAiTypingPlaceholder();
          addMessage('ai', "Sorry, I didn't quite get that. Please choose an option or type 'new bet' or 'end chat'.", undefined,  [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
        }
        break;

      default:
        removeAiTypingPlaceholder();
        addMessage('ai', "I'm not sure how to handle that right now. Let's try starting over. How much would you like to bet?");
        setChatState('AWAITING_AMOUNT');
        break;
    }
  };
  
  const getInputPlaceholder = () => {
    if (chatState === 'AWAITING_AMOUNT') return "Enter bet amount or choose an option";
    if (chatState === 'AWAITING_CONFIRMATION' || chatState === 'PROMPT_PREMIUM' || chatState === 'IDLE_AFTER_NO') return "Choose an option or type your response";
    if (isAiTyping && messages.some(m => m.isLoading)) return "Waiting for BetMaestro...";
    return "Type your message...";
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-1px)] max-h-[calc(100vh-4rem-1px)] bg-background rounded-lg shadow-lg overflow-hidden">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onOptionClick={handleHumanMessage} />
        ))}
      </ScrollArea>
      <ChatInput 
        onSendMessage={handleHumanMessage} 
        disabled={isAiTyping || !isRestored || !['GREETING', 'AWAITING_AMOUNT', 'AWAITING_CONFIRMATION', 'PROMPT_PREMIUM', 'IDLE_AFTER_NO'].includes(chatState)}
        placeholder={getInputPlaceholder()}
      />
    </div>
  );
};

export default Chatbot;

    

    