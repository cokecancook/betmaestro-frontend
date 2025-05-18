
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
  profileImage: string | null; // Added
  login: (preview?: boolean) => Promise<void>;
  logout: () => void;
  addBet: (bet: Bet) => void;
  rechargeWallet: (amount: number) => void;
  setPlan: (plan: 'basic' | 'premium') => void;
  updateBalance: (newBalance: number) => void;
  setTheme: (theme: Theme) => void;
  setProfileImage: (imageUrl: string | null) => void; // Added
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
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to dark
  const [profileImage, setProfileImageState] = useState<string | null>(null); // Added state
  const router = useRouter();

  useEffect(() => {
    const persistedLogin = localStorage.getItem('betMaestroLoggedIn');
    const persistedDummy = localStorage.getItem('betMaestroUseDummy');
    const persistedProfileImage = localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY); // Load profile image

    // Always start with dark theme
    const initialTheme: Theme = 'dark';
    setThemeState(initialTheme);
    localStorage.setItem(THEME_KEY, initialTheme); // Save 'dark' as the initial stored theme
    document.documentElement.classList.add('dark');

    // If a theme was previously set by the user during this session and it's different, apply it
    const sessionTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    if (sessionTheme && sessionTheme !== initialTheme) {
        setThemeState(sessionTheme);
        if (sessionTheme === 'light') {
            document.documentElement.classList.remove('dark');
        }
    } else {
        // Ensure dark class if sessionTheme is dark or null (which defaults to our initialTheme of dark)
        document.documentElement.classList.add('dark');
    }


    if (persistedProfileImage) {
      setProfileImageState(persistedProfileImage); // Set initial profile image
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
        // For real users, if no specific user data is fetched, use a generic one
        const realUserName = localStorage.getItem('betMaestroUserName') || 'User';
        setUser({ id: 'default-user', name: realUserName, plan: 'basic' });
        setBalance(1000); // Default balance for a new real user
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

  const setProfileImage = (imageUrl: string | null) => { // Added function
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
      setPlacedBets(data.placedBets);
      setUseDummyData(true);
      localStorage.setItem('betMaestroUseDummy', 'true');
      loggedInUserName = data.user.name;
      // Load profile image for dummy user if they had one (though unlikely for a generic dummy.json)
      const dummyUserProfileImage = localStorage.getItem(`${PROFILE_IMAGE_STORAGE_KEY}_${data.user.id}`);
      setProfileImageState(dummyUserProfileImage);

    } else {
      // Potentially fetch user details here in a real app
      loggedInUserName = 'Real User'; // Example name
      setUser({ id: 'real-user', name: loggedInUserName, plan: 'basic' });
      setBalance(500); // Example balance
      setPlacedBets([]);
      setUseDummyData(false);
      localStorage.setItem('betMaestroUseDummy', 'false');
      // Load profile image for real user
      const realUserProfileImage = localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY); // General key for real user
      setProfileImageState(realUserProfileImage);
    }
    localStorage.setItem('betMaestroUserName', loggedInUserName); // Store name for reloads
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
    setProfileImageState(null); // Clear profile image on logout
    // Note: We keep PROFILE_IMAGE_STORAGE_KEY in localStorage intentionally
    // so it's remembered if the same user logs back in.
    // If you want it cleared per session, add: localStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY);
    localStorage.removeItem('betMaestroLoggedIn');
    localStorage.removeItem('betMaestroUseDummy');
    localStorage.removeItem('betMaestroUserName');
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
        profileImage, // Added
        login,
        logout,
        addBet,
        rechargeWallet,
        setPlan,
        updateBalance,
        setTheme,
        setProfileImage, // Added
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
