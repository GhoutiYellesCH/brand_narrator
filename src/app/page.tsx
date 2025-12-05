import { InteractiveStoryGathering } from '@/components/features/interactive-story-gathering';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Story Gathering | BrandNarrator',
  description: 'Let our AI guide you in telling your startup\'s unique story.',
};

export default function Home() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex-1 overflow-hidden">
        <InteractiveStoryGathering />
      </div>
    </div>
  );
}
