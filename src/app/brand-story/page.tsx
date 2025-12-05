import { BrandStoryGenerator } from '@/components/features/brand-story-generator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Brand Story Generator | BrandNarrator',
    description: 'Turn your inputs into a compelling brand narrative with AI.',
};

export default function BrandStoryPage() {
    return <BrandStoryGenerator />;
}
