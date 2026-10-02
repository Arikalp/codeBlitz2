/**
 * app/dashboard/page.tsx
 *
 * /dashboard — Patient dashboard home.
 * Renders the interactive DashboardContent wired to live records and document library.
 */

import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import DashboardContent from "@/components/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "HealthSetu patient dashboard - overview of medical records and health timeline",
};

export default function DashboardPage() {
  return (
    <AppShell title="My Dashboard">
      <DashboardContent />
    </AppShell>
  );
}
