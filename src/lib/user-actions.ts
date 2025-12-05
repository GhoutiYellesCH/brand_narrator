
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirebase } from '@/firebase/server';
import { auth as nextAuth } from '@/app/api/auth/[...nextauth]/route';

const { firestore: serverFirestore } = getFirebase();

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
  userId: z.string(),
});

export async function updateUserProfileAction(
  prevState: UserProfileState,
  formData: FormData
): Promise<UserProfileState> {
  const sessionUserId = await getUserIdFromServerSession();
  if (!sessionUserId) {
    return { error: 'You are not authorized to perform this action.' };
  }

  const validatedFields = UserProfileFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { name, userId } = validatedFields.data;

  if (sessionUserId !== userId) {
    return { error: 'Unauthorized action. User ID mismatch.' };
  }
  
  try {
    const userRef = serverFirestore.collection('users').doc(userId);
    await userRef.update({ name });
    
    revalidatePath('/account');
    revalidatePath('/dashboard');
    return { success: true };

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { error: 'Failed to update your profile. Please try again.' };
  }
}
