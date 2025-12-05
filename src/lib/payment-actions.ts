'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getFirebase } from '@/firebase/server';

const { auth: adminAuth } = getFirebase();

async function getUserIdFromIdToken(idToken: string): Promise<string | null> {
    if (!idToken) {
      console.error('Server Action: ID token is empty.');
      return null;
    }
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      return decodedToken.uid;
    } catch (error) {
      console.error('Server Action: Error verifying ID token:', error);
      return null;
    }
}
