
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("Caught Firestore Permission Error:", error.toString());

      // In a development environment, we throw the error to make it visible
      // in the Next.js error overlay for easier debugging.
      if (process.env.NODE_ENV === 'development') {
        // This makes the error visible in the Next.js overlay
        throw error;
      } else {
        // In production, we show a friendly toast notification.
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: "You don't have permission to perform this action. Please contact support if you believe this is an error.",
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  // This component does not render anything itself.
  return null;
}
