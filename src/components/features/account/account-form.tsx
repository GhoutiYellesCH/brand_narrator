
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { updateUserProfileAction, type UserProfileState } from '@/lib/user-actions';
import { useToast } from '@/hooks/use-toast';

const initialState: UserProfileState = {};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
            ) : (
                'Save Changes'
            )}
        </Button>
    );
}

export function AccountForm() {
    const { data: session, status } = useSession();
    const { toast } = useToast();

    const [state, formAction] = useActionState(updateUserProfileAction, initialState);

    useEffect(() => {
        if (state.success) {
            toast({
                title: 'Success',
                description: 'Your profile has been updated.',
            });
        } else if (state.error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: state.error,
            });
        }
    }, [state, toast]);

    const isLoading = status === 'loading';

    if (isLoading) {
        return <AccountFormSkeleton />;
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Update your name and email address.</CardDescription>
            </CardHeader>
            <form action={formAction}>
                <input type="hidden" name="userId" value={session?.user?.id || ''} />
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" defaultValue={session?.user?.name || ''} required />
                        {state.fieldErrors?.name && <p className="text-sm text-destructive">{state.fieldErrors.name.join(', ')}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" defaultValue={session?.user?.email || ''} disabled />
                        <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                    </div>
                     {state.error && (
                        <Alert variant="destructive">
                            <AlertTitle>Update Failed</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    );
}

function AccountFormSkeleton() {
    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    );
}
