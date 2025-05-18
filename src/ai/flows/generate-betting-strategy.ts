
'use server';

/**
 * @fileOverview A betting strategy AI agent.
 *
 * - generateBettingStrategy - A function that handles the betting strategy generation process.
 * - GenerateBettingStrategyInput - The input type for the generateBettingStrategy function.
 * - GenerateBettingStrategyOutput - The return type for the generateBettingStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBettingStrategyInputSchema = z.object({
  walletBalance: z
    .number()
    .describe('The user\'s current wallet balance in EUR.'),
  betAmount: z
    .number()
    .describe('The amount the user wants to bet in EUR.'),
});
export type GenerateBettingStrategyInput = z.infer<typeof GenerateBettingStrategyInputSchema>;

const GenerateBettingStrategyOutputSchema = z.object({
  strategyDescription: z.string().describe('A detailed betting strategy based on the provided wallet balance and bet amount, focusing on the specified game.'),
  suggestedBets: z.array(z.string()).describe('An array of 3 suggested bets for the specified game, each with a different house and justification.'),
  riskAssessment: z.string().describe('An assessment of the risk associated with the generated betting strategy for the specified game.'),
});
export type GenerateBettingStrategyOutput = z.infer<typeof GenerateBettingStrategyOutputSchema>;

export async function generateBettingStrategy(input: GenerateBettingStrategyInput): Promise<GenerateBettingStrategyOutput> {
  return generateBettingStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBettingStrategyPrompt',
  input: {schema: GenerateBettingStrategyInputSchema},
  output: {schema: GenerateBettingStrategyOutputSchema},
  prompt: `You are an expert betting strategy advisor.
Your task is to provide a detailed betting strategy for the upcoming basketball game: New York Knicks vs Indiana Pacers on 22/05/2025.
The user's current wallet balance is {{{walletBalance}}} EUR and they are considering a bet amount of {{{betAmount}}} EUR.

Your strategy must include:
1.  A general 'strategyDescription' for approaching this game, considering the user's balance and bet amount.
2.  A list of 3 specific 'suggestedBets' for this game.
    *   Each bet MUST be with a different betting house.
    *   You MUST choose these houses ONLY from the following list: "bet365", "Betfair", "Betway", "bwin", "DAZN", "888sport", "Bet442".
    *   For each suggested bet, provide a clear justification. Format each suggestion clearly (e.g., "Bet on [Team/Outcome] with [House] because [Justification]. If possible, mention potential odds or value.").
3.  A 'riskAssessment' for these suggested bets.

User's Wallet Balance: {{{walletBalance}}} EUR
User's Bet Amount: {{{betAmount}}} EUR
Game: New York Knicks vs Indiana Pacers
Date: 22/05/2025
Available Betting Houses for suggestions: "bet365", "Betfair", "Betway", "bwin", "DAZN", "888sport", "Bet442".`,
});

const generateBettingStrategyFlow = ai.defineFlow(
  {
    name: 'generateBettingStrategyFlow',
    inputSchema: GenerateBettingStrategyInputSchema,
    outputSchema: GenerateBettingStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback if LLM fails to provide structured output
      console.error("Generate betting strategy flow did not receive expected output from prompt for input:", input);
      return {
        strategyDescription: "Could not generate a specific strategy at this time. Please consider general betting principles like bankroll management and researching team form.",
        suggestedBets: ["Unable to provide specific bets for Knicks vs Pacers right now."],
        riskAssessment: "Risk assessment unavailable.",
      };
    }
    return output;
  }
);

