import { AnalyticsDashboard } from '@/components/features/analytics-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Content Analytics | BrandNarrator',
    description: 'Track and analyze your content performance.',
};

export default function AnalyticsPage() {
    return <AnalyticsDashboard />;
}
