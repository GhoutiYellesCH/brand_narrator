import { ContentPlanner } from '@/components/features/content-planner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Content Planner | BrandNarrator',
    description: 'Plan and schedule your social media content.',
};

export default function ContentPlannerPage() {
    return <ContentPlanner />;
}
