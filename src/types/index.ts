
export interface User {
  id: string;
  name: string;
  plan: 'basic' | 'premium';
}

export interface Bet {
  id: string;
  gameDate: string;
  homeTeam: string;
  awayTeam: string;
  betAmount: number;
  odds: number;
  house?: string; // Added house as optional
  betWinnerTeam: string;
  betResult?: 'won' | 'lost' | 'pending';
  betGain?: number;
  betDate: string;
}

export interface DummyData {
  user: User;
  balance: number;
  placedBets: Bet[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'human';
  text?: string;
  strategy?: GenerateBettingStrategyOutput;
  options?: { label: string; value: string }[];
  isLoading?: boolean;
}

// Re-exporting AI flow types for easier access if needed in UI
export type { SummarizePastBetsInput, SummarizePastBetsOutput } from '@/ai/flows/summarize-past-bets';
export type { ChatBotWelcomeMessageInput, ChatBotWelcomeMessageOutput } from '@/ai/flows/chatbot-welcome-message';
export type { GenerateBettingStrategyInput, GenerateBettingStrategyOutput } from '@/ai/flows/generate-betting-strategy';

