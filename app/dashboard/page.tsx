import {
  MOCK_USER,
  MOCK_ALLERGIES,
  MOCK_MEDICATIONS,
  MOCK_CONDITIONS,
  MOCK_TIMELINE,
  MOCK_DOCUMENTS,
  MOCK_CONSENTS
} from "@/lib/mock-data";
import { HealthSummaryCards } from "@/components/dashboard/HealthSummaryCards";
import { QuickStatsBar } from "@/components/dashboard/QuickStatsBar";
import { UpcomingSection } from "@/components/dashboard/UpcomingSection";
import { MedicationReminders } from "@/components/dashboard/MedicationReminders";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ShieldCheck, QrCode, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardHomePage() {
  const pendingConsents = MOCK_CONSENTS.filter(c => c.status === "PENDING");
  const documentsToReview = MOCK_DOCUMENTS.filter(d => d.status === "PROCESSING" || d.status === "NEEDS_REVIEW");

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      {/* Welcome Hero */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight">
              {greeting}, {MOCK_USER.name.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground text-base">
              Your health record, in one place.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-sm w-fit">
            <span className="text-muted-foreground font-medium">ABHA</span>
            <code className="font-mono text-foreground font-semibold text-xs">
              {MOCK_USER.abhaId}
            </code>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section>
        <HealthSummaryCards
          medicationsCount={MOCK_MEDICATIONS.filter(m => m.status === 'Active').length}
          allergiesCount={MOCK_ALLERGIES.length}
          conditionsCount={MOCK_CONDITIONS.filter(c => c.status === 'Active').length}
          recordsCount={MOCK_TIMELINE.length + MOCK_DOCUMENTS.length}
        />
      </section>

      {/* Quick Stats Bar */}
      <section>
        <QuickStatsBar />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Action Items - Only show if there's action needed */}
          {(pendingConsents.length > 0 || documentsToReview.length > 0) && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold font-heading text-foreground">Action Needed</h2>
              <div className="flex flex-col gap-3">
                {pendingConsents.length > 0 && (
                  <Link href="/dashboard/consent" className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-warm-tint/50 border border-border hover:border-primary/50 transition-all">
                      <div className="size-9 rounded-full bg-primary-tint flex items-center justify-center">
                        <ShieldCheck className="size-4 text-primary stroke-[1.5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Consent Request</p>
                        <p className="text-xs text-muted-foreground truncate">{pendingConsents[0].facility} requested access</p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                )}

                {documentsToReview.length > 0 && (
                  <Link href="/dashboard/documents" className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary-tint/50 border border-border hover:border-primary/50 transition-all">
                      <div className="size-9 rounded-full bg-secondary-tint flex items-center justify-center">
                        <FileText className="size-4 text-secondary stroke-[1.5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Document Extracted</p>
                        <p className="text-xs text-muted-foreground truncate">{documentsToReview[0].title} needs review</p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* Upcoming Appointments & Reminders */}
          <UpcomingSection />

          {/* Recent Timeline */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold font-heading text-foreground">Recent Activity</h2>
              <Link href="/dashboard/timeline" className="text-sm font-medium text-primary hover:underline underline-offset-4 flex items-center gap-1">
                View timeline <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {MOCK_TIMELINE.slice(0, 3).map((record) => (
                <div key={record.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                  <div className="mt-1">
                    <div className="size-9 rounded-full bg-primary-tint/40 flex items-center justify-center">
                      <Activity className="size-4 text-primary stroke-[1.5]" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-medium text-foreground truncate">{record.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{record.facility}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Medication Reminders */}
          <MedicationReminders />

          {/* Emergency Quick Access */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold font-heading text-foreground">Quick Access</h2>
            <Card className="bg-card shadow-sm border-border">
              <CardContent className="p-5 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Activity className="size-5 text-destructive stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground font-heading">Emergency Info</h3>
                    <p className="text-xs text-muted-foreground">Critical medical details</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 border-t border-border/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Blood Type</span>
                    <span className="text-base font-bold text-destructive font-heading">{MOCK_USER.bloodGroup}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Birth Year</span>
                    <span className="text-sm font-medium font-mono">{MOCK_USER.dob.split('-')[0]}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider block mb-2">Critical Allergies</span>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_ALLERGIES.filter(a => a.severity === 'High').map(a => (
                      <Badge key={a.id} variant="destructive" className="bg-destructive/10 text-destructive border-transparent rounded-md px-2 py-0.5">
                        {a.allergen}
                      </Badge>
                    ))}
                    {MOCK_ALLERGIES.filter(a => a.severity === 'High').length === 0 && (
                      <span className="text-xs text-muted-foreground">None recorded</span>
                    )}
                  </div>
                </div>

                <Link href="/dashboard/emergency" className="mt-2 text-center w-full block">
                  <Button variant="outline" className="w-full gap-2 text-foreground" size="sm">
                    <QrCode className="size-4 text-muted-foreground stroke-[1.5]" />
                    Open Emergency Card
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
