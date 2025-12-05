'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    setIsLoading(true);
    setAuthError(null);
    
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      isSignUp: String(isSignUp),
    });

    setIsLoading(false);

    if (result?.error) {
      setAuthError(result.error);
    } else if (result?.ok) {
        toast({
            title: isSignUp ? 'Account Created' : 'Signed In',
            description: isSignUp ? 'Welcome! Redirecting you to the dashboard.' : 'Welcome back! Redirecting you...',
        });
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    const result = await signIn('credentials', {
        redirect: false,
        isAnonymous: 'true',
    });
    setIsLoading(false);
    if (result?.error) {
        setAuthError(result.error);
    } else if (result?.ok) {
        toast({
            title: 'Signed In as Guest',
            description: 'Welcome! You are browsing as a guest.',
        });
        router.push('/dashboard');
        router.refresh();
    }
  };


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
          <Button variant="secondary" type="button" className="w-full" onClick={handleAnonymousSignIn} disabled={isLoading}>
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
