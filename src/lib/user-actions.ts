
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirebase } from '@/firebase/server';
import { cookies } from 'next/headers';

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
  fieldErrors: z.record(z.array(z.string())).optional(),
});
export type PasswordChangeState = z.infer<typeof PasswordChangeStateSchema>;

const PasswordChangeFormSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export async function changePasswordAction(
    prevState: PasswordChangeState,
    formData: FormData
): Promise<PasswordChangeState> {
    const userId = await getUserIdFromServerSession();
    if (!userId) {
        return { error: 'You are not authorized to perform this action.' };
    }

    const validatedFields = PasswordChangeFormSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { password }_ = validatedFields.data;
    
    const submittedUserId = formData.get('userId') as string;
    if (userId !== submittedUserId) {
        return { error: 'Unauthorized action. User ID mismatch.' };
    }

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
