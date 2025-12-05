
import { AccountForm } from '@/components/features/account/account-form';
import { Separator } from '@/components/ui/separator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Account | BrandNarrator',
    description: 'Manage your account settings and profile information.',
};

export default function AccountPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-headline">My Account</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and profile.
                </p>
            </div>
            
            <Separator />

            <AccountForm />

        </div>
    );
}
