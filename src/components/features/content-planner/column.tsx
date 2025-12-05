'use client';

import { useMemo } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { type Post, type Column as ColumnType } from '@/lib/definitions';
import { PostCard } from './post-card';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ColumnProps {
  column: ColumnType;
  posts: Post[];
}

export function Column({ column, posts }: ColumnProps) {
  const postsIds = useMemo(() => posts.map((p) => p.id), [posts]);

  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex h-full min-h-[600px] w-full flex-col rounded-lg bg-card border"
    >
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-headline text-lg font-semibold">
          {column.title}
        </h3>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-sm text-primary font-semibold">
          {posts.length}
        </span>
      </div>

      <div className="flex flex-grow flex-col gap-4 p-4">
        <SortableContext items={postsIds}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </SortableContext>
      </div>

       <div className="border-t p-2">
            <Button variant="ghost" className="w-full justify-center gap-2 text-muted-foreground">
                <PlusCircle className="h-4 w-4" />
                Add new post
            </Button>
       </div>
    </div>
  );
}
