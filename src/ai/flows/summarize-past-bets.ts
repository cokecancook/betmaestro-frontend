'use server';

/**
 * @fileOverview Summarizes a user's past betting history to identify trends, successes, and areas for improvement.
 *
 * - summarizePastBets - A function that takes a user's betting history and returns a summary.
 * - SummarizePastBetsInput - The input type for the summarizePastBets function.
 * - SummarizePastBetsOutput - The return type for the summarizePastBets function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePastBetsInputSchema = z.object({
  bettingHistory: z
    .string()
    .describe('A string containing the user\'s past betting history.'),
});
export type SummarizePastBetsInput = z.infer<typeof SummarizePastBetsInputSchema>;

const SummarizePastBetsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the user\'s past betting history, including trends, successes, and areas for improvement.'
    ),
});
export type SummarizePastBetsOutput = z.infer<typeof SummarizePastBetsOutputSchema>;

export async function summarizePastBets(input: SummarizePastBetsInput): Promise<SummarizePastBetsOutput> {
  return summarizePastBetsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePastBetsPrompt',
  input: {schema: SummarizePastBetsInputSchema},
  output: {schema: SummarizePastBetsOutputSchema},
  prompt: `You are an expert betting analyst. You will be provided with a user's past betting history. You will analyze the history and provide a summary of the user's betting trends, successes, and areas for improvement.

Betting History: {{{bettingHistory}}}`,
});

const summarizePastBetsFlow = ai.defineFlow(
  {
    name: 'summarizePastBetsFlow',
    inputSchema: SummarizePastBetsInputSchema,
    outputSchema: SummarizePastBetsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
