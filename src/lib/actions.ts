'use server';

import { z } from 'zod';
import {
  interactiveStoryGathering
} from '@/ai/flows/interactive-story-gathering';
import {
  type GenerateAiPromptsInput,
  generateAiPrompts,
} from '@/ai/flows/generate-ai-prompts';
import {
  type GenerateBrandStoryInput,
  generateBrandStory,
} from '@/ai/flows/generate-brand-story';


// Interactive Story Gathering Action
const StoryStateSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  error: z.string().optional(),
});
export type StoryState = z.infer<typeof StoryStateSchema>;

export async function getAiStoryResponse(userInput: string, conversationHistory: string) {
  try {
    const response = await interactiveStoryGathering({
      userInput,
      conversationHistory,
    });
    return { aiResponse: response.aiResponse, updatedConversationHistory: response.updatedConversationHistory };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to get a response from the AI. Please try again.' };
  }
}

// Brand Story Generation Action
const BrandStoryStateSchema = z.object({
  brandStory: z.string().optional(),
  error: z.string().optional(),
  fieldErrors: z.record(z.string()).optional(),
});
export type BrandStoryState = z.infer<typeof BrandStoryStateSchema>;

const BrandStoryFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  origins: z.string().min(10, 'Origins story should be at least 10 characters.'),
  mission: z.string().min(10, 'Mission statement should be at least 10 characters.'),
  values: z.string().min(10, 'Core values should be at least 10 characters.'),
  storyConversation: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export async function generateBrandStoryAction(
  prevState: BrandStoryState,
  formData: FormData
): Promise<BrandStoryState> {
  const validatedFields = BrandStoryFormSchema.safeParse({
    companyName: formData.get('companyName'),
    origins: formData.get('origins'),
    mission: formData.get('mission'),
    values: formData.get('values'),
    storyConversation: formData.get('storyConversation'),
    additionalInfo: formData.get('additionalInfo'),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const input: GenerateBrandStoryInput = validatedFields.data;
    const result = await generateBrandStory(input);
    return { brandStory: result.brandStory };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate brand story. Please try again.' };
  }
}

// AI Prompt Generation Action
const PromptGeneratorStateSchema = z.object({
  aiPrompt: z.string().optional(),
  usageInstructions: z.string().optional(),
  error: z.string().optional(),
  fieldErrors: z.record(z.string()).optional(),
});
export type PromptGeneratorState = z.infer<typeof PromptGeneratorStateSchema>;

const PromptGeneratorFormSchema = z.object({
    brandDescription: z.string().min(10, 'Brand description must be at least 10 characters.'),
    targetAudience: z.string().min(3, 'Target audience is required.'),
    contentGoal: z.string().min(3, 'Content goal is required.'),
    platform: z.string().min(3, 'AI Platform is required.'),
});

export async function generateAiPromptsAction(
  prevState: PromptGeneratorState,
  formData: FormData
): Promise<PromptGeneratorState> {
    const validatedFields = PromptGeneratorFormSchema.safeParse({
        brandDescription: formData.get('brandDescription'),
        targetAudience: formData.get('targetAudience'),
        contentGoal: formData.get('contentGoal'),
        platform: formData.get('platform'),
      });
    
      if (!validatedFields.success) {
        return {
          fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
      }

  try {
    const input: GenerateAiPromptsInput = validatedFields.data;
    const result = await generateAiPrompts(input);
    return { aiPrompt: result.aiPrompt, usageInstructions: result.usageInstructions };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate AI prompts. Please try again.' };
  }
}
