// src/ai/flows/chatbot-welcome-message.ts
'use server';

/**
 * @fileOverview A chatbot flow that greets the user and asks for the bet amount.
 *
 * - chatBotWelcomeMessage - A function that initiates the chatbot welcome message.
 * - ChatBotWelcomeMessageInput - The input type for the chatBotWelcomeMessage function.
 * - ChatBotWelcomeMessageOutput - The return type for the chatBotWelcomeMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatBotWelcomeMessageInputSchema = z.object({
  userName: z.string().describe('The name of the user.'),
  walletBalance: z.number().describe('The current wallet balance of the user.'),
});
export type ChatBotWelcomeMessageInput = z.infer<typeof ChatBotWelcomeMessageInputSchema>;

const ChatBotWelcomeMessageOutputSchema = z.object({
  welcomeMessage: z.string().describe('The personalized welcome message for the user.'),
  initialQuestion: z.string().describe('The initial question about the bet amount.'),
});
export type ChatBotWelcomeMessageOutput = z.infer<typeof ChatBotWelcomeMessageOutputSchema>;

export async function chatBotWelcomeMessage(input: ChatBotWelcomeMessageInput): Promise<ChatBotWelcomeMessageOutput> {
  return chatBotWelcomeMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatBotWelcomeMessagePrompt',
  input: {schema: ChatBotWelcomeMessageInputSchema},
  output: {schema: ChatBotWelcomeMessageOutputSchema},
  prompt: `Welcome, {{{userName}}}! Your current wallet balance is ${{{walletBalance}}}. How much would you like to bet today?`,
});

const chatBotWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'chatBotWelcomeMessageFlow',
    inputSchema: ChatBotWelcomeMessageInputSchema,
    outputSchema: ChatBotWelcomeMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt({
      ...input,
    });
    return {
      welcomeMessage: `Welcome, ${input.userName}!`, // Custom welcome message
      initialQuestion: `How much would you like to bet today?`, // The question
    };
  }
);
