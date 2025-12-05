'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Sidebar, SidebarProvider, SidebarBody, SidebarNav, SidebarNavItem, SidebarHeader, SidebarTrigger, SidebarContent, SidebarFooter } from '@/components/layout/sidebar';
import { Logo } from '@/components/logo';
import {
  BotMessageSquare,
  BookHeart,
  CalendarDays,
  Sparkles,
  Home,
  LogOut,
  CreditCard,
} from 'lucide-react';
import { Button } from '../ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect } from 'react';

const publicRoutes = ['/login', '/'];

export default function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = getAuth();

  useEffect(() => {
    if (!isUserLoading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [user, isUserLoading, pathname, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (publicRoutes.includes(pathname) || isUserLoading) {
    if (isUserLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <Logo />
              </div>
            </div>
          );
    }
    return <>{children}</>;
  }


  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarBody>
            <SidebarNav>
              <SidebarNavItem href="/dashboard" icon={<Home />}>
                Dashboard
              </SidebarNavItem>
              <SidebarNavItem href="/story-gathering" icon={<BotMessageSquare />}>
                Story Gathering
              </SidebarNavItem>
              <SidebarNavItem href="/brand-story" icon={<BookHeart />}>
                Brand Story
              </SidebarNavItem>
              <SidebarNavItem href="/content-planner" icon={<CalendarDays />}>
                Content Planner
              </SidebarNavItem>
              <SidebarNavItem href="/prompt-generator" icon={<Sparkles />}>
                Prompt Generator
              </SidebarNavItem>
              <SidebarNavItem href="/pricing" icon={<CreditCard />}>
                Pricing
              </SidebarNavItem>
            </SidebarNav>
          </SidebarBody>
          <SidebarFooter>
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
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
  );
}
