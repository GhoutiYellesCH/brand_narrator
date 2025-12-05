'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirebase } from '@/firebase/server';
import { auth as nextAuth } from '@/app/api/auth/[...nextauth]/route';

// Note: This file now uses a mock implementation.
// In a real application, you would replace this with actual database calls.

async function getUserIdFromServerSession(): Promise<string | null> {
    try {
        const session = await nextAuth();
        if (session?.user?.id) {
            return session.user.id;
        }
        return null;
    } catch (error) {
        console.error('Error getting server session:', error);
        return null;
    }
}

// User Profile Update Action
const UserProfileStateSchema = z.object({
    success: z.boolean().optional(),
    error: z.string().optional(),
    fieldErrors: z.record(z.array(z.string())).optional(),
});
export type UserProfileState = z.infer<typeof UserProfileStateSchema>;

const UserProfileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
});

export async function updateUserProfileAction(
  prevState: UserProfileState,
  formData: FormData
): Promise<UserProfileState> {
  const userId = await getUserIdFromServerSession();
  if (!userId) {
    return { error: 'You are not authorized to perform this action.' };
  }

  const validatedFields = UserProfileFormSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { name } = validatedFields.data;

  const submittedUserId = formData.get('userId') as string;
  if (userId !== submittedUserId) {
    return { error: 'Unauthorized action. User ID mismatch.' };
  }
  
  try {
    // In a real application, you would update the user's name in your database here.
    // For now, we'll just log it to the server console.
    console.log(`Updating name for user ${userId} to: ${name}`);
    
    // We revalidate paths to simulate data being updated, which can be useful
    // if you add a real database later.
    revalidatePath('/account');
    revalidatePath('/dashboard');
    return { success: true };

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { error: 'Failed to update your profile. Please try again.' };
  }
}
