import { ContentPlanner } from "@/components/features/content-planner";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Content Planner | BrandNarrator',
    description: 'Organize and schedule your brand stories for social media.',
};

export default function ContentPlannerPage() {
    return <ContentPlanner />;
}
