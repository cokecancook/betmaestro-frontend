
'use server';

/**
 * @fileOverview A betting strategy AI agent.
 * This version fetches dummy betting suggestions from a JSON file.
 *
 * - generateBettingStrategy - A function that handles the betting strategy generation process.
 * - GenerateBettingStrategyInput - The input type for the generateBettingStrategy function.
 * - GenerateBettingStrategyOutput - The return type for the generateBettingStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { SuggestedBet, GenerateBettingStrategyOutput as OutputType } from '@/types';
import dummyBetSuggestionsData from '@/data/dummy-bet-strategy.json';

const GenerateBettingStrategyInputSchema = z.object({
  walletBalance: z
    .number()
    .describe('The user\'s current wallet balance in EUR.'),
  betAmount: z
    .number()
    .describe('The amount the user wants to bet in EUR.'),
});
export type GenerateBettingStrategyInput = z.infer<typeof GenerateBettingStrategyInputSchema>;

// This schema is used by the flow definition and should match the `SuggestedBet` type.
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
  suggestedBets: z.array(SuggestedBetSchema).describe('An array of up to 3 suggested bets for the specified game, each with a different house and justification, focused on the Pacers winning, and summing up to the total bet amount.'),
  riskAssessment: z.string().describe('An assessment of the risk associated with betting on the Pacers for the specified game.'),
});
export type GenerateBettingStrategyOutput = z.infer<typeof GenerateBettingStrategyOutputSchema>;


export async function generateBettingStrategy(input: GenerateBettingStrategyInput): Promise<OutputType> {
  return generateBettingStrategyFlow(input);
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
  }
  return newArray;
}

const generateBettingStrategyFlow = ai.defineFlow(
  {
    name: 'generateBettingStrategyFlow',
    inputSchema: GenerateBettingStrategyInputSchema,
    outputSchema: GenerateBettingStrategyOutputSchema,
  },
  async (input: GenerateBettingStrategyInput): Promise<GenerateBettingStrategyOutput> => {
    const allDummyBets: SuggestedBet[] = dummyBetSuggestionsData.bets as SuggestedBet[];
    const shuffledBets = shuffleArray(allDummyBets);
    
    // Select up to 3 bets
    const selectedRawBets = shuffledBets.slice(0, Math.min(3, shuffledBets.length));
    
    const totalBetAmount = input.betAmount;
    const finalSuggestedBets: SuggestedBet[] = [];

    if (selectedRawBets.length > 0 && totalBetAmount > 0) {
      if (selectedRawBets.length === 1) {
        finalSuggestedBets.push({ ...selectedRawBets[0], betAmount: totalBetAmount });
      } else if (selectedRawBets.length === 2) {
        const amount1 = Math.floor(totalBetAmount / 2);
        const amount2 = totalBetAmount - amount1;
        if (amount1 > 0) finalSuggestedBets.push({ ...selectedRawBets[0], betAmount: amount1 });
        // Ensure amount2 is only added if it's positive and there's a second bet to assign it to
        if (amount2 > 0 && selectedRawBets.length > 1) finalSuggestedBets.push({ ...selectedRawBets[1], betAmount: amount2 });
         // If amount1 took everything (e.g. total = 0.5, amount1 = 0, amount2 = 0.5), adjust
        if (finalSuggestedBets.length === 0 && amount2 > 0) { // Only amount2 was positive
             finalSuggestedBets.push({ ...selectedRawBets[0], betAmount: amount2 });
        } else if (finalSuggestedBets.length === 1 && finalSuggestedBets[0].betAmount === 0 && amount2 > 0) {
            finalSuggestedBets[0].betAmount = amount2;
        }


      } else { // 3 bets selected
        let amount1 = Math.floor(totalBetAmount / 3);
        let amount2 = Math.floor(totalBetAmount / 3);
        let amount3 = totalBetAmount - amount1 - amount2;

        // Handle cases where totalBetAmount is small (e.g., 1 or 2)
        if (totalBetAmount === 1) {
            amount1 = 1; amount2 = 0; amount3 = 0;
        } else if (totalBetAmount === 2) {
            amount1 = 1; amount2 = 1; amount3 = 0;
        }
        
        if (amount1 > 0) finalSuggestedBets.push({ ...selectedRawBets[0], betAmount: amount1 });
        if (amount2 > 0 && selectedRawBets.length > 1) finalSuggestedBets.push({ ...selectedRawBets[1], betAmount: amount2 });
        if (amount3 > 0 && selectedRawBets.length > 2) finalSuggestedBets.push({ ...selectedRawBets[2], betAmount: amount3 });
      }
    }
    
    // If, after distribution, finalSuggestedBets is empty but totalBetAmount was positive (e.g. due to rounding very small numbers)
    // assign the totalBetAmount to the first selectedRawBet if available.
    if (finalSuggestedBets.length === 0 && totalBetAmount > 0 && selectedRawBets.length > 0) {
        finalSuggestedBets.push({ ...selectedRawBets[0], betAmount: totalBetAmount });
    }
    
    // Ensure sum matches totalBetAmount, adjust the last bet if necessary and possible
    const currentSum = finalSuggestedBets.reduce((acc, bet) => acc + bet.betAmount, 0);
    if (currentSum !== totalBetAmount && finalSuggestedBets.length > 0) {
        const difference = totalBetAmount - currentSum;
        finalSuggestedBets[finalSuggestedBets.length - 1].betAmount += difference;
        // Ensure the last bet amount is not negative after adjustment
        if (finalSuggestedBets[finalSuggestedBets.length-1].betAmount < 0) {
            // This case should ideally not happen with proper distribution, but as a safeguard:
            // Re-evaluate or simplify, e.g. put all on first bet if complex adjustment fails.
            // For simplicity here, we'll assume positive amounts or single bet assignment handles it.
        }
    }
     // Filter out any bets that might have ended up with a zero or negative amount after all adjustments.
    const trulyFinalBets = finalSuggestedBets.filter(bet => bet.betAmount > 0);


    const gameDateForDesc = trulyFinalBets.length > 0 ? trulyFinalBets[0].gameDate : "the upcoming game";
    const numBetsForDesc = trulyFinalBets.length;

    return {
      strategyDescription: `This betting strategy for the Knicks vs Pacers game on ${gameDateForDesc} focuses on the Indiana Pacers. Your total bet of ${totalBetAmount.toFixed(2)}€ is distributed across ${numBetsForDesc} randomly selected suggestion(s).`,
      suggestedBets: trulyFinalBets,
      riskAssessment: `This is a diversified strategy based on randomly selected dummy bets. All betting involves risk. Please bet responsibly. Odds and justifications are for illustrative purposes. Each bet is on the Indiana Pacers to win.`,
    };
  }
);

