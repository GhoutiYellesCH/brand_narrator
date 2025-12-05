import { Integrations } from '@/components/features/integrations';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Platform Integrations | BrandNarrator',
    description: 'Connect your favorite marketing and sales tools.',
};

export default function IntegrationsPage() {
    return <Integrations />;
}
