
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// This is a simplified NextAuth configuration that uses a dummy user
// for demonstration purposes, completely independent of Firebase Authentication.

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
        
        // For demonstration, we'll accept any email/password and return a dummy user.
        // In a real application, you would validate against your database here.
        const dummyUser = {
          id: 'dummy-user-id-123',
          name: credentials.isAnonymous === 'true' ? 'Anonymous Guest' : 'Test User',
          email: credentials.isAnonymous === 'true' ? 'guest@example.com' : credentials.email,
        };

        console.log(`Authorizing user: ${dummyUser.email}`);
        return dummyUser;
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
