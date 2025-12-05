export type Post = {
    id: string;
    platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook';
    content: string;
    scheduledAt: Date;
    image?: string;
    imageHint?: string;
};
  
export type ColumnId = 'ideas' | 'scheduled' | 'published';

export type Column = {
    id: ColumnId;
    title: string;
    posts: Post[];
};
