'use client';

import { SessionProvider } from 'next-auth/react';
import AppContent from '@/components/layout/AppContent';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FirebaseClientProvider>
        <AppContent>
          {children}
        </AppContent>
      </FirebaseClientProvider>
    </SessionProvider>
  );
}
