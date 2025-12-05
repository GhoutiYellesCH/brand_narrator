import { AccountForm } from '@/components/features/account/account-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Account | BrandNarrator',
    description: 'Manage your account settings and profile information.',
};

export default function AccountPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <h1 className="text-2xl font-headline">My Account</h1>
                <p className="text-muted-foreground">
                    View and edit your personal information.
                </p>
            </div>
            <AccountForm />
        </div>
    );
}
