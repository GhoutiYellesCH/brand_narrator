
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getFirebase } from '@/firebase/server';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, getAuth as getClientAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// This file runs on the server, so we use the Admin SDK
const { firestore: serverFirestore, auth: adminAuth } = getFirebase();

// We need a temporary client app instance ON THE SERVER to handle sign-in,
// as the Admin SDK cannot sign in users with passwords.
const tempClientApp = initializeApp(firebaseConfig, 'temp-client-auth-app-for-next-auth');
const clientAuth = getClientAuth(tempClientApp);

async function getOrCreateUserProfile(uid: string, email: string | null, isAnonymous: boolean, name?: string | null) {
    const userRef = serverFirestore.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
        const userProfile = {
            id: uid,
            email: email || `guest_${uid}@example.com`,
            name: name || (isAnonymous ? 'Anonymous Guest' : 'New User'),
            createdAt: new Date(),
            lastLogin: new Date(),
            tokens: 100,
        };
        await userRef.set(userProfile);

        const brandStoryRef = serverFirestore.collection('users').doc(uid).collection('brandStories').doc('default');
        await brandStoryRef.set({
            id: 'default',
            userId: uid,
            companyName: '',
            mission: '',
            values: '',
            createdAt: new Date(),
            updatedAt: new Date(),
        }, { merge: true });

        return userProfile;
    } else {
        await userRef.update({ lastLogin: new Date() });
        return userSnap.data();
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

        try {
            if (credentials.isAnonymous === 'true') {
                const userCredential = await signInAnonymously(clientAuth);
                const profile = await getOrCreateUserProfile(userCredential.user.uid, null, true);
                if (!profile) throw new Error('Could not create user profile.');
                return { 
                    id: userCredential.user.uid, 
                    email: profile.email,
                    name: profile.name,
                };
            }


            const { email, password, isSignUp } = credentials;
            let userCredential;

            if (isSignUp === 'true') {
                userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
                await adminAuth.updateUser(userCredential.user.uid, {
                    displayName: 'New User'
                });
                const profile = await getOrCreateUserProfile(userCredential.user.uid, email, false, 'New User');
                if (!profile) throw new Error('Could not create user profile.');
                return { 
                    id: userCredential.user.uid, 
                    email: email,
                    name: 'New User'
                };
            } else {
                userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
                const profile = await getOrCreateUserProfile(userCredential.user.uid, email, false);
                if (!profile) throw new Error('Could not retrieve user profile.');
                return { 
                    id: userCredential.user.uid, 
                    email: userCredential.user.email,
                    name: userCredential.user.displayName || profile.name,
                 };
            }
        } catch (e: any) {
            // Handle Firebase errors and re-throw them as messages for the client
            switch (e.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    throw new Error('Invalid email or password.');
                case 'auth/email-already-in-use':
                    throw new Error('This email is already registered. Please sign in.');
                case 'auth/weak-password':
                    throw new Error('Password must be at least 6 characters long.');
                default:
                    console.error("Firebase Auth Error in NextAuth:", e);
                    throw new Error(e.message || 'An unexpected authentication error occurred.');
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
            // On sign in, add user id to the token
            token.id = user.id;
        }

        // Create a custom token for client-side Firebase auth
        if (token.id) {
            try {
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
