'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Post } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { GripVertical, Twitter, Linkedin, Facebook, Instagram, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Image from 'next/image';

interface PostCardProps {
  post: Post;
  isOverlay?: boolean;
}

const platformIcons = {
  twitter: <Twitter className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
};

export function PostCard({ post, isOverlay }: PostCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: post.id,
    data: {
      type: "Post",
      post,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  
  const getStatus = () => {
    if (post.columnId === 'published') {
        return (
            <Badge variant="secondary" className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Published {formatDistanceToNow(post.scheduledAt!, { addSuffix: true })}
            </Badge>
        );
    }
    if (post.columnId === 'scheduled' && post.scheduledAt) {
        return (
            <Badge variant="secondary" className="flex items-center gap-1.5 text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                Scheduled for {format(post.scheduledAt, 'MMM d, H:mm')}
            </Badge>
        );
    }
    return null;
  }

  const containerClasses = cn(
    "touch-none",
    isDragging && "opacity-50",
    isOverlay && "ring-2 ring-primary"
  );

  return (
    <Card ref={setNodeRef} style={style} className={containerClasses}>
      <CardHeader className="p-3 flex-row items-start justify-between">
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize flex items-center gap-1.5">
                {platformIcons[post.platform]} {post.platform}
            </Badge>
        </div>
        <button {...attributes} {...listeners} className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {post.imageHint && (
             <div className="aspect-video overflow-hidden rounded-md mb-2 bg-muted">
                <Image
                    src={`https://picsum.photos/seed/${post.id}/300/200`}
                    alt={post.imageHint}
                    width={300}
                    height={200}
                    className="object-cover w-full h-full"
                    data-ai-hint={post.imageHint}
                />
            </div>
        )}
        <p className="text-sm">{post.content}</p>
      </CardContent>
      {getStatus() && (
        <CardFooter className="p-3 pt-0">
          {getStatus()}
        </CardFooter>
      )}
    </Card>
  );
}
