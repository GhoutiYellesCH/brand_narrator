
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/firebase/provider';
import { onIdTokenChanged, signInWithCustomToken, type User } from 'firebase/auth';

export interface UseUser {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useUser(): UseUser {
  const { data: session, status } = useSession();
  const auth = useAuth();

  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (newUser) => {
        setUser(newUser);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    };
    if (status === 'unauthenticated') {
      // If NextAuth session is gone, sign out of Firebase
      if (auth.currentUser) {
        auth.signOut();
      }
      setIsLoading(false);
      return;
    }
    // If we have a Firebase token from NextAuth but are not signed into Firebase, sign in
    if (status === 'authenticated' && session.firebaseToken && auth.currentUser?.uid !== session.user.id) {
        signInWithCustomToken(auth, session.firebaseToken).catch((error) => {
            console.error("Error signing in with custom token:", error);
        });
    }

  }, [session, status, auth]);

  return { user, isLoading, isAuthenticated: !!user };
}
