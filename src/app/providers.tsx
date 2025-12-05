
'use client';

import { SessionProvider } from 'next-auth/react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FirebaseClientProvider>
        <FirebaseErrorListener />
        {children}
      </FirebaseClientProvider>
    </SessionProvider>
  );
}
