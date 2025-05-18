
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

// The prompt definition can remain, but it won't be used by the flow below.
// const prompt = ai.definePrompt({
//   name: 'generateBettingStrategyPrompt',
//   input: {schema: GenerateBettingStrategyInputSchema},
//   output: {schema: GenerateBettingStrategyOutputSchema},
//   prompt: `You are an expert betting strategy advisor.
// Your task is to provide a detailed betting strategy for the upcoming basketball game: New York Knicks vs Indiana Pacers on 22/05/2025.
// The user's current wallet balance is {{{walletBalance}}} EUR and they are considering a bet amount of {{{betAmount}}} EUR.

// Your strategy must include:
// 1.  A general 'strategyDescription' for approaching this game, considering the user's balance and bet amount.
// 2.  A list of 3 specific 'suggestedBets' for this game.
//     *   Each bet MUST be with a different betting house.
//     *   You MUST choose these houses ONLY from the following list: "bet365", "Betfair", "Betway", "bwin", "DAZN", "888sport", "Bet442".
//     *   For each suggested bet, provide a clear justification. Format each suggestion clearly (e.g., "Bet on [Team/Outcome] with [House] because [Justification]. If possible, mention potential odds or value.").
// 3.  A 'riskAssessment' for these suggested bets.

// User's Wallet Balance: {{{walletBalance}}} EUR
// User's Bet Amount: {{{betAmount}}} EUR
// Game: New York Knicks vs Indiana Pacers
// Date: 22/05/2025
// Available Betting Houses for suggestions: "bet365", "Betfair", "Betway", "bwin", "DAZN", "888sport", "Bet442".`,
// });

const generateBettingStrategyFlow = ai.defineFlow(
  {
    name: 'generateBettingStrategyFlow',
    inputSchema: GenerateBettingStrategyInputSchema,
    outputSchema: GenerateBettingStrategyOutputSchema,
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (input: GenerateBettingStrategyInput): Promise<GenerateBettingStrategyOutput> => {
    // Return a hardcoded dummy strategy
    return {
      strategyDescription: "This dummy strategy focuses on diversifying bets across different outcomes and houses for the New York Knicks vs Indiana Pacers game on 22/05/2025. Consider your overall bankroll before placing these bets.",
      suggestedBets: [
        "Bet on New York Knicks to win with bet365. Justification: Knicks have shown strong home-court performance recently and this is a dummy bet for testing purposes.",
        "Bet on Over 220.5 total points with Betfair. Justification: Both teams have high-scoring tendencies and this is a placeholder suggestion for the Knicks vs Pacers game.",
        "Bet on Indiana Pacers +5.5 point spread with Betway. Justification: Pacers are strong underdogs and covering the spread is a plausible outcome for this simulated scenario."
      ],
      riskAssessment: "This is a dummy risk assessment for the Knicks vs Pacers game. All betting involves risk. Please bet responsibly.",
    };
  }
);

