
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback }
  from 'react';
import { useRouter } from 'next/navigation';
import type { User, Bet, DummyData } from '@/types';
import dummyDataJson from '@/data/dummy.json'; // Import as a module

type Theme = 'light' | 'dark';

const PROFILE_IMAGE_STORAGE_KEY = 'betMaestroProfileImage'; // Make key available

interface AppContextType {
  user: User | null;
  balance: number;
  placedBets: Bet[];
  isLoggedIn: boolean;
  useDummyData: boolean;
  isLoading: boolean;
  theme: Theme;
  profileImage: string | null;
  login: (preview?: boolean) => Promise<void>;
  logout: () => void;
  addBet: (bet: Bet) => void;
  rechargeWallet: (amount: number) => void;
  setPlan: (plan: 'basic' | 'premium') => void;
  updateBalance: (newBalance: number) => void;
  setTheme: (theme: Theme) => void;
  setProfileImage: (imageUrl: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CHAT_MESSAGES_KEY = 'betMaestroChatMessages';
const CHAT_STATE_KEY = 'betMaestroChatState';
const CHAT_BET_AMOUNT_KEY = 'betMaestroCurrentBetAmount';
const THEME_KEY = 'betMaestroTheme';

// Helper function to parse DD/MM/YYYY date string to Date object
const parseGameDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
};

// Helper function to sort bets by game date in descending order
const sortBetsByGameDateDesc = (bets: Bet[]): Bet[] => {
  return [...bets].sort((a, b) => {
    const dateA = parseGameDate(a.gameDate);
    const dateB = parseGameDate(b.gameDate);
    return dateB.getTime() - dateA.getTime();
  });
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [placedBets, setPlacedBets] = useState<Bet[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [useDummyData, setUseDummyData] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setThemeState] = useState<Theme>('dark');
  const [profileImage, setProfileImageState] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const persistedLogin = localStorage.getItem('betMaestroLoggedIn');
    const persistedDummy = localStorage.getItem('betMaestroUseDummy');
    const persistedProfileImage = localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY);

    const initialTheme: Theme = 'dark';
    setThemeState(initialTheme);
    localStorage.setItem(THEME_KEY, initialTheme);
    document.documentElement.classList.add('dark');

    const sessionTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    if (sessionTheme && sessionTheme !== initialTheme) {
        setThemeState(sessionTheme);
        if (sessionTheme === 'light') {
            document.documentElement.classList.remove('dark');
        }
    } else {
        document.documentElement.classList.add('dark');
    }


    if (persistedProfileImage) {
      setProfileImageState(persistedProfileImage);
    }


    if (persistedLogin === 'true') {
      const isDummy = persistedDummy === 'true';
      setUseDummyData(isDummy);
      if (isDummy) {
        const data: DummyData = dummyDataJson;
        setUser(data.user);
        setBalance(data.balance);
        setPlacedBets(sortBetsByGameDateDesc(data.placedBets));
      } else {
        const realUserName = localStorage.getItem('betMaestroUserName') || 'User';
        setUser({ id: 'default-user', name: realUserName, plan: 'basic' });
        setBalance(1000); 
        setPlacedBets([]); // Initially empty, will be sorted if bets are added
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

  const setProfileImage = (imageUrl: string | null) => {
    setProfileImageState(imageUrl);
    if (imageUrl) {
      localStorage.setItem(PROFILE_IMAGE_STORAGE_KEY, imageUrl);
    } else {
      localStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY);
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

    let loggedInUserName = 'User';
    if (preview) {
      const data: DummyData = dummyDataJson;
      setUser(data.user);
      setBalance(data.balance);
      setPlacedBets(sortBetsByGameDateDesc(data.placedBets));
      setUseDummyData(true);
      localStorage.setItem('betMaestroUseDummy', 'true');
      loggedInUserName = data.user.name;
      const dummyUserProfileImage = localStorage.getItem(`${PROFILE_IMAGE_STORAGE_KEY}_${data.user.id}`);
      setProfileImageState(dummyUserProfileImage);

    } else {
      loggedInUserName = 'Real User'; 
      setUser({ id: 'real-user', name: loggedInUserName, plan: 'basic' });
      setBalance(500); 
      setPlacedBets([]); // Initially empty, will be sorted if bets are added
      setUseDummyData(false);
      localStorage.setItem('betMaestroUseDummy', 'false');
      const realUserProfileImage = localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY);
      setProfileImageState(realUserProfileImage);
    }
    localStorage.setItem('betMaestroUserName', loggedInUserName);
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
    setProfileImageState(null);
    localStorage.removeItem('betMaestroLoggedIn');
    localStorage.removeItem('betMaestroUseDummy');
    localStorage.removeItem('betMaestroUserName');
    setIsLoading(false);
    router.push('/login');
  }, [router]);

  const addBet = (bet: Bet) => {
    setPlacedBets(prevBets => sortBetsByGameDateDesc([...prevBets, bet]));
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
        profileImage,
        login,
        logout,
        addBet,
        rechargeWallet,
        setPlan,
        updateBalance,
        setTheme,
        setProfileImage,
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
