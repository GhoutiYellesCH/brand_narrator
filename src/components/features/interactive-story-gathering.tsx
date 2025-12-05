'use client';

import { useState, useRef, useEffect, useTransition, useMemo } from 'react';
import { Bot, User, CornerDownLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getAiStoryResponse } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function InteractiveStoryGathering() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm here to help you craft your brand's story. To start, could you tell me your company's name and how it all began?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const brandStoryRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid, 'brandStories', 'default');
  }, [firestore, user?.uid]);

  const { data: brandStory, isLoading: isStoryLoading } = useDoc<any>(brandStoryRef);

  // This state will hold the definitive conversation history from Firestore
  const [conversationHistory, setConversationHistory] = useState('');

  useEffect(() => {
    // When brandStory data loads, update the conversation history state
    if (brandStory?.storyConversation) {
      setConversationHistory(brandStory.storyConversation);
    }
  }, [brandStory]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !user || !brandStory) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    const currentMessagesCount = messages.filter(m => m.role === 'user').length;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    startTransition(async () => {
      const result = await getAiStoryResponse(input, conversationHistory, brandStory.id, currentMessagesCount);
      if (result.error) {
        toast({
            variant: "destructive",
            title: "An error occurred",
            description: result.error,
        });
        // Revert message on error
        setMessages(prev => prev.slice(0, -1));
      } else if(result.aiResponse && result.updatedConversationHistory) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.aiResponse,
        };
        setMessages(prev => [...prev, aiMessage]);
        // The definitive history is now the one returned by the server action
        setConversationHistory(result.updatedConversationHistory);
      }
    });
  };

  const isLoading = isUserLoading || isStoryLoading;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
      <>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4 animate-in fade-in zoom-in-95',
                message.role === 'user' ? 'justify-end' : ''
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-9 w-9 border-2 border-primary">
                  <AvatarFallback>
                    <Bot className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-md rounded-lg px-4 py-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-9 w-9 border-2 border-accent">
                   <AvatarFallback>
                    <User className="h-5 w-5 text-accent" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isPending && (
             <div className="flex items-start gap-4 animate-pulse">
                <Avatar className="h-9 w-9 border-2 border-primary">
                  <AvatarFallback>
                    <Bot className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-md rounded-lg px-4 py-3 bg-muted">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form
          onSubmit={handleSubmit}
          className="relative"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={user ? "Tell me about your startup..." : "Please log in to chat"}
            className="pr-16 text-base"
            disabled={isPending || !user}
            aria-label="Your response to the AI"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-10"
            disabled={isPending || !input.trim() || !user}
            aria-label="Send message"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
          </Button>
        </form>
      </div>
       </>
      )}
    </div>
  );
}
