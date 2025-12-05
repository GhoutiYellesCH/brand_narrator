import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Logo } from '@/components/logo';
import {
  BotMessageSquare,
  BookHeart,
  CalendarDays,
  Sparkles,
  BarChart3,
  Plug,
} from 'lucide-react';
import { Sidebar, SidebarProvider, SidebarBody, SidebarNav, SidebarNavItem, SidebarHeader, SidebarTrigger, SidebarContent, SidebarFooter } from '@/components/layout/sidebar';

export const metadata: Metadata = {
  title: 'BrandNarrator',
  description: 'Weave your brand\'s story with the power of AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          'antialiased font-body'
        )}
      >
        <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar>
              <SidebarHeader>
                <Logo />
              </SidebarHeader>
              <SidebarBody>
                <SidebarNav>
                  <SidebarNavItem href="/" icon={<BotMessageSquare />}>
                    Story Gathering
                  </SidebarNavItem>
                  <SidebarNavItem href="/brand-story" icon={<BookHeart />}>
                    Brand Story
                  </SidebarNavItem>
                  <SidebarNavItem href="/content-planner" icon={<CalendarDays />}>
                    Content Planner
                  </SidebarNavItem>
                  <SidebarNavItem
                    href="/prompt-generator"
                    icon={<Sparkles />}
                  >
                    Prompt Generator
                  </SidebarNavItem>
                  <SidebarNavItem href="/analytics" icon={<BarChart3 />}>
                    Analytics
                  </SidebarNavItem>
                  <SidebarNavItem href="/integrations" icon={<Plug />}>
                    Integrations
                  </SidebarNavItem>
                </SidebarNav>
              </SidebarBody>
              <SidebarFooter>
                {/* Optional: Add footer content like user profile */}
              </SidebarFooter>
            </Sidebar>
            <SidebarContent>
                <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                    <SidebarTrigger />
                    <h1 className="text-lg font-semibold md:text-2xl font-headline">BrandNarrator</h1>
                </header>
                <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
            </SidebarContent>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
