/**
 * app/dashboard/layout.tsx
 *
 * Shared layout for all /dashboard/* routes.
 * Wraps pages inside the AppShell (sidebar + topbar).
 *
 * The `title` is passed via a per-page metadata export and
 * resolved server-side. For now, individual pages pass it
 * via the AppShell component directly.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | HealthSetu",
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // AppShell (client component) is used by each page directly so it can
  // receive the correct page title. This layout just provides the route wrapper.
  return <>{children}</>;
}
