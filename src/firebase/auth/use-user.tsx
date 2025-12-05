'use client';

import { useSession } from 'next-auth/react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export const useUser = () => {
  const { data: session, status } = useSession();
  const firestore = useFirestore();

  const isUserLoading = status === 'loading';
  const userId = session?.user?.id;

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<any>(userProfileRef);

  return {
    user: session?.user, 
    userProfile,
    isUserLoading: isUserLoading || (!!userId && isProfileLoading),
    userError: profileError,
  };
};
