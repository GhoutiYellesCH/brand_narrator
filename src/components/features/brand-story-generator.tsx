'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateBrandStoryAction, type BrandStoryState } from '@/lib/actions';
import { Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const initialState: BrandStoryState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" /> Generate Story
        </>
      )}
    </Button>
  );
}

export function BrandStoryGenerator() {
  const [state, formAction] = useActionState(
    generateBrandStoryAction,
    initialState
  );

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Craft Your Brand Story</CardTitle>
          <CardDescription>
            Provide the core elements of your brand. Our AI will weave them into a compelling narrative.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="e.g., Innovate Inc."
                required
              />
              {state.fieldErrors?.companyName && <p className="text-sm text-destructive">{state.fieldErrors.companyName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="origins">Origins</Label>
              <Textarea
                id="origins"
                name="origins"
                placeholder="Describe how your company started, the 'aha!' moment."
                className="min-h-24"
                required
              />
              {state.fieldErrors?.origins && <p className="text-sm text-destructive">{state.fieldErrors.origins}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mission">Mission</Label>
              <Textarea
                id="mission"
                name="mission"
                placeholder="What is your company's purpose and mission?"
                className="min-h-24"
                required
              />
               {state.fieldErrors?.mission && <p className="text-sm text-destructive">{state.fieldErrors.mission}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="values">Values</Label>
              <Textarea
                id="values"
                name="values"
                placeholder="What are the core values that drive your company?"
                className="min-h-24"
                required
              />
               {state.fieldErrors?.values && <p className="text-sm text-destructive">{state.fieldErrors.values}</p>}
            </div>
            {state.error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">Your Generated Story</CardTitle>
          <CardDescription>
            Here is the narrative crafted by our AI. Feel free to copy and use it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {state.brandStory ? (
            <div className="prose prose-sm max-w-none text-card-foreground/90 whitespace-pre-wrap">
              <p>{state.brandStory}</p>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8">
              <div className="text-center text-muted-foreground">
                <Wand2 className="mx-auto h-12 w-12" />
                <p className="mt-4 text-lg">Your brand story will appear here.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
