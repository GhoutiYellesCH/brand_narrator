
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { interactiveStoryGathering } from '@/ai/flows/interactive-story-gathering';
import {
  type GenerateAiPromptsInput,
  generateAiPrompts,
} from '@/ai/flows/generate-ai-prompts';
import {
  type GenerateBrandStoryInput,
  generateBrandStory,
} from '@/ai/flows/generate-brand-story';
import { getFirebase } from '@/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import type { UserProfile, BrandStory } from '@/lib/definitions';

const { firestore: serverFirestore, auth: adminAuth } = getFirebase();

async function getUserIdFromServerSession(): Promise<string | null> {
    try {
        const sessionCookie = cookies().get('__session')?.value;
        if (!sessionCookie) {
            console.log('Session cookie not found.');
            return null;
        }
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedToken.uid;
    } catch (error) {
        // This is expected if the cookie is invalid or expired.
        if ((error as any).code === 'auth/session-cookie-expired' || (error as any).code === 'auth/session-cookie-revoked') {
          return null;
        }
        console.error('Error verifying session cookie in server action:', error);
        return null;
    }
}


async function checkAndDeductTokens(userId: string, amount: number, details: { chatMessageCount?: number } = {}): Promise<void> {
  const userRef = serverFirestore.doc(`users/${userId}`);
  
  await serverFirestore.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const userData = userDoc.data() as UserProfile;

    if (!userData) {
      throw new Error("User profile not found.");
    }
    
    let cost = amount;

    // For interactive chat, 1 token is deducted every 10 messages
    if (details.chatMessageCount !== undefined) {
      if ((details.chatMessageCount > 0) && (details.chatMessageCount % 10 === 0)) {
        cost = 1;
      } else {
        cost = 0;
      }
    }

    if (userData.tokens < cost) {
      throw new Error('Insufficient tokens. Please purchase more to continue.');
    }

    if (cost > 0) {
      transaction.update(userRef, { tokens: FieldValue.increment(-cost) });
    }
  });
}


// Interactive Story Gathering Action
export async function getAiStoryResponse(
  userInput: string,
  conversationHistory: string,
  brandStoryId: string,
  chatMessageCount: number
) {
  const userId = await getUserIdFromServerSession();
  if (!userId) {
    return { error: 'You must be logged in to use this feature.' };
  }
  
  if (!brandStoryId) {
    return { error: 'Brand Story ID is missing.' };
  }

  try {
    await checkAndDeductTokens(userId, 0, { chatMessageCount }); 

    const response = await interactiveStoryGathering({
      userInput,
      conversationHistory,
    });

    const storyRef = serverFirestore.doc(`users/${userId}/brandStories/${brandStoryId}`);
    await storyRef.update({ 
        storyConversation: response.updatedConversationHistory,
        updatedAt: FieldValue.serverTimestamp(),
    });

    if(chatMessageCount > 0 && chatMessageCount % 10 === 0) {
        revalidatePath('/dashboard');
    }
    revalidatePath('/story-gathering');

    return {
      aiResponse: response.aiResponse,
      updatedConversationHistory: response.updatedConversationHistory,
    };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || 'Failed to get a response from the AI.' };
  }
}

// Brand Story Generation Action
const BrandStoryStateSchema = z.object({
  brandStory: z.string().optional(),
  error: z.string().optional(),
  fieldErrors: z.record(z.array(z.string())).optional(),
});
export type BrandStoryState = z.infer<typeof BrandStoryStateSchema>;

const BrandStoryFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  foundingStory: z.string().optional(),
  problemToSolve: z.string().optional(),
  ahaMoment: z.string().optional(),
  foundingTeam: z.string().optional(),
  founderValues: z.string().optional(),
  mission: z.string().min(3, 'Mission is required.'),
  vision: z.string().optional(),
  values: z.string().min(3, 'Core values are required.'),
  products: z.string().optional(),
  uniqueProblem: z.string().optional(),
  valueProposition: z.string().optional(),
  idealCustomer: z.string().optional(),
  customerPainPoints: z.string().optional(),
  customerFeeling: z.string().optional(),
  competitors: z.string().optional(),
  differentiation: z.string().optional(),
  storyConversation: z.string().optional(),
  additionalInfo: z.string().optional(),
  brandStoryId: z.string(),
});

export async function generateBrandStoryAction(
  prevState: BrandStoryState,
  formData: FormData
): Promise<BrandStoryState> {
  const userId = await getUserIdFromServerSession();
  if (!userId) {
    return { error: 'You must be logged in to use this feature.' };
  }

  const validatedFields = BrandStoryFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { brandStoryId, ...input } = validatedFields.data;

  try {
    await checkAndDeductTokens(userId, 10);

    const result = await generateBrandStory(input as GenerateBrandStoryInput);

    const storyRef = serverFirestore.doc(`users/${userId}/brandStories/${brandStoryId}`);
    
    await storyRef.set(
      {
        ...input,
        userId,
        content: result.brandStory,
        updatedAt: FieldValue.serverTimestamp(),
      } as Partial<BrandStory>,
      { merge: true }
    );
    
    revalidatePath('/brand-story');
    revalidatePath('/dashboard'); 
    return { brandStory: result.brandStory };
  } catch (error: any) {
    console.error(error);
    return {
      error:
        error.message ||
        'Failed to generate brand story. The AI model may be temporarily unavailable.',
    };
  }
}

// AI Prompt Generation Action
const PromptGeneratorStateSchema = z.object({
  aiPrompt: z.string().optional(),
  usageInstructions: z.string().optional(),
  error: z.string().optional(),
  fieldErrors: z.record(z.array(z.string())).optional(),
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

  const userId = await getUserIdFromServerSession();
  if (!userId) {
    return { error: 'You must be logged in to use this feature.' };
  }

  const validatedFields = PromptGeneratorFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { ...inputData } = validatedFields.data;

  try {
    await checkAndDeductTokens(userId, 5); 

    const brandStoryRef = serverFirestore.doc(`users/${userId}/brandStories/default`);
    const brandStorySnap = await brandStoryRef.get();
    const brandStoryData = brandStorySnap.data() as BrandStory;

    const input: GenerateAiPromptsInput = {
      ...inputData,
      brandDescription: brandStoryData?.content || inputData.brandDescription,
    };

    const result = await generateAiPrompts(input);
    revalidatePath('/dashboard');
    return { aiPrompt: result.aiPrompt, usageInstructions: result.usageInstructions };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || 'Failed to generate AI prompts. Please try again.' };
  }
}
