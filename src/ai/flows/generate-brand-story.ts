'use server';

/**
 * @fileOverview Generates a compelling brand story based on a comprehensive questionnaire.
 *
 * - generateBrandStory - A function that generates the brand story.
 * - GenerateBrandStoryInput - The input type for the generateBrandStory function.
 * - GenerateBrandStoryOutput - The return type for the generateBrandStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBrandStoryInputSchema = z.object({
  companyName: z.string().describe('The name of the company.'),
  mission: z.string().describe('The mission of the company.'),
  values: z.string().describe('The core values of the company.'),
  
  // Founding Story & Purpose
  foundingStory: z.string().optional().describe('How and when the company was founded, who had the idea, and the motivation.'),
  problemToSolve: z.string().optional().describe('The specific problem or need the company set out to solve.'),
  ahaMoment: z.string().optional().describe('The original inspiration or "aha" moment for the startup.'),
  foundingTeam: z.string().optional().describe('Who the co-founders are and the roles they played.'),
  founderValues: z.string().optional().describe('The personal values or beliefs that drove the founders to launch the company.'),

  // Mission, Vision & Values
  vision: z.string().optional().describe('The long-term vision for the company (5-10 years).'),
  
  // Products & Services
  products: z.string().optional().describe('A description of the products or services offered.'),
  uniqueProblem: z.string().optional().describe('The unique problems the products/services solve.'),
  valueProposition: z.string().optional().describe('A one-sentence value proposition.'),

  // Target Customers & Audience
  idealCustomer: z.string().optional().describe('A description of the ideal customer or target audience.'),
  customerPainPoints: z.string().optional().describe('The pain points or challenges the target audience faces.'),
  customerFeeling: z.string().optional().describe('How customers feel after using the product/service (e.g., empowered, relieved).'),
  
  // Competition & Differentiation
  competitors: z.string().optional().describe('The main competitors or alternative solutions.'),
  differentiation: z.string().optional().describe('How the company\'s offering is better or different from competitors.'),
  
  // Additional Context
  storyConversation: z.string().optional().describe('A transcript of the conversational story gathering session with the founder.'),
  additionalInfo: z.string().optional().describe('Any other relevant information, such as a business plan, market analysis, etc.'),
});
export type GenerateBrandStoryInput = z.infer<typeof GenerateBrandStoryInputSchema>;

const GenerateBrandStoryOutputSchema = z.object({
  brandStory: z.string().describe('The generated brand story, written as an engaging and compelling narrative.'),
});
export type GenerateBrandStoryOutput = z.infer<typeof GenerateBrandStoryOutputSchema>;

export async function generateBrandStory(input: GenerateBrandStoryInput): Promise<GenerateBrandStoryOutput> {
  return generateBrandStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBrandStoryPrompt',
  input: {schema: GenerateBrandStoryInputSchema},
  output: {schema: GenerateBrandStoryOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  config: {
    // Pass the API key directly to the model
    auth: {apiKey: process.env.GEMINI_API_KEY},
  },
  prompt: `You are a world-class brand strategist and master storyteller. Your task is to synthesize all the provided information into a single, compelling, and emotionally resonant brand story for a startup named {{{companyName}}}.

Your narrative should be structured like a classic story: introduce the characters (the founders), the problem they saw in the world (the conflict), the journey to the solution (the startup), and the vision for the future. Make the customer the hero of their own journey, with the brand as their trusted guide.

Analyze the following inputs to understand the heart and soul of the company. Weave these elements into a cohesive narrative.

**1. Core Identity:**
- **Company Name:** {{{companyName}}}
- **Mission:** {{{mission}}}
- **Core Values:** {{{values}}}
{{#if vision}}
- **Long-Term Vision:** {{{vision}}}
{{/if}}

**2. The Origin Story (The "Why"):**
{{#if foundingStory}}
- **How it Started:** {{{foundingStory}}}
{{/if}}
{{#if problemToSolve}}
- **The Problem We Saw:** {{{problemToSolve}}}
{{/if}}
{{#if ahaMoment}}
- **The "Aha!" Moment:** {{{ahaMoment}}}
{{/if}}
{{#if foundingTeam}}
- **The Founding Team:** {{{foundingTeam}}}
{{/if}}
{{#if founderValues}}
- **Driven By Personal Beliefs:** {{{founderValues}}}
{{/if}}

**3. The Solution (The "What" and "How"):**
{{#if products}}
- **Our Offering:** {{{products}}}
{{/if}}
{{#if uniqueProblem}}
- **How We Help:** {{{uniqueProblem}}}
{{/if}}
{{#if valueProposition}}
- **Our Promise:** {{{valueProposition}}}
{{/if}}

**4. The Hero of Our Story (The "Who"):**
{{#if idealCustomer}}
- **Our Ideal Customer:** {{{idealCustomer}}}
{{/if}}
{{#if customerPainPoints}}
- **Their Challenge:** {{{customerPainPoints}}}
{{/if}}
{{#if customerFeeling}}
- **The "After" Feeling:** Our goal is to make them feel: {{{customerFeeling}}}
{{/if}}

**5. The Market Landscape:**
{{#if competitors}}
- **Who We're Different From:** {{{competitors}}}
{{/if}}
{{#if differentiation}}
- **Our Unique Edge:** {{{differentiation}}}
{{/if}}

**6. Deeper Context & Founder's Voice:**
{{#if storyConversation}}
- **Insights from the Founder's Conversation:** (Look for anecdotes, passion, and the "why" behind the startup in this transcript)
{{{storyConversation}}}
{{/if}}
{{#if additionalInfo}}
- **Additional Business Context:** (Extract key narrative elements from this business plan/market analysis)
{{{additionalInfo}}}
{{/if}}

**Your Task:**

Synthesize all these elements into a beautiful, inspiring, and authentic brand story. Do not just list the facts. Weave them into a flowing narrative. Start with the problem or the origin, introduce the solution, show how it empowers the customer (the hero), and conclude with the grander vision. The story should be ready to be published on a company's "About Us" page.
Produce the final brand story below.
`,
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
