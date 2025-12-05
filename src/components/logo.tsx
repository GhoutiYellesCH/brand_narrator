import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-primary"
      >
        <path d="M12 3a9 9 0 0 0 0 18h-3a9 9 0 0 1-9-9 9 9 0 0 1 9-9z" />
        <path d="M12 3v18" />
        <path d="M12 12h6a3 3 0 0 1 3 3 3 3 0 0 1-3 3h-6" />
        <path d="M12 6h3a3 3 0 0 1 3 3 3 3 0 0 1-3 3h-3" />
      </svg>

      <span className="font-headline text-xl font-semibold text-foreground">
        BrandNarrator
      </span>
    </Link>
  );
}
