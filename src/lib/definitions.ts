export type Post = {
    id: string;
    columnId: ColumnId;
    platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook';
    content: string;
    scheduledAt: Date | null;
    image?: string;
    imageHint?: string;
};
  
export type ColumnId = 'ideas' | 'scheduled' | 'published';

export type Column = {
    id: ColumnId;
    title: string;
};

export interface BrandStory {
    id: string;
    userId: string;
    companyName: string;
    mission: string;
    values: string;
    content?: string;
    foundingStory?: string;
    problemToSolve?: string;
    ahaMoment?: string;
    foundingTeam?: string;
    founderValues?: string;
    vision?: string;
    products?: string;
    uniqueProblem?: string;
    valueProposition?: string;
    idealCustomer?: string;
    customerPainPoints?: string;
    customerFeeling?: string;
    competitors?: string;
    differentiation?: string;
    storyConversation?: string;
    additionalInfo?: string;
    createdAt: any;
    updatedAt: any;
  }
  
  export interface UserProfile {
    id: string;
    email: string;
    name: string;
    tokens: number;
    createdAt: any;
    lastLogin: any;
  }

    
