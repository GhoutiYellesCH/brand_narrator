'use client';

import React, { useState, useEffect } from 'react';
import { type Post, type Column, type ColumnId } from '@/lib/definitions';
import { DndContext, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { PostCard } from './post-card';
import { Column as KanbanColumn } from './column';

const initialPosts: Post[] = [
  { id: '1', columnId: 'ideas', content: 'New product launch announcement!', platform: 'twitter', scheduledAt: null, imageHint: 'product launch' },
  { id: '2', columnId: 'ideas', content: 'A behind-the-scenes look at our team.', platform: 'instagram', scheduledAt: null, imageHint: 'team photo' },
  { id: '3', columnId: 'scheduled', content: 'Our weekly industry insights roundup.', platform: 'linkedin', scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), imageHint: 'business data' },
  { id: '4', columnId: 'published', content: 'We just published a new blog post on storytelling!', platform: 'facebook', scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), imageHint: 'blog post' },
  { id: '5', columnId: 'ideas', content: 'Customer testimonial from a happy client.', platform: 'twitter', scheduledAt: null, imageHint: 'happy customer' },
];


export function ContentPlanner() {
  const [columns, setColumns] = useState<Column[]>(() => [
    { id: 'ideas', title: 'Ideas' },
    { id: 'scheduled', title: 'Scheduled' },
    { id: 'published', title: 'Published' },
  ]);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const [activePost, setActivePost] = useState<Post | null>(null);

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Post") {
      setActivePost(event.active.data.current.post);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActivePost(null);
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    setPosts((posts) => {
      const activeIndex = posts.findIndex((p) => p.id === active.id);
      const overIndex = posts.findIndex((p) => p.id === over.id);
      
      // Note: this is a simplistic reordering. A more robust solution
      // would use dnd-kit's sensors and sorting strategies.
      let newPosts = [...posts];
      if (activeIndex !== -1 && overIndex !== -1) {
        [newPosts[activeIndex], newPosts[overIndex]] = [newPosts[overIndex], newPosts[activeIndex]];
      }

      return newPosts;
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAPost = active.data.current?.type === "Post";
    const isOverAPost = over.data.current?.type === "Post";
    const isOverAColumn = over.data.current?.type === "Column";

    // Dropping a Post over a Column
    if (isActiveAPost && isOverAColumn) {
      setPosts((prev) => {
        const activeIndex = prev.findIndex((p) => p.id === activeId);
        if (prev[activeIndex].columnId !== overId) {
          prev[activeIndex].columnId = overId as ColumnId;
          return [...prev];
        }
        return prev;
      });
    }
  };
  
  return (
    <div className="space-y-6">
       <div className="space-y-1.5">
        <h1 className="text-2xl font-headline">Content Planner</h1>
        <p className="text-muted-foreground">
            Drag and drop posts to organize your social media calendar.
        </p>
      </div>
      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => (
                <KanbanColumn
                key={col.id}
                column={col}
                posts={posts.filter((p) => p.columnId === col.id)}
                />
            ))}
        </div>
        {typeof document !== 'undefined' && createPortal(
          activePost ? <PostCard post={activePost} isOverlay /> : null,
          document.body
        )}
      </DndContext>
    </div>
  );
}
