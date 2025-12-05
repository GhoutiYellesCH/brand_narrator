'use server';

/**
 * @fileOverview Generates a compelling brand story based on detailed founder input.
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
  storyConversation: z.string().optional().describe('A transcript of the conversational story gathering session with the founder.'),
  additionalInfo: z.string().optional().describe('Any additional information, such as a business plan, market analysis, or other relevant documents.'),
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
  prompt: `You are a world-class brand strategist and master storyteller. Your task is to synthesize all the provided information into a single, compelling, and emotionally resonant brand story for a startup.

Analyze the following inputs to understand the heart and soul of the company:

**Core Information:**
- Company Name: {{{companyName}}}
- Origins: {{{origins}}}
- Mission: {{{mission}}}
- Values: {{{values}}}

{{#if storyConversation}}
**Insights from Conversational Story Gathering:**
- The following is a transcript of a conversation with the founder. Look for anecdotes, passions, and the "why" behind the startup.
- Transcript:
{{{storyConversation}}}
{{/if}}

{{#if additionalInfo}}
**Detailed Business Context:**
- The following is additional information provided by the founder, which could include parts of a business plan, market analysis, or other key documents.
- Details:
{{{additionalInfo}}}
{{/if}}

**Your Task:**

Weave all these elements into a cohesive and inspiring narrative. The story should be authentic, memorable, and connect with the target audience. It should not just state facts, but evoke emotion. Structure it like a classic story: introduce the characters (the founders), the problem they saw in the world, the journey to the solution (the startup), and the vision for the future.

Produce the final brand story below.`,
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
