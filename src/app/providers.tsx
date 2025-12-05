'use client';

import { SessionProvider } from 'next-auth/react';
import { FirebaseClientProvider } from '@/firebase';
import AppContent from '@/components/layout/AppContent';

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
