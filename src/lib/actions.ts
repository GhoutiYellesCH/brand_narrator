
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
    return null;
}


async function checkAndDeductTokens(userId: string, amount: number, details: { chatMessageCount?: number } = {}): Promise<void> {
  const userRef = serverFirestore.doc(`users/${userId}`);
  
  await serverFirestore.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const userData = userDoc.data();

    if (!userData) {
      throw new Error("User profile not found.");
    }
    
    let cost = amount;

    // For interactive chat, 1 token is deducted every 10 messages
    if (details.chatMessageCount !== undefined) {
      const newTotalMessages = (userData.chatMessagesSent || 0) + 1;
      if ((newTotalMessages % 10 === 0) && newTotalMessages > 0) {
        cost = 1;
      } else {
        cost = 0;
      }
      transaction.update(userRef, { chatMessagesSent: FieldValue.increment(1) });
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
    await checkAndDeductTokens(userId, 10);

    const { brandStoryId, ...input } = validatedFields.data;
    const result = await generateBrandStory(input as GenerateBrandStoryInput);

    const storyRef = serverFirestore.doc(`users/${userId}/brandStories/${brandStoryId}`);
    
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
    await checkAndDeductTokens(userId, 5); 

    const brandStoryRef = serverFirestore.doc(`users/${userId}/brandStories/default`);
    const brandStorySnap = await brandStoryRef.get();
    const brandStoryData = brandStorySnap.data();

    const input: GenerateAiPromptsInput = {
      ...validatedFields.data,
      brandDescription: brandStoryData?.content || validatedFields.data.brandDescription,
    };

    const result = await generateAiPrompts(input);
    revalidatePath('/dashboard');
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
  const userId = await getUserIdFromServerSession();
  
  if (!userId) {
    return { error: 'You must be logged in to create an invoice.' };
  }

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
        ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/nowpayments-ipn`,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('NOWPayments API Error:', errorBody);
      throw new Error(errorBody.message || 'Failed to create payment invoice.');
    }

    const invoice = await response.json();
    
    // Temporarily disabled to unblock development.
    // This can be re-enabled once server auth is fully configured.
    // try {
    //   const transactionRef = serverFirestore.collection('users').doc(userId).collection('paymentTransactions').doc(invoice.id);
    //   await transactionRef.set({
    //     invoiceId: invoice.id,
    //     orderId: orderId,
    //     packageName: packageName,
    //     tokens: tokens,
    //     price: price,
    //     status: 'pending',
    //     createdAt: FieldValue.serverTimestamp(),
    //   });
    // } catch (dbError) {
    //   console.error("Failed to log transaction to Firestore, but invoice was created:", dbError);
    // }
    
    return { invoiceUrl: invoice.invoice_url };
  } catch (error: any) {
    console.error('Error creating NOWPayments invoice:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

// User Profile Update Action
const UserProfileStateSchema = z.object({
    success: z.boolean().optional(),
    error: z.string().optional(),
    fieldErrors: z.record(z.string()).optional(),
});
export type UserProfileState = z.infer<typeof UserProfileStateSchema>;

const UserProfileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  userId: z.string().min(1, "User ID is required."),
});

export async function updateUserProfileAction(
  prevState: UserProfileState,
  formData: FormData
): Promise<UserProfileState> {
  const validatedFields = UserProfileFormSchema.safeParse({
    name: formData.get('name'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { name, userId } = validatedFields.data;

  if (!userId || userId === 'null' || userId === 'undefined') {
    return { error: 'You must be logged in to update your profile.' };
  }
  
  try {
    const userRef = serverFirestore.doc(`users/${userId}`);
    await userRef.update({
      name: name,
    });
    
    revalidatePath('/account');
    revalidatePath('/dashboard');
    return { success: true };

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { error: 'Failed to update your profile. Please try again.' };
  }
}


// Password Change Action
const PasswordChangeStateSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
  fieldErrors: z.record(z.string()).optional(),
});
export type PasswordChangeState = z.infer<typeof PasswordChangeStateSchema>;

const PasswordChangeFormSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
    userId: z.string().min(1, 'User ID is required.'),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export async function changePasswordAction(
    prevState: PasswordChangeState,
    formData: FormData
): Promise<PasswordChangeState> {
    const validatedFields = PasswordChangeFormSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { password, userId } = validatedFields.data;

    try {
        await adminAuth.updateUser(userId, {
            password: password,
        });

        revalidatePath('/account');
        return { success: true };
    } catch (error: any) {
        console.error('Error changing password:', error);
        if (error.code === 'auth/requires-recent-login') {
            return { error: 'This action is sensitive and requires recent authentication. Please sign out and sign back in to change your password.' };
        }
        return { error: 'Failed to change password. Please try again.' };
    }
}
