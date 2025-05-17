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
  strategyDescription: z.string().describe('A detailed betting strategy based on the provided wallet balance and bet amount.'),
  suggestedBets: z.array(z.string()).describe('An array of suggested bets based on the generated strategy.'),
  riskAssessment: z.string().describe('An assessment of the risk associated with the generated betting strategy.'),
});
export type GenerateBettingStrategyOutput = z.infer<typeof GenerateBettingStrategyOutputSchema>;

export async function generateBettingStrategy(input: GenerateBettingStrategyInput): Promise<GenerateBettingStrategyOutput> {
  return generateBettingStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBettingStrategyPrompt',
  input: {schema: GenerateBettingStrategyInputSchema},
  output: {schema: GenerateBettingStrategyOutputSchema},
  prompt: `You are an expert betting strategy advisor. Based on the user's wallet balance and desired bet amount, provide a detailed betting strategy, suggest specific bets, and assess the risk associated with the strategy.

Wallet Balance: {{{walletBalance}}} EUR
Bet Amount: {{{betAmount}}} EUR`,
});

const generateBettingStrategyFlow = ai.defineFlow(
  {
    name: 'generateBettingStrategyFlow',
    inputSchema: GenerateBettingStrategyInputSchema,
    outputSchema: GenerateBettingStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
