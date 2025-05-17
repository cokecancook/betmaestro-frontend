import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-past-bets.ts';
import '@/ai/flows/chatbot-welcome-message.ts';
import '@/ai/flows/generate-betting-strategy.ts';