import { PromptGenerator } from '@/components/features/prompt-generator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Prompt Generator | BrandNarrator',
    description: 'Generate optimized AI prompts to create stunning marketing content.',
};

export default function PromptGeneratorPage() {
    return <PromptGenerator />;
}
