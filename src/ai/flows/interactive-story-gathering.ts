
'use server';

/**
 * @fileOverview This file defines a Genkit flow for gathering a startup's story through a conversational AI.
 *
 * The flow takes user input and uses an AI to extract key information about the startup's origins, mission, and values.
 * It exports:
 *   - interactiveStoryGathering: The main function to initiate the story gathering process.
 *   - InteractiveStoryGatheringInput: The input type for the interactiveStoryGathering function.
 *   - InteractiveStoryGatheringOutput: The output type for the interactiveStoryGathering function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const InteractiveStoryGatheringInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input/response to the AI, guiding the story gathering.'),
  conversationHistory: z
    .string()
    .optional()
    .describe('The past conversation history of the user to the AI.'),
});

export type InteractiveStoryGatheringInput = z.infer<
  typeof InteractiveStoryGatheringInputSchema
>;

const InteractiveStoryGatheringOutputSchema = z.object({
  aiResponse: z
    .string()
    .describe('The AI response, either asking for more information or confirming story details.'),
  updatedConversationHistory: z
    .string()
    .describe('The conversation history appended with the latest messages.'),
});

export type InteractiveStoryGatheringOutput = z.infer<
  typeof InteractiveStoryGatheringOutputSchema
>;

export async function interactiveStoryGathering(
  input: InteractiveStoryGatheringInput
): Promise<InteractiveStoryGatheringOutput> {
  return interactiveStoryGatheringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interactiveStoryGatheringPrompt',
  input: {schema: InteractiveStoryGatheringInputSchema},
  output: {schema: InteractiveStoryGatheringOutputSchema},
  model: googleAI('gemini-2.5-flash'),
  prompt: `You are a brand narrative expert guiding a founder through the process of telling their startup's story. Your goal is to gather key information about the company's origins, mission, and values through conversation. Build on the conversation history if it exists. Ask one question at a time, and try to extract specific details.

  Previous conversation:
  {{conversationHistory}}

  User Input:
  {{userInput}}

  Based on the user input and conversation history, generate a relevant and helpful AI response.
  The response should either ask for more details, or confirm details the user has given, before moving on to a new area of questioning.
  Also include an updated conversation history.`,
});

const interactiveStoryGatheringFlow = ai.defineFlow(
  {
    name: 'interactiveStoryGatheringFlow',
    inputSchema: InteractiveStoryGatheringInputSchema,
    outputSchema: InteractiveStoryGatheringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
