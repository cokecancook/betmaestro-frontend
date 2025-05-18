
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
import type { SuggestedBet, GenerateBettingStrategyOutput as OutputType } from '@/types';

const GenerateBettingStrategyInputSchema = z.object({
  walletBalance: z
    .number()
    .describe('The user\'s current wallet balance in EUR.'),
  betAmount: z
    .number()
    .describe('The amount the user wants to bet in EUR.'),
});
export type GenerateBettingStrategyInput = z.infer<typeof GenerateBettingStrategyInputSchema>;

const SuggestedBetSchema = z.object({
  gameDate: z.string().describe('The date of the game (DD/MM/YYYY).'),
  homeTeam: z.string().describe('The home team name.'),
  awayTeam: z.string().describe('The away team name.'),
  betAmount: z.number().describe('The amount suggested to bet on this specific outcome in EUR.'),
  odds: z.number().describe('The odds for this specific bet.'),
  house: z.string().describe('The betting house for this specific bet.'),
  betWinnerTeam: z.string().describe('The team suggested to win for this bet.'),
  justification: z.string().describe('The justification for suggesting this bet.'),
});

const GenerateBettingStrategyOutputSchema = z.object({
  strategyDescription: z.string().describe('A detailed betting strategy based on the provided wallet balance and bet amount, focusing on the specified game and betting on the Pacers.'),
  suggestedBets: z.array(SuggestedBetSchema).describe('An array of 3 suggested bets for the specified game, each with a different house and justification, focused on the Pacers winning, and summing up to the total bet amount.'),
  riskAssessment: z.string().describe('An assessment of the risk associated with betting on the Pacers for the specified game.'),
});
export type GenerateBettingStrategyOutput = z.infer<typeof GenerateBettingStrategyOutputSchema>;


export async function generateBettingStrategy(input: GenerateBettingStrategyInput): Promise<OutputType> {
  return generateBettingStrategyFlow(input);
}

const generateBettingStrategyFlow = ai.defineFlow(
  {
    name: 'generateBettingStrategyFlow',
    inputSchema: GenerateBettingStrategyInputSchema,
    outputSchema: GenerateBettingStrategyOutputSchema,
  },
  async (input: GenerateBettingStrategyInput): Promise<GenerateBettingStrategyOutput> => {
    const totalBetAmount = input.betAmount;
    const gameDate = "22/05/2025";
    const homeTeam = "New York Knicks";
    const awayTeam = "Indiana Pacers";
    const betOnTeam = "Indiana Pacers";

    // Distribute the bet amount
    let bet1Amount = Math.floor(totalBetAmount / 3);
    let bet2Amount = Math.floor(totalBetAmount / 3);
    let bet3Amount = totalBetAmount - bet1Amount - bet2Amount;

    // Ensure no bet amount is zero if totalBetAmount is very small but positive
    // This logic can be refined for very small amounts, but for typical bets it should work.
    if (totalBetAmount > 0 && bet1Amount === 0) bet1Amount = totalBetAmount; // Put all on one bet if too small for 3.
    if (bet1Amount > 0 && bet2Amount === 0 && bet3Amount === 0 && bet1Amount !== totalBetAmount ) { // if only bet1 got amount
        bet2Amount = Math.floor(bet1Amount / 2);
        bet1Amount = bet1Amount - bet2Amount;
        if (bet1Amount + bet2Amount !== totalBetAmount) { // adjust if needed
           const diff = totalBetAmount - (bet1Amount+bet2Amount);
           bet1Amount += diff;
        }
    }
     if (bet1Amount <= 0 && bet2Amount <=0 && bet3Amount <= 0 && totalBetAmount > 0) {
        bet1Amount = totalBetAmount; // failsafe
    }


    const suggestedBets: SuggestedBet[] = [];

    if (bet1Amount > 0) {
        suggestedBets.push({
          gameDate, homeTeam, awayTeam,
          betAmount: bet1Amount,
          odds: 2.50, // Dummy odds
          house: "bet365",
          betWinnerTeam: betOnTeam,
          justification: "Pacers have a strong offensive lineup that could challenge the Knicks, especially if their key players are in form. bet365 offers competitive odds."
        });
    }
    if (bet2Amount > 0) {
        suggestedBets.push({
          gameDate, homeTeam, awayTeam,
          betAmount: bet2Amount,
          odds: 2.65, // Dummy odds
          house: "Betfair",
          betWinnerTeam: betOnTeam,
          justification: "Betfair Exchange often provides value on underdog moneyline bets. Pacers' pace could disrupt the Knicks' rhythm."
        });
    }
     if (bet3Amount > 0 && suggestedBets.length < 3) {
        suggestedBets.push({
          gameDate, homeTeam, awayTeam,
          betAmount: bet3Amount,
          odds: 2.40, // Dummy odds
          house: "Betway",
          betWinnerTeam: betOnTeam,
          justification: "Consider diversifying with Betway. The Pacers have shown resilience in away games against tough opponents this season."
        });
    }
    // If totalBetAmount was small and resulted in less than 3 bets, fill remaining slots if needed or adjust logic above.
    // For this dummy, we'll ensure we have at least one bet if totalBetAmount > 0.

    return {
      strategyDescription: `This dummy strategy focuses on betting on the Indiana Pacers to win against the New York Knicks on ${gameDate}. The total bet of ${totalBetAmount}€ has been distributed across different houses to potentially maximize returns. Remember, betting on an away team can be risky.`,
      suggestedBets,
      riskAssessment: `Medium to High Risk. Betting on the Indiana Pacers as the away team against the Knicks involves significant risk. The Knicks are typically strong at home. However, the potential returns are higher. Evaluate team news and player availability before confirming.`,
    };
  }
);
