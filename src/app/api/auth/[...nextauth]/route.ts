
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getFirebase } from '@/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserProfile } from '@/lib/definitions';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
} from 'firebase/auth';

// Helper function to get or create a user profile in Firestore
async function getOrCreateUserProfile(userId: string, email: string | null, name: string | null): Promise<UserProfile | undefined> {
    const { firestore } = getFirebase();
    const userRef = firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
        // Update last login time
        await userRef.update({ lastLogin: FieldValue.serverTimestamp() });
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

        const { auth: clientAuth } = getFirebase();

        try {
          let userCredential;

          if (credentials.isAnonymous === 'true') {
            userCredential = await signInAnonymously(clientAuth);
          } else if (credentials.isSignUp === 'true') {
            userCredential = await createUserWithEmailAndPassword(clientAuth, credentials.email, credentials.password);
          } else {
            userCredential = await signInWithEmailAndPassword(clientAuth, credentials.email, credentials.password);
          }
          
          const user = userCredential.user;

          if (user) {
            const profile = await getOrCreateUserProfile(user.uid, user.email, user.displayName);
            
            if (!profile) {
              throw new Error('Could not create or retrieve user profile.');
            }

            return { 
                id: user.uid, 
                email: profile.email,
                name: profile.name,
            };
          }

          return null;
        } catch (error: any) {
            console.error("Firebase Auth error in authorize:", error);
            // Translate Firebase error codes to user-friendly messages
            switch (error.code) {
                case 'auth/user-not-found':
                    throw new Error('No user found with this email.');
                case 'auth/wrong-password':
                    throw new Error('Incorrect password.');
                case 'auth/email-already-in-use':
                    throw new Error('This email is already in use.');
                default:
                    throw new Error(error.message || "Authentication failed.");
            }
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

    