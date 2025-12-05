import { LoginForm } from '@/components/features/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | BrandNarrator',
    description: 'Login to your BrandNarrator account.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  );
}
