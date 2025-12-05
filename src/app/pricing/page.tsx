import { PricingPage } from '@/components/features/pricing-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing | BrandNarrator',
    description: 'Choose a plan that works for you.',
};

export default function Pricing() {
    return <PricingPage />;
}
