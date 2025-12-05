
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
import { headers } from 'next/headers';

const { firestore: serverFirestore, auth: adminAuth } = getFirebase();

async function getUserIdFromServerSession(): Promise<string | null> {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
      const idToken = authorization.split('Bearer ')[1];
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return decodedToken.uid;
      } catch (error) {
        console.error('Error verifying auth token:', error);
        return null;
      }
    }
    return 'placeholder-user-id';
}


async function checkAndDeductTokens(userId: string, amount: number, details: { chatMessageCount?: number } = {}): Promise<void> {
  if (userId === 'placeholder-user-id') {
      console.log(`DEV MODE: Skipping token deduction for placeholder user.`);
      return;
  }
  const userRef = serverFirestore.doc(`users/${userId}`);
  
  // Use a transaction to safely read and write
  await serverFirestore.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const userData = userDoc.data();

    if (!userData) {
      throw new Error("User profile not found.");
    }
    
    let cost = amount;

    // Special handling for chat messages
    if (details.chatMessageCount !== undefined) {
      const newTotalMessages = (userData.chatMessagesSent || 0) + 1;
      if (newTotalMessages % 10 === 0) {
        cost = 1; // Deduct 1 token every 10 messages
      } else {
        cost = 0; // No cost for this message
      }
      transaction.update(userRef, { chatMessagesSent: newTotalMessages });
    }

    if (userData.tokens < cost) {
      throw new Error('Insufficient tokens. Please purchase more to continue.');
    }

    if (cost > 0) {
      const { FieldValue } = await import('firebase-admin/firestore');
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
    // Pass the message count to the token deduction logic
    await checkAndDeductTokens(userId, 0, { chatMessageCount }); 

    const response = await interactiveStoryGathering({
      userInput,
      conversationHistory,
    });

    // Save the updated conversation history to Firestore non-blockingly
    const storyRef = serverFirestore.doc(`users/${userId}/brandStories/${brandStoryId}`);
    const { FieldValue } = await import('firebase-admin/firestore');
    storyRef.update({ 
        storyConversation: response.updatedConversationHistory,
        updatedAt: FieldValue.serverTimestamp(),
    }).catch(
      (e) => console.error('Failed to save conversation history:', e)
    );

    revalidatePath('/story-gathering');
    revalidatePath('/dashboard');
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
  fieldErrors: z.record(z.string()).optional(),
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
  brandStoryId: z.string(), // To know which document to update
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

  try {
    await checkAndDeductTokens(userId, 10); // Deduct 10 tokens for story generation

    const { brandStoryId, ...input } = validatedFields.data;
    const result = await generateBrandStory(input as GenerateBrandStoryInput);

    // Save the generated story and inputs to Firestore
    const storyRef = serverFirestore.doc(`users/${userId}/brandStories/${brandStoryId}`);
    const { FieldValue } = await import('firebase-admin/firestore');

    await storyRef.set(
      {
        ...input,
        userId,
        content: result.brandStory,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    
    revalidatePath('/brand-story');
    revalidatePath('/dashboard'); // Revalidate user token display
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
  const userId = await getUserIdFromServerSession();

  if (!userId) {
    return { error: 'You must be logged in to use this feature.' };
  }

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
    await checkAndDeductTokens(userId, 5); // Deduct 5 tokens per prompt

    const brandStoryRef = serverFirestore.doc(`users/${userId}/brandStories/default`);
    const brandStorySnap = await brandStoryRef.get();
    const brandStoryData = brandStorySnap.data();

    const input: GenerateAiPromptsInput = {
      ...validatedFields.data,
      brandDescription: brandStoryData?.content || validatedFields.data.brandDescription,
    };

    const result = await generateAiPrompts(input);
    revalidatePath('/dashboard'); // Revalidate user token display
    return { aiPrompt: result.aiPrompt, usageInstructions: result.usageInstructions };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || 'Failed to generate AI prompts. Please try again.' };
  }
}

// NOWPayments Integration Action
const CreateInvoiceSchema = z.object({
  price: z.number(),
  packageName: z.string(),
  tokens: z.number(),
});

export async function createNowPaymentsInvoice(
  formData: FormData
): Promise<{ invoiceUrl?: string; error?: string }> {
  // This uses a placeholder user ID. In a real application, you would
  // have a robust session management system to get the real user ID.
  const userId = `user_${Date.now()}`;

  const validatedFields = CreateInvoiceSchema.safeParse({
    price: parseFloat(formData.get('price') as string),
    packageName: formData.get('packageName') as string,
    tokens: parseInt(formData.get('tokens') as string, 10),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid invoice data.' };
  }

  const { price, packageName, tokens } = validatedFields.data;

  const apiKey = process.env.NOWPAYMENTS_API_KEY;

  if (!apiKey) {
    console.error('NOWPayments API key is not configured.');
    return { error: 'Payment service is not configured. Please contact support.' };
  }

  try {
    const orderId = `${userId}-${Date.now()}`;
    const nowPaymentsApiUrl = 'https://api.nowpayments.io/v1/invoice';

    const response = await fetch(nowPaymentsApiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: price,
        price_currency: 'usd',
        order_id: orderId,
        order_description: `${packageName} - ${tokens} Tokens for user ${userId}`,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?payment=cancelled`,
        // We can pass metadata to link the payment back to the user
        ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/nowpayments-ipn`,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('NOWPayments API Error:', errorBody);
      throw new Error(errorBody.message || 'Failed to create payment invoice.');
    }

    const invoice = await response.json();

    return { invoiceUrl: invoice.invoice_url };
  } catch (error: any) {
    console.error('Error creating NOWPayments invoice:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}
