
'use client';

import { useActionState, useEffect, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateBrandStoryAction, type BrandStoryState } from '@/lib/ai-actions';
import { Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

const initialState: BrandStoryState = {};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className="w-full mt-6"
      size="lg"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Story...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" /> Generate My Brand Story
        </>
      )}
    </Button>
  );
}

export function BrandStoryGenerator() {
  const [state, formAction] = useActionState(generateBrandStoryAction, initialState);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const brandStoryRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid, 'brandStories', 'default');
  }, [firestore, user?.uid]);

  const { data: brandStory, isLoading: isStoryLoading } = useDoc<any>(brandStoryRef);

  const [formValues, setFormValues] = useState<any>(brandStory || {});

  useEffect(() => {
    if (brandStory) {
      setFormValues(brandStory);
    }
  }, [brandStory]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev: any) => ({ ...prev, [name]: value }));
  };

  const isLoading = isUserLoading || isStoryLoading;

  if (isLoading) {
    return <BrandStorySkeleton />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Comprehensive Story Builder
            </CardTitle>
            <CardDescription>
              Answer these questions to provide our AI with the raw material to craft a powerful
              and authentic brand narrative. The more detail, the better. Your progress is saved automatically.
            </CardDescription>
          </CardHeader>
          <form action={formAction}>
            <input type="hidden" name="brandStoryId" value="default" />
            <CardContent>
              <Accordion type="multiple" className="w-full space-y-4" defaultValue={['item-0', 'item-1', 'item-2']}>
                <AccordionItem value="item-0" className="border rounded-lg px-4 bg-background/50">
                    <AccordionTrigger className="font-semibold text-lg">Core Identity</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input id="companyName" name="companyName" placeholder="e.g., Innovate Inc." required value={formValues.companyName || ''} onChange={handleInputChange} />
                            {state.fieldErrors?.companyName && <p className="text-sm text-destructive">{state.fieldErrors.companyName.join(', ')}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mission">Mission / Purpose</Label>
                            <Textarea id="mission" name="mission" placeholder="e.g., To empower small businesses with the tools to build their brand narrative." required value={formValues.mission || ''} onChange={handleInputChange} />
                            {state.fieldErrors?.mission && <p className="text-sm text-destructive">{state.fieldErrors.mission.join(', ')}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="values">Core Values</Label>
                            <Textarea id="values" name="values" placeholder="e.g., Authenticity, Innovation, Customer-Centricity, Simplicity." required value={formValues.values || ''} onChange={handleInputChange}/>
                            {state.fieldErrors?.values && <p className="text-sm text-destructive">{state.fieldErrors.values.join(', ')}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vision">Long-Term Vision</Label>
                          <Input id="vision" name="vision" placeholder="e.g., To become the leading platform for brand storytelling globally." value={formValues.vision || ''} onChange={handleInputChange}/>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-1" className="border rounded-lg px-4 bg-background/50">
                  <AccordionTrigger className="font-semibold text-lg">
                    Founding Story & Purpose
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                     <div className="space-y-2">
                      <Label htmlFor="foundingStory">How and when was your company founded?</Label>
                      <Textarea id="foundingStory" name="foundingStory" placeholder="e.g., In 2022, our co-founders, former colleagues..." value={formValues.foundingStory || ''} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="problemToSolve">What problem or need were you trying to solve?</Label>
                      <Textarea id="problemToSolve" name="problemToSolve" placeholder="e.g., Small businesses were struggling to manage their online presence..." value={formValues.problemToSolve || ''} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ahaMoment">What was the “aha” moment?</Label>
                      <Textarea id="ahaMoment" name="ahaMoment" placeholder="e.g., The idea struck during a frustrating brainstorming session..." value={formValues.ahaMoment || ''} onChange={handleInputChange}/>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="foundingTeam">Who are the co-founders and what roles did they play?</Label>
                      <Textarea id="foundingTeam" name="foundingTeam" placeholder="e.g., Jane Doe, the visionary, and John Smith, the architect..." value={formValues.foundingTeam || ''} onChange={handleInputChange}/>
                    </div>
                    <div className="spacey-2">
                      <Label htmlFor="founderValues">What personal values drove you to launch this company?</Label>
                      <Textarea id="founderValues" name="founderValues" placeholder="e.g., A deep belief in democratizing technology..." value={formValues.founderValues || ''} onChange={handleInputChange}/>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-2" className="border rounded-lg px-4 bg-background/50">
                  <AccordionTrigger className="font-semibold text-lg">Products & Services</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                     <div className="space-y-2">
                        <Label htmlFor="products">What products or services do you offer?</Label>
                        <Textarea id="products" name="products" placeholder="e.g., An AI-powered platform for brand story generation..." value={formValues.products || ''} onChange={handleInputChange}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="uniqueProblem">What unique problems do your products/services solve?</Label>
                        <Textarea id="uniqueProblem" name="uniqueProblem" placeholder="e.g., We eliminate the need for expensive marketing agencies..." value={formValues.uniqueProblem || ''} onChange={handleInputChange}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="valueProposition">What is your value proposition in one sentence?</Label>
                        <Input id="valueProposition" name="valueProposition" placeholder="e.g., We provide startups with an affordable, all-in-one AI platform..." value={formValues.valueProposition || ''} onChange={handleInputChange}/>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border rounded-lg px-4 bg-background/50">
                    <AccordionTrigger className="font-semibold text-lg">Target Customers & Audience</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="idealCustomer">Who is your ideal customer?</Label>
                            <Textarea id="idealCustomer" name="idealCustomer" placeholder="e.g., Early-stage startup founders, solo entrepreneurs..." value={formValues.idealCustomer || ''} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerPainPoints">What pain points do they face?</Label>
                            <Textarea id="customerPainPoints" name="customerPainPoints" placeholder="e.g., They lack the time, budget, and expertise..." value={formValues.customerPainPoints || ''} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerFeeling">How do customers feel after using your product/service?</Label>
                            <Input id="customerFeeling" name="customerFeeling" placeholder="e.g., Empowered, confident, relieved, creative." value={formValues.customerFeeling || ''} onChange={handleInputChange}/>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="border rounded-lg px-4 bg-background/50">
                    <AccordionTrigger className="font-semibold text-lg">Competition & Differentiation</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="competitors">Who are your main competitors?</Label>
                            <Textarea id="competitors" name="competitors" placeholder="e.g., Traditional marketing agencies, generic AI writing tools..." value={formValues.competitors || ''} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="differentiation">How is your offering better or different?</Label>
                            <Textarea id="differentiation" name="differentiation" placeholder="e.g., We are an integrated solution focused on brand narrative..." value={formValues.differentiation || ''} onChange={handleInputChange}/>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5" className="border rounded-lg px-4 bg-background/50">
                    <AccordionTrigger className="font-semibold text-lg">Additional Context</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="storyConversation">Story Gathering Chat Transcript</Label>
                          <Textarea id="storyConversation" name="storyConversation" placeholder="Paste the full conversation from the 'Story Gathering' chat here..." className="min-h-32" value={formValues.storyConversation || ''} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="additionalInfo">Other Company Info (e.g., Business Plan, Market Analysis)</Label>
                            <Textarea id="additionalInfo" name="additionalInfo" placeholder="Paste any other relevant documents or details here..." className="min-h-48" value={formValues.additionalInfo || ''} onChange={handleInputChange}/>
                        </div>
                    </AccordionContent>
                </AccordionItem>
              </Accordion>
              {state.error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <SubmitButton disabled={!user} />
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="flex flex-col sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline">Your Generated Story</CardTitle>
            <CardDescription>
              Here is the narrative crafted by our AI. Review, copy, and use it to inspire your
              audience.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px]">
            {state.brandStory || brandStory?.content ? (
              <div className="prose prose-sm max-w-none text-card-foreground/90 whitespace-pre-wrap h-full overflow-y-auto">
                <p>{state.brandStory || brandStory?.content}</p>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8">
                <div className="text-center text-muted-foreground">
                  <Wand2 className="mx-auto h-12 w-12" />
                  <p className="mt-4 text-lg">
                    Your brand story will appear here once generated.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BrandStorySkeleton() {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
