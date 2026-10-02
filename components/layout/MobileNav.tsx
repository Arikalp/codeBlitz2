"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const MOBILE_NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/timeline", label: "Records", icon: FileText },
  { href: "/dashboard/consent", label: "Share", icon: ShieldCheck },
  { href: "/dashboard/emergency", label: "Emergency", icon: AlertTriangle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Top Header */}
      <header className="flex h-14 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md px-4 sticky top-0 z-40 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
          <div className="size-5 rounded-md bg-primary flex items-center justify-center">
            <span aria-hidden="true" className="text-white text-[10px]">🩺</span>
          </div>
          <span>HealthSetu</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu" className="text-muted-foreground">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:w-80 p-0 border-l-border/40">
            <div className="p-6 pb-2 border-b border-border/40">
              <SheetTitle className="text-lg font-semibold tracking-tight">Navigation Menu</SheetTitle>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              <Link href="/dashboard" className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Home</Link>
              <Link href="/dashboard/timeline" className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Health Timeline</Link>
              <Link href="/dashboard/documents" className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Documents</Link>
              <Link href="/dashboard/consent" className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Consent & Sharing</Link>
              <Link href="/dashboard/ai" className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">AI Assistant</Link>
              <div className="h-px bg-border/40 my-2 mx-4" />
              <Link href="/dashboard/profile" className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Profile</Link>
              <Link href="/dashboard/settings" className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Settings</Link>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-safe lg:hidden pb-safe-bottom">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"
              )}
            >
              <div className={cn(
                "flex items-center justify-center py-1 px-4 rounded-full transition-all duration-200",
                 isActive && "bg-primary/10"
              )}>
                <item.icon className={cn("size-5 stroke-[1.5]", isActive && "fill-primary/20")} aria-hidden="true" />
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
