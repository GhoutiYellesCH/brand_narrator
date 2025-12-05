
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getFirebase } from '@/firebase/server';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, getAuth } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserProfile } from '@/lib/definitions';

// This is a server-side only file.

// Helper function to get or create a user profile in Firestore
async function getOrCreateUserProfile(userId: string, email: string | null, name: string | null): Promise<UserProfile | undefined> {
    const { firestore } = getFirebase();
    const userRef = firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
        return userDoc.data() as UserProfile;
    } else {
        const newUserProfile: UserProfile = {
            id: userId,
            email: email || '',
            name: name || 'Anonymous User',
            createdAt: FieldValue.serverTimestamp(),
            lastLogin: FieldValue.serverTimestamp(),
            tokens: 100, // Initial token allocation
        };
        await userRef.set(newUserProfile);
        const newDoc = await userRef.get();
        return newDoc.data() as UserProfile;
    }
}


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isSignUp: { label: "isSignUp", type: "text" },
        isAnonymous: { label: "isAnonymous", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Something went wrong.");
        }

        // We need a temporary client auth instance on the server to do this.
        const clientApps = getApps().filter(app => app.name === 'client-auth-temp');
        const clientApp = clientApps.length > 0 ? clientApps[0] : initializeApp(firebaseConfig, 'client-auth-temp');
        const clientAuth = getAuth(clientApp);
        
        try {
            let userCredential;
            if (credentials.isAnonymous === 'true') {
                userCredential = await signInAnonymously(clientAuth);
            } else if (credentials.isSignUp === 'true') {
                userCredential = await createUserWithEmailAndPassword(clientAuth, credentials.email, credentials.password);
            } else {
                userCredential = await signInWithEmailAndPassword(clientAuth, credentials.email, credentials.password);
            }

            if (userCredential.user) {
                const profile = await getOrCreateUserProfile(userCredential.user.uid, userCredential.user.email, userCredential.user.displayName);
                
                if (!profile) {
                    throw new Error('Could not create or retrieve user profile.');
                }

                return { 
                    id: userCredential.user.uid, 
                    email: profile.email,
                    name: profile.name,
                };
            }
            return null;
        } catch (error: any) {
            // Firebase Auth errors (e.g., wrong password, user not found)
            throw new Error(error.message || "Authentication failed.");
        }
      },
    }),
  ],
  session: {
      strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
        }
        return token;
    },
    async session({ session, token }) {
        if (session.user && token.id) {
            session.user.id = token.id as string;
        }
        return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, handler as auth };
