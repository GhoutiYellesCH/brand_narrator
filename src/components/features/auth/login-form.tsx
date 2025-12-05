
'use client';

import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth, useUser } from '@/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  type AuthError,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginSchema = z.infer<typeof loginSchema>;

async function createSession(idToken: string) {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  
    if (!res.ok) {
      throw new Error('Failed to create session');
    }
  }
  

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const createUserProfile = async (firebaseUser: FirebaseUser, isAnonymous = false) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', firebaseUser.uid);
    const userProfile = {
      id: firebaseUser.uid,
      email: firebaseUser.email || `guest_${firebaseUser.uid}@example.com`,
      name: firebaseUser.displayName || (isAnonymous ? 'Anonymous Guest' : 'New User'),
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      tokens: 100, // Initial token allocation
    };
    await setDoc(userRef, userProfile, { merge: true });

    // Also create an initial empty brand story
    const brandStoryRef = doc(firestore, 'users', firebaseUser.uid, 'brandStories', 'default');
    await setDoc(brandStoryRef, {
      id: 'default',
      userId: firebaseUser.uid,
      companyName: '',
      mission: '',
      values: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  };

  const handleAuthSuccess = async (firebaseUser: FirebaseUser, isAnonymous = false) => {
    await createUserProfile(firebaseUser, isAnonymous);
    const idToken = await firebaseUser.getIdToken();
    await createSession(idToken);
    setIsLoading(false);
    router.push('/dashboard');
  };

  const handleAuthError = (error: AuthError) => {
    setIsLoading(false);
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        setAuthError('Invalid email or password. Please try again.');
        break;
      case 'auth/email-already-in-use':
        setAuthError('This email is already in use. Please sign in or use a different email.');
        break;
      case 'auth/weak-password':
        setAuthError('The password is too weak. Please use a stronger password.');
        break;
      default:
        setAuthError('An unexpected error occurred. Please try again.');
        console.error('Firebase Auth Error:', error);
    }
  };

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    if(!auth || !firestore) return;
    setIsLoading(true);
    setAuthError(null);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await handleAuthSuccess(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        // On sign-in, just ensure the profile exists and log the session
        const userRef = doc(firestore, 'users', userCredential.user.uid);
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        const idToken = await userCredential.user.getIdToken();
        await createSession(idToken);
        setIsLoading(false);
        router.push('/dashboard');
      }
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const handleAnonymousSignIn = async () => {
    if(!auth || !firestore) return;
    setIsLoading(true);
    setAuthError(null);
    try {
      const userCredential = await signInAnonymously(auth);
      await handleAuthSuccess(userCredential.user, true);
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };
  
  if (isUserLoading || user) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <Logo />
          </div>
        </div>
      );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
         <Logo />
        </div>
        <CardTitle className="font-headline text-2xl">{isSignUp ? 'Create an Account' : 'Welcome Back!'}</CardTitle>
        <CardDescription>{isSignUp ? 'Enter your details to get started.' : 'Sign in to continue to BrandNarrator.'}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          {authError && (
            <Alert variant="destructive">
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleAnonymousSignIn} disabled={isLoading}>
            Continue as Guest
          </Button>
        </CardFooter>
      </form>
      <p className="text-center text-sm text-muted-foreground pb-6">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <Button variant="link" className="p-0 h-auto" onClick={() => { setIsSignUp(!isSignUp); setAuthError(null); }}>
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </Button>
      </p>
    </Card>
  );
}
