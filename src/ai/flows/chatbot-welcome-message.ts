
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
  prompt: `You are a friendly BetMaestro assistant.
User's name: {{{userName}}}
User's wallet balance: {{{walletBalance}}} EUR

Generate a personalized welcome message that includes the user's name.
Then, generate an initial question asking the user how much they would like to bet today.
Your response must be an object with a 'welcomeMessage' field and an 'initialQuestion' field.`,
});

const chatBotWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'chatBotWelcomeMessageFlow',
    inputSchema: ChatBotWelcomeMessageInputSchema,
    outputSchema: ChatBotWelcomeMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback if LLM fails to provide structured output
      console.error("Chatbot welcome message flow did not receive expected output from prompt for user:", input.userName);
      return {
        welcomeMessage: `Welcome, ${input.userName}! I'm ready to assist.`,
        initialQuestion: `How much would you like to bet today?`,
      };
    }
    return output;
  }
);
