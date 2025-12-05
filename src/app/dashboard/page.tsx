import { AnalyticsDashboard } from '@/components/features/analytics-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | BrandNarrator',
  description: 'View your content performance at a glance.',
};

export default function DashboardPage() {
  return (
    <AnalyticsDashboard />
  );
}
