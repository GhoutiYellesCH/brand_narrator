'use server';

/**
 * @fileOverview AI-optimized prompt generator for marketing content.
 *
 * - generateAiPrompts - A function that generates AI prompts based on input.
 * - GenerateAiPromptsInput - The input type for the generateAiPrompts function.
 * - GenerateAiPromptsOutput - The return type for the generateAiPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiPromptsInputSchema = z.object({
  brandDescription: z
    .string()
    .describe('Description of the brand, its mission, and values.'),
  targetAudience: z.string().describe('The target audience for the marketing content.'),
  contentGoal: z.string().describe('The goal of the marketing content (e.g., increase sales, brand awareness).'),
  platform: z.string().describe('The AI platform for which the prompt will be used (e.g., ChatGPT, Gemini).'),
});
export type GenerateAiPromptsInput = z.infer<typeof GenerateAiPromptsInputSchema>;

const GenerateAiPromptsOutputSchema = z.object({
  aiPrompt: z.string().describe('AI-optimized prompt for generating marketing content.'),
  usageInstructions: z.string().describe('Instructions on how to effectively use the generated prompt on the specified AI platform.'),
});
export type GenerateAiPromptsOutput = z.infer<typeof GenerateAiPromptsOutputSchema>;

export async function generateAiPrompts(input: GenerateAiPromptsInput): Promise<GenerateAiPromptsOutput> {
  return generateAiPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiPromptsPrompt',
  input: {schema: GenerateAiPromptsInputSchema},
  output: {schema: GenerateAiPromptsOutputSchema},
  prompt: `You are an AI prompt engineer specializing in crafting prompts for various AI platforms to generate marketing content.

  Based on the provided brand description, target audience, content goal, and AI platform, generate an AI-optimized prompt and instructions on how to use it effectively.

  Brand Description: {{{brandDescription}}}
  Target Audience: {{{targetAudience}}}
  Content Goal: {{{contentGoal}}} AI Platform: {{{platform}}}

  Prompt Instructions:

  First, clearly define the persona of the AI model. For instance, if you're asking it to generate a marketing text, the persona could be "a marketing expert with 10 years of experience".
  Second, outline the task. What exactly are you trying to accomplish? Ensure the AI understands the goal of the content.
  Third, explain the context of the task. Provide all details, so that the AI model can perform at the level of an expert.
  Fourth, clarify what type of content should be returned.
  Fifth, set the tone of the content. Do you want it to be formal, informal, funny, serious?
  Sixth, specify the ideal format of the output.
`,
});

const generateAiPromptsFlow = ai.defineFlow(
  {
    name: 'generateAiPromptsFlow',
    inputSchema: GenerateAiPromptsInputSchema,
    outputSchema: GenerateAiPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
