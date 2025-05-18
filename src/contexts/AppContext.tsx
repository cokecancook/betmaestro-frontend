
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Bet, DummyData } from '@/types';
import dummyDataJson from '@/data/dummy.json'; // Import as a module

interface AppContextType {
  user: User | null;
  balance: number;
  placedBets: Bet[];
  isLoggedIn: boolean;
  useDummyData: boolean;
  isLoading: boolean;
  login: (preview?: boolean) => Promise<void>;
  logout: () => void;
  addBet: (bet: Bet) => void;
  rechargeWallet: (amount: number) => void;
  setPlan: (plan: 'basic' | 'premium') => void;
  updateBalance: (newBalance: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CHAT_MESSAGES_KEY = 'betMaestroChatMessages';
const CHAT_STATE_KEY = 'betMaestroChatState';
const CHAT_BET_AMOUNT_KEY = 'betMaestroCurrentBetAmount';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [placedBets, setPlacedBets] = useState<Bet[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [useDummyData, setUseDummyData] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true for initial check
  const router = useRouter();

  useEffect(() => {
    // Check for persisted login state (e.g., from localStorage)
    const persistedLogin = localStorage.getItem('betMaestroLoggedIn');
    const persistedDummy = localStorage.getItem('betMaestroUseDummy');
    if (persistedLogin === 'true') {
      const isDummy = persistedDummy === 'true';
      setUseDummyData(isDummy);
      if (isDummy) {
        const data: DummyData = dummyDataJson;
        setUser(data.user);
        setBalance(data.balance);
        setPlacedBets(data.placedBets);
      } else {
        // For non-dummy, set some default or fetch actual user data
        setUser({ id: 'default-user', name: 'User', plan: 'basic' });
        setBalance(1000); // Default balance for non-dummy
        setPlacedBets([]);
      }
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const clearChatStateFromLocalStorage = () => {
    localStorage.removeItem(CHAT_MESSAGES_KEY);
    localStorage.removeItem(CHAT_STATE_KEY);
    localStorage.removeItem(CHAT_BET_AMOUNT_KEY);
  };

  const login = useCallback(async (preview: boolean = false) => {
    setIsLoading(true);
    clearChatStateFromLocalStorage(); // Clear chat state on new login

    if (preview) {
      const data: DummyData = dummyDataJson;
      setUser(data.user);
      setBalance(data.balance);
      setPlacedBets(data.placedBets);
      setUseDummyData(true);
      localStorage.setItem('betMaestroUseDummy', 'true');
    } else {
      // Simulate non-dummy login
      setUser({ id: 'real-user', name: 'Real User', plan: 'basic' });
      setBalance(500); // Initial balance for real user
      setPlacedBets([]);
      setUseDummyData(false);
      localStorage.setItem('betMaestroUseDummy', 'false');
    }
    setIsLoggedIn(true);
    localStorage.setItem('betMaestroLoggedIn', 'true');
    setIsLoading(false);
    router.push('/landing');
  }, [router]);

  const logout = useCallback(() => {
    setIsLoading(true);
    clearChatStateFromLocalStorage(); // Clear chat state on logout

    setUser(null);
    setBalance(0);
    setPlacedBets([]);
    setIsLoggedIn(false);
    setUseDummyData(false);
    localStorage.removeItem('betMaestroLoggedIn');
    localStorage.removeItem('betMaestroUseDummy');
    setIsLoading(false);
    router.push('/login');
  }, [router]);

  const addBet = (bet: Bet) => {
    setPlacedBets(prevBets => [...prevBets, bet]);
    // In a real app, this would also update the backend
  };

  const rechargeWallet = (amount: number) => {
    setBalance(prevBalance => prevBalance + amount);
  };
  
  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  const setPlan = (plan: 'basic' | 'premium') => {
    if (user) {
      setUser({ ...user, plan });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        balance,
        placedBets,
        isLoggedIn,
        useDummyData,
        isLoading,
        login,
        logout,
        addBet,
        rechargeWallet,
        setPlan,
        updateBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
