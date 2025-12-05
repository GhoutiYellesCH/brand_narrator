'use client';

import { useActionState, useState, useEffect, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateAiPromptsAction, type PromptGeneratorState } from '@/lib/actions';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Input } from '../ui/input';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const initialState: PromptGeneratorState = {};

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
          <Sparkles className="mr-2 h-4 w-4" /> Generate Prompt (5 Tokens)
        </>
      )}
    </Button>
  );
}

function CopyButton({ textToCopy }: { textToCopy: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
    )
}

export function PromptGenerator() {
  const [state, formAction] = useActionState(generateAiPromptsAction, initialState);
  const [platform, setPlatform] = useState('');
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const brandStoryRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid, 'brandStories', 'default');
  }, [firestore, user?.uid]);

  const { data: brandStory, isLoading: isStoryLoading } = useDoc<any>(brandStoryRef);

  const [brandDescription, setBrandDescription] = useState('');

  useEffect(() => {
    if (brandStory?.content) {
      setBrandDescription(brandStory.content);
    } else if (brandStory?.companyName) {
      // Fallback if content is not yet generated
      setBrandDescription(`This is a company called ${brandStory.companyName}. Mission: ${brandStory.mission}. Values: ${brandStory.values}`);
    }
  }, [brandStory]);

  const isLoading = isUserLoading || isStoryLoading;


  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Prompt Generator</CardTitle>
          <CardDescription>
            Describe your goal, and we'll generate an optimized prompt for your favorite AI platform, using your saved brand story as context.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandDescription">Brand Description (auto-filled from your story)</Label>
              <Textarea
                id="brandDescription"
                name="brandDescription"
                placeholder="Your brand story content will be automatically used here."
                className="min-h-24"
                required
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                disabled={isLoading}
              />
              {state.fieldErrors?.brandDescription && <p className="text-sm text-destructive">{state.fieldErrors.brandDescription}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                name="targetAudience"
                placeholder="e.g., Tech-savvy millennials, small business owners"
                required
                disabled={isLoading}
              />
              {state.fieldErrors?.targetAudience && <p className="text-sm text-destructive">{state.fieldErrors.targetAudience}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contentGoal">Content Goal</Label>
              <Input
                id="contentGoal"
                name="contentGoal"
                placeholder="e.g., Increase brand awareness, drive sign-ups"
                required
                disabled={isLoading}
              />
              {state.fieldErrors?.contentGoal && <p className="text-sm text-destructive">{state.fieldErrors.contentGoal}</p>}
            </div>
            <div className="space-y-2">
                <Label>AI Platform</Label>
                <Select name="platform" onValueChange={setPlatform} required disabled={isLoading}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                        <SelectItem value="Gemini">Gemini</SelectItem>
                        <SelectItem value="Midjourney">Midjourney (for images)</SelectItem>
                        <SelectItem value="DALL-E">DALL-E (for images)</SelectItem>
                    </SelectContent>
                </Select>
                {state.fieldErrors?.platform && <p className="text-sm text-destructive">{state.fieldErrors.platform}</p>}
            </div>
            {state.error && (
                <Alert variant="destructive" className="mt-6">
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
      
      <div className="space-y-8">
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Generated Prompt</CardTitle>
                    <CardDescription>Copy and paste this into your chosen AI tool.</CardDescription>
                </div>
                {state.aiPrompt && <CopyButton textToCopy={state.aiPrompt} />}
            </CardHeader>
            <CardContent className="flex-1">
            {state.aiPrompt ? (
                <div className="prose prose-sm max-w-none bg-muted rounded-lg p-4 text-foreground/90 whitespace-pre-wrap">
                    <code>{state.aiPrompt}</code>
                </div>
            ) : (
                <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8">
                <div className="text-center text-muted-foreground">
                    <Sparkles className="mx-auto h-12 w-12" />
                    <p className="mt-4 text-lg">Your optimized AI prompt will appear here.</p>
                </div>
                </div>
            )}
            </CardContent>
        </Card>

        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Usage Instructions</CardTitle>
                <CardDescription>How to get the best results with your prompt.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
            {state.usageInstructions ? (
                <div className="prose prose-sm max-w-none text-card-foreground/90 whitespace-pre-wrap">
                    <p>{state.usageInstructions}</p>
                </div>
            ) : (
                <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8">
                <div className="text-center text-muted-foreground">
                    <p className="mt-4 text-lg">Instructions will appear here.</p>
                </div>
                </div>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
