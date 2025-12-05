'use server';

/**
 * @fileOverview Generates a compelling brand story based on founder input.
 *
 * - generateBrandStory - A function that generates the brand story.
 * - GenerateBrandStoryInput - The input type for the generateBrandStory function.
 * - GenerateBrandStoryOutput - The return type for the generateBrandStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBrandStoryInputSchema = z.object({
  companyName: z.string().describe('The name of the company.'),
  origins: z.string().describe('The origins of the company, how it started.'),
  mission: z.string().describe('The mission of the company.'),
  values: z.string().describe('The core values of the company.'),
});
export type GenerateBrandStoryInput = z.infer<typeof GenerateBrandStoryInputSchema>;

const GenerateBrandStoryOutputSchema = z.object({
  brandStory: z.string().describe('The generated brand story.'),
});
export type GenerateBrandStoryOutput = z.infer<typeof GenerateBrandStoryOutputSchema>;

export async function generateBrandStory(input: GenerateBrandStoryInput): Promise<GenerateBrandStoryOutput> {
  return generateBrandStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBrandStoryPrompt',
  input: {schema: GenerateBrandStoryInputSchema},
  output: {schema: GenerateBrandStoryOutputSchema},
  prompt: `You are a brand storytelling expert. Create a compelling brand story based on the following information provided by the founder:

Company Name: {{{companyName}}}
Origins: {{{origins}}}
Mission: {{{mission}}}
Values: {{{values}}}

Create a narrative that is inspiring, authentic, and emotionally engaging. The story should reflect the company's unique identity and resonate with its target audience.`,
});

const generateBrandStoryFlow = ai.defineFlow(
  {
    name: 'generateBrandStoryFlow',
    inputSchema: GenerateBrandStoryInputSchema,
    outputSchema: GenerateBrandStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
