
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { changePasswordAction, type PasswordChangeState } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const initialState: PasswordChangeState = {};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Password...
                </>
            ) : (
                'Update Password'
            )}
        </Button>
    );
}

export function PasswordChangeForm() {
    const { user } = useUser();
    const { toast } = useToast();
    const [state, formAction] = useActionState(changePasswordAction, initialState);

    useEffect(() => {
        if (state.success) {
            toast({
                title: 'Success',
                description: 'Your password has been changed successfully.',
            });
        } else if (state.error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: state.error,
            });
        }
    }, [state, toast]);

    // Do not render the form for anonymous users as they don't have passwords.
    if (user?.isAnonymous) {
        return null;
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Enter a new password for your account.</CardDescription>
            </CardHeader>
            <form action={formAction}>
                <input type="hidden" name="userId" value={user?.uid} />
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input id="password" name="password" type="password" required />
                        {state.fieldErrors?.password && <p className="text-sm text-destructive">{state.fieldErrors.password.join(', ')}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" required />
                        {state.fieldErrors?.confirmPassword && <p className="text-sm text-destructive">{state.fieldErrors.confirmPassword.join(', ')}</p>}
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
