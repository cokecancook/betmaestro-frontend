
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback }
  from 'react';
import { useRouter } from 'next/navigation';
import type { User, Bet, DummyData } from '@/types';
import dummyDataJson from '@/data/dummy.json'; // Import as a module

type Theme = 'light' | 'dark';

interface AppContextType {
  user: User | null;
  balance: number;
  placedBets: Bet[];
  isLoggedIn: boolean;
  useDummyData: boolean;
  isLoading: boolean;
  theme: Theme;
  login: (preview?: boolean) => Promise<void>;
  logout: () => void;
  addBet: (bet: Bet) => void;
  rechargeWallet: (amount: number) => void;
  setPlan: (plan: 'basic' | 'premium') => void;
  updateBalance: (newBalance: number) => void;
  setTheme: (theme: Theme) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CHAT_MESSAGES_KEY = 'betMaestroChatMessages';
const CHAT_STATE_KEY = 'betMaestroChatState';
const CHAT_BET_AMOUNT_KEY = 'betMaestroCurrentBetAmount';
const THEME_KEY = 'betMaestroTheme';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [placedBets, setPlacedBets] = useState<Bet[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [useDummyData, setUseDummyData] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setThemeState] = useState<Theme>('light');
  const router = useRouter();

  useEffect(() => {
    const persistedLogin = localStorage.getItem('betMaestroLoggedIn');
    const persistedDummy = localStorage.getItem('betMaestroUseDummy');
    const persistedTheme = localStorage.getItem(THEME_KEY) as Theme | null;

    if (persistedTheme) {
      setThemeState(persistedTheme);
      if (persistedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } else {
        // If no theme is persisted, check system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = prefersDark ? 'dark' : 'light';
        setThemeState(initialTheme);
        localStorage.setItem(THEME_KEY, initialTheme);
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    }


    if (persistedLogin === 'true') {
      const isDummy = persistedDummy === 'true';
      setUseDummyData(isDummy);
      if (isDummy) {
        const data: DummyData = dummyDataJson;
        setUser(data.user);
        setBalance(data.balance);
        setPlacedBets(data.placedBets);
      } else {
        setUser({ id: 'default-user', name: 'User', plan: 'basic' });
        setBalance(1000);
        setPlacedBets([]);
      }
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const clearChatStateFromLocalStorage = () => {
    localStorage.removeItem(CHAT_MESSAGES_KEY);
    localStorage.removeItem(CHAT_STATE_KEY);
    localStorage.removeItem(CHAT_BET_AMOUNT_KEY);
  };

  const login = useCallback(async (preview: boolean = false) => {
    setIsLoading(true);
    clearChatStateFromLocalStorage();

    if (preview) {
      const data: DummyData = dummyDataJson;
      setUser(data.user);
      setBalance(data.balance);
      setPlacedBets(data.placedBets);
      setUseDummyData(true);
      localStorage.setItem('betMaestroUseDummy', 'true');
    } else {
      setUser({ id: 'real-user', name: 'Real User', plan: 'basic' });
      setBalance(500);
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
    clearChatStateFromLocalStorage();

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
        theme,
        login,
        logout,
        addBet,
        rechargeWallet,
        setPlan,
        updateBalance,
        setTheme,
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
