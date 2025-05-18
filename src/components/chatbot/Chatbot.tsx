
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage as ChatMessageType, GenerateBettingStrategyOutput, Bet, SuggestedBet } from '@/types';
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

const CHAT_MESSAGES_KEY = 'betMaestroChatMessages';
const CHAT_STATE_KEY = 'betMaestroChatState';
const CHAT_BET_AMOUNT_KEY = 'betMaestroCurrentBetAmount';

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
    setMessages(prev => [...prev, { id: uuidv4(), sender, text, strategy, options, isLoading, timestamp: new Date().toISOString() } as ChatMessageType]);
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

  useEffect(() => {
    const storedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
    const storedChatState = localStorage.getItem(CHAT_STATE_KEY) as ChatState | null;
    const storedBetAmount = localStorage.getItem(CHAT_BET_AMOUNT_KEY);

    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages).filter((m: ChatMessageType) => !m.isLoading);
        setMessages(parsedMessages);

        let activeChatState = storedChatState || 'GREETING';
        const nonInteractiveStates: ChatState[] = ['PROCESSING_AMOUNT', 'PROCESSING_BET', 'ERROR_GENERIC'];
        
        if (nonInteractiveStates.includes(activeChatState)) {
             activeChatState = parsedMessages.length > 0 ? 'AWAITING_AMOUNT' : 'GREETING';
             const lastAiMsgWithOptions = [...parsedMessages].reverse().find(m => m.sender === 'ai' && m.options && m.options.length > 0);
             if (lastAiMsgWithOptions) {
                if (lastAiMsgWithOptions.options?.some(opt => opt.value === 'yes' || opt.value === 'no')) {
                    activeChatState = 'AWAITING_CONFIRMATION';
                } else if (lastAiMsgWithOptions.options?.some(opt => opt.value === 'new_bet')) {
                    activeChatState = 'IDLE_AFTER_NO';
                } else if (lastAiMsgWithOptions.options?.some(opt => ["50","100","200"].includes(opt.value))) {
                    activeChatState = 'AWAITING_AMOUNT';
                }
             }
        } else if (activeChatState === 'GREETING' && parsedMessages.length > 0) {
            const lastAiMsgWithOptions = [...parsedMessages].reverse().find(m => m.sender === 'ai' && m.options && m.options.length > 0);
            if (lastAiMsgWithOptions) {
                if (lastAiMsgWithOptions.options?.some(opt => opt.value === 'yes' || opt.value === 'no')) {
                    activeChatState = 'AWAITING_CONFIRMATION';
                } else if (lastAiMsgWithOptions.options?.some(opt => opt.value === 'new_bet')) {
                    activeChatState = 'IDLE_AFTER_NO';
                } else {
                    activeChatState = 'AWAITING_AMOUNT';
                }
            } else {
                activeChatState = 'AWAITING_AMOUNT'; 
            }
        }
        setChatState(activeChatState);

      } catch (e) {
        console.error("Failed to parse chat messages from localStorage", e);
        setMessages([]);
        setChatState('GREETING');
      }
    } else {
      setMessages([]);
      setChatState('GREETING');
    }

    if (storedBetAmount) {
      try {
        const parsedAmount = JSON.parse(storedBetAmount);
        if (typeof parsedAmount === 'number') {
            setCurrentBetAmount(parsedAmount);
        } else {
            setCurrentBetAmount(null);
        }
      } catch (e) {
        console.error("Failed to parse current bet amount from localStorage", e);
        setCurrentBetAmount(null);
      }
    }
    setIsRestored(true);
  }, []);


  useEffect(() => {
    if (isRestored) {
      const messagesToSave = messages.filter(m => !m.isLoading);
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messagesToSave));
    }
  }, [messages, isRestored]);

  useEffect(() => {
    if (isRestored) {
      localStorage.setItem(CHAT_STATE_KEY, chatState);
    }
  }, [chatState, isRestored]);

  useEffect(() => {
    if (isRestored) {
      localStorage.setItem(CHAT_BET_AMOUNT_KEY, JSON.stringify(currentBetAmount));
    }
  }, [currentBetAmount, isRestored]);

  useEffect(() => {
    if (user && balance !== undefined && isRestored) {
      if (messages.length === 0 && chatState === 'GREETING') {
        setIsAiTyping(true);
        addMessage('ai', undefined, undefined, undefined, true);
        chatBotWelcomeMessage({ userName: user.name, walletBalance: balance })
          .then(response => {
            setMessages(prev => prev.filter(m => !m.isLoading));
            addMessage('ai', `${response.welcomeMessage} ${response.initialQuestion}`, undefined, [
              {label: "50€", value: "50"},
              {label: "100€", value: "100"},
              {label: "200€", value: "200"}
            ]);
            setChatState('AWAITING_AMOUNT');
          })
          .catch(error => {
            console.error("Error getting welcome message:", error);
            setMessages(prev => prev.filter(m => !m.isLoading));
            addMessage('ai', "Sorry, I'm having trouble starting up. Please try again later.");
            setChatState('ERROR_GENERIC');
          })
          .finally(() => setIsAiTyping(false));
      }
    }
  }, [user, balance, addMessage, messages.length, chatState, isRestored]);


  const handleHumanMessage = async (userInput: string | { label: string; value: string }) => {
    let humanMessageText: string;
    let actionValue: string;

    if (typeof userInput === 'string') {
      humanMessageText = userInput;
      actionValue = userInput;
    } else {
      humanMessageText = userInput.label;
      actionValue = userInput.value;
    }

    addMessage('human', humanMessageText);
    setIsAiTyping(true);
    setMessages(prev => {
        if (prev.length > 0 && prev[prev.length -1].isLoading && prev[prev.length-1].sender === 'ai') {
            return prev;
        }
        return [...prev, { id: uuidv4(), sender: 'ai', isLoading: true, timestamp: new Date().toISOString() } as ChatMessageType];
    });


    const removeAiTypingPlaceholder = () => {
      setMessages(prev => prev.filter(m => !(m.isLoading && m.sender === 'ai')));
      setIsAiTyping(false);
    };

    switch (chatState) {
      case 'AWAITING_AMOUNT':
        const amount = parseFloat(actionValue);
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
           setChatState('ERROR_BALANCE');
        } else {
          setCurrentBetAmount(amount);
          setChatState('PROCESSING_AMOUNT');
          try {
            const strategy = await generateBettingStrategy({ walletBalance: balance, betAmount: amount });
            removeAiTypingPlaceholder();
            addMessage('ai', `Here's a strategy for your ${amount}€ bet:`, strategy, [{label: "Yes, place bets", value: "yes"}, {label: "No, thanks", value: "no"}]);
            setChatState('AWAITING_CONFIRMATION');
          } catch (error) {
            console.error("Error generating strategy:", error);
            removeAiTypingPlaceholder();
            addMessage('ai', "Sorry, I couldn't generate a strategy right now. Please try again.");
            setChatState('AWAITING_AMOUNT');
            setCurrentBetAmount(null);
          }
        }
        break;

      case 'AWAITING_CONFIRMATION':
        if (actionValue.toLowerCase() === 'yes') {
          if (user?.plan === 'premium') {
            setChatState('PROCESSING_BET');

            const strategyMessage = [...messages].reverse().find(msg => msg.sender === 'ai' && msg.strategy);

            if (!strategyMessage || !strategyMessage.strategy || typeof currentBetAmount !== 'number') {
              removeAiTypingPlaceholder();
              addMessage('ai', "Sorry, there was an issue processing your bet. Could not retrieve strategy details or bet amount. Please try stating your bet amount again.");
              setChatState('AWAITING_AMOUNT');
              setCurrentBetAmount(null);
              return;
            }

            const betsToPlace: SuggestedBet[] = strategyMessage.strategy.suggestedBets;
            
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
            const year = today.getFullYear();
            const formattedBetDate = `${day}/${month}/${year}`;

            setTimeout(() => {
              try {
                betsToPlace.forEach(suggestedBet => {
                  const newBet: Bet = {
                    id: uuidv4(),
                    gameDate: suggestedBet.gameDate,
                    homeTeam: suggestedBet.homeTeam,
                    awayTeam: suggestedBet.awayTeam,
                    betAmount: suggestedBet.betAmount,
                    odds: suggestedBet.odds,
                    house: suggestedBet.house,
                    betWinnerTeam: suggestedBet.betWinnerTeam,
                    betResult: 'pending',
                    betDate: formattedBetDate,
                  };
                  addBet(newBet);
                });

                const newBalance = balance - currentBetAmount;
                updateBalance(newBalance);

                removeAiTypingPlaceholder();
                addMessage('ai', `Bets placed for a total of ${currentBetAmount.toFixed(2)}€! Your new balance is ${newBalance.toFixed(2)}€. Good luck! What's next?`, undefined, [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
                toast({ title: "Bets Placed!", description: `Your ${currentBetAmount.toFixed(2)}€ bet strategy has been successfully placed.` });
                setChatState('IDLE_AFTER_NO');
                setCurrentBetAmount(null);
              } catch (e) {
                console.error("Error during bet placement simulation:", e);
                removeAiTypingPlaceholder();
                addMessage('ai', "An unexpected error occurred while placing your bets. Please try again.");
                setChatState('AWAITING_AMOUNT'); 
                setCurrentBetAmount(null);
              }
            }, 1500);
          } else {
            removeAiTypingPlaceholder();
            addMessage('ai', "Placing bets is a Premium feature. Please upgrade your plan in your Profile to proceed.", undefined, [{label: "Go to Profile", value: "profile"}, {label: "Maybe later", value: "later"}]);
            setChatState('PROMPT_PREMIUM');
          }
        } else if (actionValue.toLowerCase() === 'no') {
          removeAiTypingPlaceholder();
          addMessage('ai', "Okay, no problem. Is there anything else I can help you with today?", undefined, [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
          setChatState('IDLE_AFTER_NO');
          setCurrentBetAmount(null);
        } else {
          removeAiTypingPlaceholder();
          addMessage('ai', "Please answer with 'Yes' or 'No'.", undefined, [{label: "Yes, place bets", value: "yes"}, {label: "No, thanks", value: "no"}]);
        }
        break;

      case 'PROMPT_PREMIUM':
        removeAiTypingPlaceholder();
        if (actionValue.toLowerCase() === 'profile') {
          addMessage('ai', "Great! Taking you to your profile now.");
          toast({ title: "Redirecting to Profile..."});
          setTimeout(() => window.location.pathname = '/profile', 500);
        } else {
          addMessage('ai', "Alright. Let me know if you change your mind or need help with something else!", undefined, [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
        }
        setChatState('IDLE_AFTER_NO');
        break;

      case 'IDLE_AFTER_NO':
         if (actionValue.toLowerCase() === 'new_bet' && user) {
           try {
            setIsAiTyping(true);
            setMessages(prev => { 
              if (!prev.some(m => m.isLoading && m.sender === 'ai')) {
                return [...prev, { id: uuidv4(), sender: 'ai', isLoading: true, timestamp: new Date().toISOString() } as ChatMessageType];
              }
              return prev;
            });
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
            setChatState('IDLE_AFTER_NO'); 
          }
        } else if (actionValue.toLowerCase() === 'end_chat') {
          removeAiTypingPlaceholder();
          addMessage('ai', "Thanks for using BetMaestro! Have a great day. Feel free to ask if anything else comes up.");
          setChatState('IDLE_AFTER_NO'); 
        } else {
          removeAiTypingPlaceholder();
          addMessage('ai', "Sorry, I didn't quite get that. Please choose an option or type 'new bet'.", undefined,  [{label: "Start new bet", value:"new_bet"}, {label: "No, that's all", value:"end_chat"}]);
        }
        break;
      case 'ERROR_BALANCE':
         const newAmountBalanceError = parseFloat(actionValue);
         if (!isNaN(newAmountBalanceError) && newAmountBalanceError > 0) {
            setChatState('AWAITING_AMOUNT'); 
            await handleHumanMessage(userInput); 
         } else {
            removeAiTypingPlaceholder();
            addMessage('ai', "Please enter a valid positive number for your bet amount or choose an option.", undefined, [
                {label: "50€", value: "50"}, {label: "100€", value: "100"}, {label: "200€", value: "200"}
            ]);
         }
        break;

      default:
        removeAiTypingPlaceholder();
        if (user) {
            addMessage('ai', "I'm not sure how to handle that. Let's try starting over. How much would you like to bet?", undefined, [
                {label: "50€", value: "50"}, {label: "100€", value: "100"}, {label: "200€", value: "200"}
            ]);
            setChatState('AWAITING_AMOUNT');
        } else {
            addMessage('ai', "Sorry, something went wrong. Please try refreshing the page.");
            setChatState('ERROR_GENERIC');
        }
        break;
    }
  };

  const getInputPlaceholder = () => {
    if (messages.some(m => m.isLoading && m.sender === 'ai')) return "Waiting for BetMaestro...";
    if (chatState === 'AWAITING_AMOUNT' || chatState === 'ERROR_BALANCE') return "Enter bet amount or choose an option";
    if (chatState === 'AWAITING_CONFIRMATION' || chatState === 'PROMPT_PREMIUM' || chatState === 'IDLE_AFTER_NO') return "Choose an option or type your response";
    return "Type your message...";
  }

  const isInputDisabled = () => {
    if (messages.some(m => m.isLoading && m.sender === 'ai')) return true;
    if (!user || balance === undefined || !isRestored) return true;

    const nonInputStates: ChatState[] = ['GREETING', 'PROCESSING_AMOUNT', 'PROCESSING_BET', 'ERROR_GENERIC'];
    if (nonInputStates.includes(chatState)) return true;
    
    // if (chatState === 'IDLE_AFTER_NO') return false; // This was problematic, now handled by default case

    return false;
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem-1px)] max-h-[calc(100dvh-4rem-1px)] bg-background rounded-lg shadow-lg overflow-hidden">
      <ScrollArea className="flex-grow px-4" ref={scrollAreaRef}>
        {messages.map((msg, index) => (
          <ChatMessage key={msg.id} message={msg} onOptionClick={handleHumanMessage} isFirstInList={index === 0 && msg.sender === 'ai'} />
        ))}
      </ScrollArea>
      <ChatInput
        onSendMessage={handleHumanMessage}
        disabled={isInputDisabled()}
        placeholder={getInputPlaceholder()}
      />
    </div>
  );
};

export default Chatbot;
