"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileText,
  ShieldCheck,
  MessageSquareHeart,
  Settings,
  AlertTriangle,
  User,
  HeartPulse
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/dashboard/timeline", label: "Health Timeline", icon: HeartPulse },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/consent", label: "Consent & Sharing", icon: ShieldCheck },
  { href: "/dashboard/emergency", label: "Emergency Card", icon: AlertTriangle },
  { href: "/dashboard/ai", label: "AI Assistant", icon: MessageSquareHeart },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-border/40 bg-sidebar lg:flex h-screen">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold text-base text-foreground tracking-tight transition-opacity hover:opacity-80">
          <div className="size-6 rounded-md bg-primary flex items-center justify-center">
            <span aria-hidden="true" className="text-white text-[10px]">🩺</span>
          </div>
          <span>HealthSetu</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-4 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group active:scale-[0.98]",
                isActive
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "size-4 stroke-[1.5] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/60 transition-colors cursor-pointer border border-transparent hover:border-border/50">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold text-xs border border-border/50">
            AS
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate text-foreground">Arjun Sharma</span>
            <span className="text-xs text-muted-foreground font-mono truncate">DEMO-1234</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
