"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DemoModeBanner } from "@/components/shared/DemoModeBanner";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Format pathname into a readable title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    const segment = pathname.split("/").pop();
    if (!segment) return "Dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background overflow-hidden">
      <div className="flex flex-1 overflow-hidden relative">
        <AppSidebar />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Topbar Desktop */}
          <header className="hidden lg:flex h-16 items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 shrink-0 sticky top-0 z-40">
            <h1 className="text-xl font-heading font-semibold text-foreground tracking-tight">
              {getPageTitle()}
            </h1>
            <div className="flex items-center gap-5">
              <div className="hidden lg:block w-fit mr-4">
                <DemoModeBanner className="rounded-full border shadow-sm py-1.5 px-4 bg-warning/5 border-warning/10" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <button aria-label="Search" className="hover:text-foreground hover:bg-muted transition-colors p-2 rounded-full hidden sm:block">
                  <Search className="size-4" />
                </button>
                <button aria-label="Notifications" className="hover:text-foreground hover:bg-muted transition-colors relative p-2 rounded-full">
                  <Bell className="size-4" />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
                </button>
              </div>
            </div>
          </header>

          {/* Mobile Topbar & Banner */}
          <div className="lg:hidden">
            <DemoModeBanner />
          </div>

          <MobileNav />

          <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-10 pb-24 lg:pb-12 relative bg-background">
            <div className="animate-fade-in mx-auto w-full max-w-5xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
