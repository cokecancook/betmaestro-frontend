
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback }
  from 'react';
import { useRouter } from 'next/navigation';
import type { User, Bet, DummyData } from '@/types';
import dummyDataJson from '@/data/dummy.json'; // Import as a module

type Theme = 'light' | 'dark';

const PROFILE_IMAGE_STORAGE_KEY = 'betMaestroProfileImage';
const REAL_USER_BALANCE_KEY = 'betMaestroRealUserBalance'; // Key for real user balance

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
    // Ensure localStorage reflects the default only if not set, or set it if different
    const sessionTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    if (sessionTheme !== initialTheme) {
        localStorage.setItem(THEME_KEY, initialTheme);
    }
    document.documentElement.classList.add('dark');

    if (sessionTheme && sessionTheme !== initialTheme) {
        setThemeState(sessionTheme);
        if (sessionTheme === 'light') {
            document.documentElement.classList.remove('dark');
        }
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
        const realUserName = localStorage.getItem('betMaestroUserName') || 'Test User'; // Updated default name
        setUser({ id: 'test-user', name: realUserName, plan: 'basic' }); // Updated user ID
        const storedRealUserBalance = localStorage.getItem(REAL_USER_BALANCE_KEY);
        if (storedRealUserBalance) {
          setBalance(parseFloat(storedRealUserBalance));
        } else {
          // Default to 500 if not found (e.g., first login, or localStorage cleared)
          setBalance(500);
          localStorage.setItem(REAL_USER_BALANCE_KEY, '500'); 
        }
        // For now, test user bets are not persisted, could add later if needed
        const storedTestUserBets = localStorage.getItem('betMaestroTestUserBets');
        if (storedTestUserBets) {
            setPlacedBets(sortBetsByGameDateDesc(JSON.parse(storedTestUserBets)));
        } else {
            setPlacedBets([]);
        }
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
      // Attempt to load a specific profile image for the dummy user if one was set
      const dummyUserProfileImage = localStorage.getItem(`${PROFILE_IMAGE_STORAGE_KEY}_${data.user.id}`);
      setProfileImageState(dummyUserProfileImage);

    } else {
      loggedInUserName = 'Test User'; // Updated display name
      setUser({ id: 'test-user', name: loggedInUserName, plan: 'basic' }); // Updated user ID and name
      setBalance(500); 
      localStorage.setItem(REAL_USER_BALANCE_KEY, '500');
      setPlacedBets([]); 
      localStorage.setItem('betMaestroTestUserBets', JSON.stringify([]));
      setUseDummyData(false);
      localStorage.setItem('betMaestroUseDummy', 'false');
      // Load general profile image, or default if none set for this "test-user" session
      const testUserProfileImage = localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY); // This could be a shared image if not cleared on logout
      setProfileImageState(testUserProfileImage);
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
    // Potentially clear profile image on logout to prevent showing previous user's image,
    // or manage separate profile images per user ID if implementing multi-user.
    // For now, clearing it for a cleaner logout.
    setProfileImageState(null);
    localStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY); 

    localStorage.removeItem('betMaestroLoggedIn');
    localStorage.removeItem('betMaestroUseDummy');
    localStorage.removeItem('betMaestroUserName');
    localStorage.removeItem(REAL_USER_BALANCE_KEY);
    localStorage.removeItem('betMaestroTestUserBets');
    
    setIsLoading(false);
    router.push('/login');
  }, [router]);

  const addBet = (bet: Bet) => {
    setPlacedBets(prevBets => {
        const updatedBets = sortBetsByGameDateDesc([...prevBets, bet]);
        if(!useDummyData) {
            localStorage.setItem('betMaestroTestUserBets', JSON.stringify(updatedBets));
        }
        return updatedBets;
    });
  };

  const rechargeWallet = (amount: number) => {
    setBalance(prevBalance => {
      const newBalance = prevBalance + amount;
      if (!useDummyData) {
        localStorage.setItem(REAL_USER_BALANCE_KEY, newBalance.toString());
      }
      return newBalance;
    });
  };

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
    if (!useDummyData) {
      localStorage.setItem(REAL_USER_BALANCE_KEY, newBalance.toString());
    }
  };

  const setPlan = (plan: 'basic' | 'premium') => {
    if (user) {
      const updatedUser = { ...user, plan };
      setUser(updatedUser);
      if (!useDummyData) {
        // Persist plan change for test user if needed, e.g.,
        // localStorage.setItem('betMaestroTestUserPlan', plan);
      }
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
