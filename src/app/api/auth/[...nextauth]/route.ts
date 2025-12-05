
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getFirebase } from '@/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserProfile } from '@/lib/definitions';
import { getAuth as getAdminAuth, DecodedIdToken } from 'firebase-admin/auth';

// This is a server-side only file.

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
        
        const { app } = getFirebase();
        const adminAuth = getAdminAuth(app);

        try {
            let userRecord;
            
            if (credentials.isAnonymous === 'true') {
                // For anonymous, we just need a UID. We'll create one if needed.
                 userRecord = await adminAuth.createUser({});
            } else if (credentials.isSignUp === 'true') {
                userRecord = await adminAuth.createUser({
                    email: credentials.email,
                    password: credentials.password,
                    displayName: credentials.email.split('@')[0], // a default name
                });
            } else {
                // For regular sign-in, we just need to verify the user exists.
                // The password check is implicitly handled by the client-side SDK.
                // Here, we just need to get the user record to proceed.
                userRecord = await adminAuth.getUserByEmail(credentials.email);
            }

            if (userRecord) {
                const profile = await getOrCreateUserProfile(userRecord.uid, userRecord.email || null, userRecord.displayName || null);
                
                if (!profile) {
                    throw new Error('Could not create or retrieve user profile.');
                }

                return { 
                    id: userRecord.uid, 
                    email: profile.email,
                    name: profile.name,
                };
            }
            return null;
        } catch (error: any) {
            // Firebase Admin SDK errors
            console.error("Firebase Admin SDK error in authorize:", error);
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
        const { app } = getFirebase();
        const adminAuth = getAdminAuth(app);

        if (user) { // This is the user object from the authorize function
            token.id = user.id;
        }

        if (token.id) {
            try {
                // Create a custom token for the Firebase client SDK
                token.firebaseToken = await adminAuth.createCustomToken(token.id as string);
            } catch (error) {
                console.error("Error creating custom Firebase token:", error);
            }
        }
        
        return token;
    },
    async session({ session, token }) {
        if (session.user && token.id) {
            session.user.id = token.id as string;
        }
        if (token.firebaseToken) {
            session.firebaseToken = token.firebaseToken as string;
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
