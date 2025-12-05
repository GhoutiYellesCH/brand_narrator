'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { signInWithCustomToken } from 'firebase/auth';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  // It's okay to connect to the emulator in dev.
  // if (process.env.NODE_ENV === 'development') {
  //   connectAuthEmulator(auth, 'http://localhost:9099');
  // }
  return {
    firebaseApp,
    auth: auth,
    firestore: getFirestore(firebaseApp)
  };
}

const useUser = () => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [userError, setUserError] = useState<Error | null>(null);

    const { auth } = initializeFirebase();

    useEffect(() => {
        const syncUser = async () => {
            if (status === 'loading') {
                setIsUserLoading(true);
                return;
            }
            if (status === 'unauthenticated') {
                setUser(null);
                setIsUserLoading(false);
                if(auth.currentUser) {
                  await auth.signOut();
                }
                return;
            }
            if (session?.firebaseToken) {
                try {
                    const credential = await signInWithCustomToken(auth, session.firebaseToken);
                    setUser(credential.user);
                } catch(e: any) {
                    setUserError(e);
                    console.error("Failed to sign in with custom token", e);
                } finally {
                    setIsUserLoading(false);
                }
            }
        }
        syncUser();
    }, [session, status, auth]);
    
    return { user, isUserLoading, userError };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export { useUser };
