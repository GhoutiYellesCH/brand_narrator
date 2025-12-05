'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Linkedin, Twitter, PlusCircle } from 'lucide-react';
import type { Post, Column, ColumnId } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const platformIcons = {
  twitter: <Twitter className="h-4 w-4 text-sky-500" />,
  linkedin: <Linkedin className="h-4 w-4 text-blue-700" />,
  instagram: <Instagram className="h-4 w-4 text-pink-500" />,
  facebook: <Facebook className="h-4 w-4 text-blue-600" />,
};

const initialPosts: Post[] = [
  {
    id: '1',
    platform: 'linkedin',
    content: "We're excited to share our origin story! It all started with a simple idea...",
    scheduledAt: new Date(new Date().setDate(new Date().getDate() + 3)),
    image: PlaceHolderImages.find(img => img.id === 'content-planner-1')?.imageUrl,
    imageHint: PlaceHolderImages.find(img => img.id === 'content-planner-1')?.imageHint,
  },
  {
    id: '2',
    platform: 'twitter',
    content: "What are our core values? Authenticity, Innovation, and Customer-first. #StartupLife #BrandStory",
    scheduledAt: new Date(new Date().setDate(new Date().getDate() + 5)),
  },
  {
    id: '3',
    platform: 'instagram',
    content: "A look behind the scenes at BrandNarrator HQ. This is where the magic happens!",
    scheduledAt: new Date(new Date().setDate(new Date().getDate() + 7)),
    image: PlaceHolderImages.find(img => img.id === 'content-planner-2')?.imageUrl,
    imageHint: PlaceHolderImages.find(img => img.id === 'content-planner-2')?.imageHint,
  },
];

const initialColumns: Record<ColumnId, Column> = {
  ideas: {
    id: 'ideas',
    title: 'Ideas',
    posts: [
      {
        id: '4',
        platform: 'facebook',
        content: "Announce new Prompt Generator feature and how it helps marketers.",
        scheduledAt: new Date(new Date().setDate(new Date().getDate() + 10)),
        image: PlaceHolderImages.find(img => img.id === 'content-planner-3')?.imageUrl,
        imageHint: PlaceHolderImages.find(img => img.id === 'content-planner-3')?.imageHint,
      },
    ],
  },
  scheduled: {
    id: 'scheduled',
    title: 'Scheduled',
    posts: initialPosts,
  },
  published: {
    id: 'published',
    title: 'Published',
    posts: [],
  },
};


function PostCard({ post }: { post: Post }) {
  return (
    <Card className="mb-4 bg-background hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {post.image && (
          <div className="relative aspect-video mb-3">
             <Image
                src={post.image}
                alt={post.content.substring(0, 30)}
                fill
                className="rounded-md object-cover"
                data-ai-hint={post.imageHint}
              />
          </div>
        )}
        <p className="text-sm text-foreground/90 mb-3">{post.content}</p>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {platformIcons[post.platform]}
            <span className="capitalize">{post.platform}</span>
          </div>
          <Badge variant="outline">{format(post.scheduledAt, 'MMM d')}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function PlannerColumn({ column }: { column: Column }) {
  return (
    <Card className="flex-1 flex flex-col min-w-[300px] bg-muted/50">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex justify-between items-center">
          {column.title}
          <Badge variant="secondary">{column.posts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {column.posts.length > 0 ? (
          column.posts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
            <p>No posts in this stage.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export function ContentPlanner() {
  const [columns, setColumns] = useState(initialColumns);

  return (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-headline">Content Planner</h1>
                <p className="text-muted-foreground">Visualize and manage your social media content pipeline.</p>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Post
            </Button>
        </div>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
            {Object.values(columns).map(column => (
                <PlannerColumn key={column.id} column={column} />
            ))}
        </div>
    </div>
  );
}
