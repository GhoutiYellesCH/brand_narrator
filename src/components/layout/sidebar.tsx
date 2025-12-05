"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface SidebarContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r bg-card">
        {children}
      </div>
      <MobileSidebar>{children}</MobileSidebar>
    </>
  );
}

function MobileSidebar({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useSidebar();
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="p-0 bg-card border-r w-64">
        <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}

export function SidebarTrigger() {
  const { setIsOpen } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={() => setIsOpen(true)}
      aria-label="Open sidebar"
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
}

export function SidebarHeader({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6", className)}
    >
      {children}
    </div>
  );
}

export function SidebarBody({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ScrollArea className={cn("flex-1", className)}>
      {children}
    </ScrollArea>
  );
}

export function SidebarNav({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4 py-4", className)}>
      {children}
    </nav>
  );
}

export function SidebarNavItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
        isActive && "bg-muted text-primary"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

export function SidebarFooter({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("mt-auto border-t p-4", className)}>
            {children}
        </div>
    )
}

export function SidebarContent({
    className,
    children
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex flex-col flex-1", className)}>
            {children}
        </div>
    )
}
