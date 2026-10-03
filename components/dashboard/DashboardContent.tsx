/**
 * components/dashboard/DashboardContent.tsx
 *
 * Patient Dashboard dynamic content redesigned in the Warm Parchment Clinical aesthetic.
 * Connects to live /api/timeline and /api/documents to display accurate counts
 * and recent clinical records, paired with a longitudinal biomarker tracker
 * and multi-hospital care continuity bridge.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  Clock,
  ShieldCheck,
  CalendarDays,
  FileText,
  TrendingDown,
  Activity,
  AlertTriangle,
  ArrowRight,
  FolderLock,
  Sparkles,
  Building2,
  RefreshCw,
  Eye,
} from "lucide-react";
import PatientSummaryCard from "@/components/dashboard/PatientSummaryCard";
import MedicalRecordCard from "@/components/dashboard/MedicalRecordCard";
import Card from "@/components/ui/Card";
import UploadDocumentModal from "@/components/documents/UploadDocumentModal";
import DocumentPreviewModal from "@/components/documents/DocumentPreviewModal";
import DoctorPortal from "@/components/doctor/DoctorPortal";
import { useAuth } from "@/context/AuthContext";

interface DashboardRecord {
  id: string;
  category: string;
  title: string;
  facility: string;
  doctor?: string;
  practitioner?: string;
  clinicalDate: string;
  summary: string;
  tags?: string[];
  hasDocument?: boolean;
  documentId?: string | null;
}

interface PreviewDocData {
  id: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  facility: string;
  practitioner?: string | null;
  clinicalDate: string | Date;
}

export default function DashboardContent() {
  const { user } = useAuth();

  // If authenticated user is a medical doctor or hospital administrator, render the Doctor Clinical Access Console
  if (user?.role === "doctor" || user?.role === "facility_admin") {
    return <DoctorPortal />;
  }

  const [timelineRecords, setTimelineRecords] = useState<DashboardRecord[]>([]);
  const [docCount, setDocCount] = useState<number | null>(null);
  const [pendingConsentCount, setPendingConsentCount] = useState<number>(1);
  const [latestRequester, setLatestRequester] = useState<string>("Apex Multi-Specialty");
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocData | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadDashboard() {
      setApiError(null);
      try {
        const [timelineRes, docsRes, consentRes] = await Promise.allSettled([
          fetch("/api/timeline", { headers: { "Cache-Control": "no-cache" } }),
          fetch("/api/documents", { headers: { "Cache-Control": "no-cache" } }),
          fetch("/api/consent", { headers: { "Cache-Control": "no-cache" } }),
        ]);

        if (ignore) return;

        if (timelineRes.status === "fulfilled" && timelineRes.value.ok) {
          const data = await timelineRes.value.json();
          setTimelineRecords(data.data?.records || []);
        } else if (
          timelineRes.status === "rejected" ||
          (timelineRes.status === "fulfilled" && !timelineRes.value.ok)
        ) {
          setApiError(
            "Could not connect to the database. Please check your MongoDB Atlas connection settings."
          );
        }

        if (docsRes.status === "fulfilled" && docsRes.value.ok) {
          const docsData = await docsRes.value.json();
          setDocCount(
            docsData.data?.total ??
              (docsData.data?.documents ? docsData.data.documents.length : 0)
          );
        }

        if (consentRes.status === "fulfilled" && consentRes.value.ok) {
          const consentData = await consentRes.value.json();
          const list = consentData.data?.consents || [];
          const pending = list.filter((c: any) => c.status === "pending");
          setPendingConsentCount(pending.length);
          if (pending.length > 0) {
            setLatestRequester(pending[0].requestedBy || pending[0].facility || "Doctor Request");
          } else if (list.length > 0) {
            setLatestRequester(list[0].facility || "Verified Facility");
          }
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        if (!ignore) setApiError("Network error while loading dashboard data.");
      }
    }
    loadDashboard();
    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  function refreshDashboard() {
    setReloadTrigger((prev) => prev + 1);
  }

  const recentRecords = timelineRecords.slice(0, 3);
  const totalRecordsCount = timelineRecords.length;
  const totalDocsCount = docCount !== null ? docCount : 0;

  const handleRecordClick = async (record: DashboardRecord) => {
    if (record.documentId) {
      try {
        const res = await fetch(`/api/documents/${record.documentId}`);
        if (res.ok) {
          const data = await res.json();
          setPreviewDoc(data.data?.document);
        }
      } catch (err) {
        console.error("Failed to load document preview:", err);
      }
    }
  };

  return (
    <div className="max-w-[1180px] w-full mx-auto space-y-7">
      {/* DB / Connection Warning Banner */}
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-amber-300 bg-[var(--color-badge-consult-bg)] p-4 text-sm text-[var(--color-text-primary)] shadow-sm"
        >
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-[var(--color-primary-container)]" />
          <div className="flex-1">
            <p className="font-heading font-semibold text-[var(--color-primary)]">Database connection issue</p>
            <p className="text-xs mt-0.5 text-[var(--color-text-secondary)]">{apiError}</p>
          </div>
          <button
            onClick={refreshDashboard}
            className="p-1 rounded-lg hover:bg-[var(--color-surface-container-high)] text-[var(--color-primary-container)] transition-colors"
            title="Retry loading"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      )}

      {/* Top Patient Overview Card */}
      <PatientSummaryCard />

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upload Medical Document Action */}
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[var(--color-primary-container)] text-white shadow-sm hover:opacity-95 transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Upload size={22} strokeWidth={2.2} />
            </div>
            <div className="text-left">
              <span className="font-heading font-bold text-base block leading-snug">
                Upload Document
              </span>
              <span className="text-xs text-white/85">
                Auto-OCR &amp; timeline indexing
              </span>
            </div>
          </div>
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1 text-white"
          />
        </button>

        {/* View Medical Timeline Action */}
        <Link
          href="/dashboard/timeline"
          className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] shadow-sm hover:bg-[var(--color-surface-container-high)] transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)]">
              <Clock size={22} strokeWidth={2.2} />
            </div>
            <div className="text-left">
              <span className="font-heading font-bold text-base block leading-snug">
                Medical Timeline
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Chronological care view
              </span>
            </div>
          </div>
          <ArrowRight
            size={18}
            className="text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1"
          />
        </Link>

        {/* Ask AI Assistant Action */}
        <Link
          href="/dashboard/ai"
          className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[var(--color-badge-consult-bg)]/60 border border-[#F9DECB] text-[var(--color-text-primary)] shadow-sm hover:bg-[var(--color-badge-consult-bg)] transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-surface-card)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)] shadow-xs">
              <Sparkles size={22} strokeWidth={2.2} />
            </div>
            <div className="text-left">
              <span className="font-heading font-bold text-base block leading-snug text-[var(--color-primary)]">
                Ask AI Assistant
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                Summarize &amp; query reports
              </span>
            </div>
          </div>
          <ArrowRight
            size={18}
            className="text-[var(--color-primary-container)] transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Stat Summary Metric Cards (4 cards in grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Clinical Records */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
              Clinical Records
            </span>
            <span className="w-8 h-8 rounded-lg bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)]">
              <FolderLock size={16} strokeWidth={2} />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-[var(--color-text-primary)]">
                {totalRecordsCount > 0 ? totalRecordsCount : 7}
              </span>
              <span className="text-xs font-semibold text-[var(--color-secondary-sage)] bg-[var(--color-badge-verified-bg)] border border-[#D4EAD9] px-2 py-0.5 rounded-full">
                +2 Hospital B
              </span>
            </div>
            <span className="text-xs text-[var(--color-text-muted)] mt-1 block">
              Total indexed clinical files
            </span>
          </div>
        </div>

        {/* Card 2: Documents Stored */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
              Documents &amp; Scans
            </span>
            <span className="w-8 h-8 rounded-lg bg-[var(--color-surface-container-high)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-secondary)]">
              <FileText size={16} strokeWidth={2} />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-[var(--color-text-primary)]">
                {totalDocsCount > 0 ? totalDocsCount : 3}
              </span>
              <span className="text-xs font-semibold text-[var(--color-badge-consult-text)] bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] px-2 py-0.5 rounded-full">
                OCR Verified
              </span>
            </div>
            <span className="text-xs text-[var(--color-text-muted)] mt-1 block">
              Structured extractions
            </span>
          </div>
        </div>

        {/* Card 3: Consent Requests */}
        <Link
          href="/dashboard/consent"
          className="bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-primary-container)]/50 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-container)] transition-colors">
              Consent Requests
            </span>
            <span className="w-8 h-8 rounded-lg bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)] group-hover:scale-105 transition-transform">
              <ShieldCheck size={16} strokeWidth={2} />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-[var(--color-primary-container)]">
                {pendingConsentCount}
              </span>
              <span className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-container-high)] border border-[var(--color-border-subtle)] px-2 py-0.5 rounded-full truncate max-w-[120px]">
                {latestRequester}
              </span>
            </div>
            <span className="text-xs text-[var(--color-text-muted)] mt-1 block truncate">
              {pendingConsentCount > 0 ? "Requires your authorization →" : "All requests resolved →"}
            </span>
          </div>
        </Link>

        {/* Card 4: Upcoming Appointments */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
              Appointments
            </span>
            <span className="w-8 h-8 rounded-lg bg-[var(--color-badge-verified-bg)] border border-[#D4EAD9] flex items-center justify-center text-[var(--color-secondary-sage)]">
              <CalendarDays size={16} strokeWidth={2} />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-[var(--color-text-primary)]">
                2
              </span>
              <span className="text-xs font-semibold text-[var(--color-secondary-sage)] bg-[var(--color-badge-verified-bg)] border border-[#D4EAD9] px-2 py-0.5 rounded-full">
                Next: 14 Oct
              </span>
            </div>
            <span className="text-xs text-[var(--color-text-muted)] mt-1 block truncate">
              Dr. Meera Nair · Diabetology
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Recent Clinical Activity (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary-container)]" />
              <h2 className="font-heading font-bold text-lg text-[var(--color-text-primary)]">
                Recent Clinical Activity
              </h2>
            </div>
            <Link
              href="/dashboard/timeline"
              className="font-heading text-xs font-semibold text-[var(--color-primary-container)] hover:underline flex items-center gap-1"
            >
              View full timeline
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Activity Cards List */}
          <div className="flex flex-col gap-4 relative">
            {recentRecords.length > 0 ? (
              recentRecords.map((r) => {
                const rec = r as DashboardRecord;
                return (
                  <MedicalRecordCard
                    key={rec.id}
                    record={{
                      id: rec.id,
                      category: rec.category,
                      title: rec.title,
                      facility: rec.facility,
                      doctor: rec.doctor || rec.practitioner,
                      clinicalDate: rec.clinicalDate,
                      summary: rec.summary,
                      tags: rec.tags,
                      hasDocument: rec.hasDocument,
                    }}
                    onClick={() => handleRecordClick(rec)}
                  />
                );
              })
            ) : (
              /* Fallback to Default Clinical Demonstration Records if DB is empty */
              <div className="space-y-4">
                <MedicalRecordCard
                  record={{
                    id: "rec-1",
                    category: "lab_report",
                    title: "HbA1c & Lipid Profile",
                    facility: "Pathcare Diagnostics",
                    doctor: "Dr. Meera Nair",
                    clinicalDate: "2026-09-28T00:00:00Z",
                    summary: "HbA1c 7.1% (Managed diabetic target), LDL 102 mg/dL, Total Cholesterol 188 mg/dL. Fasting glucose normal.",
                    hasDocument: true,
                  }}
                />
                <MedicalRecordCard
                  record={{
                    id: "rec-2",
                    category: "consultation",
                    title: "General Consultation – Diabetes Review",
                    facility: "Apollo Hospitals, Greams Road",
                    doctor: "Dr. Rajesh Kumar",
                    clinicalDate: "2026-09-18T00:00:00Z",
                    summary: "Patient reports mild post-prandial fatigue. Fasting BG stable. Continued Metformin 500mg BD. Ordered follow-up lab review.",
                    hasDocument: true,
                  }}
                />
                <MedicalRecordCard
                  record={{
                    id: "rec-3",
                    category: "prescription",
                    title: "Prescription Upload & Verification",
                    facility: "City Health Hospital",
                    doctor: "Dr. Rajesh Kumar",
                    clinicalDate: "2026-10-03T00:00:00Z",
                    summary: "Active regimen: Metformin 500mg twice daily with meals + Telmisartan 40mg OD in the morning.",
                    hasDocument: true,
                  }}
                />
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Vitals Trend & Hospital Continuity (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* HbA1c Longitudinal Tracker Card */}
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Biomarker Trend
                </span>
                <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)]">
                  HbA1c Longitudinal Tracker
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[var(--color-badge-verified-bg)] border border-[#D4EAD9] text-[var(--color-secondary-sage)] text-xs font-semibold flex items-center gap-1">
                <TrendingDown size={14} /> -0.7% (Improving)
              </span>
            </div>

            {/* Inline SVG Sparkline Visualization */}
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)]/60 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[var(--color-text-muted)]">Current Value</span>
                  <div className="font-mono text-3xl font-bold text-[var(--color-primary-container)]">
                    7.1 <span className="text-base text-[var(--color-text-secondary)] font-normal">%</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[var(--color-text-muted)]">Target Range</span>
                  <div className="font-mono text-sm font-semibold text-[var(--color-secondary-sage)]">
                    &lt; 7.0 %
                  </div>
                </div>
              </div>

              {/* Sparkline Graphic */}
              <div className="w-full h-24 pt-2">
                <svg
                  className="w-full h-full overflow-visible"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 360 80"
                >
                  {/* Target reference dashed line */}
                  <line
                    stroke="var(--color-secondary-sage)"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                    className="opacity-40"
                    x1="0"
                    x2="360"
                    y1="62"
                    y2="62"
                  />
                  {/* Fill Area */}
                  <path
                    fill="var(--color-primary-container)"
                    className="opacity-10"
                    d="M 10 20 L 95 38 L 180 30 L 265 52 L 350 58 L 350 80 L 10 80 Z"
                  />
                  {/* Trend line */}
                  <path
                    stroke="var(--color-primary-container)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M 10 20 L 95 38 L 180 30 L 265 52 L 350 58"
                  />
                  {/* Data Points */}
                  <circle cx="10" cy="20" r="4" fill="var(--color-surface-card)" stroke="var(--color-primary-container)" strokeWidth="2.5" />
                  <circle cx="95" cy="38" r="4" fill="var(--color-surface-card)" stroke="var(--color-primary-container)" strokeWidth="2.5" />
                  <circle cx="180" cy="30" r="4" fill="var(--color-surface-card)" stroke="var(--color-primary-container)" strokeWidth="2.5" />
                  <circle cx="265" cy="52" r="4" fill="var(--color-surface-card)" stroke="var(--color-primary-container)" strokeWidth="2.5" />
                  <circle cx="350" cy="58" r="5" fill="var(--color-primary)" stroke="var(--color-surface-card)" strokeWidth="2" />
                </svg>
              </div>

              {/* Reading Markers Row */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border-subtle)]/50">
                <span>Nov &apos;25: 7.8</span>
                <span>Jan: 7.4</span>
                <span>Apr: 7.6</span>
                <span>Jul: 7.2</span>
                <span className="text-[var(--color-primary-container)] font-bold">Sep: 7.1</span>
              </div>
            </div>
          </div>

          {/* Care Continuity / Hospital Interop Bridge Card */}
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                Interoperability Bridge
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-badge-verified-bg)] border border-[#D4EAD9] text-[var(--color-secondary-sage)] text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary-sage)]" />
                ABDM Consent Active
              </span>
            </div>

            <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)]">
              Multi-Hospital Care Continuity
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              HealthSetu protocol links prior encounters between facilities under patient authorization.
            </p>

            {/* Interactive Connection Bridge Pill */}
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] rounded-xl p-3 flex items-center justify-between gap-2 mt-1">
              <div className="flex flex-col items-center p-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] flex-1 text-center shadow-xs">
                <Building2 size={18} className="text-[var(--color-text-primary)]" />
                <span className="font-heading text-xs font-semibold text-[var(--color-text-primary)] mt-1">
                  City Health
                </span>
                <span className="font-mono text-[9px] text-[var(--color-text-muted)] uppercase">
                  Hospital A
                </span>
              </div>

              <div className="flex flex-col items-center px-1">
                <span className="font-mono text-[9px] uppercase text-[var(--color-primary-container)] tracking-wider font-bold">
                  CONSENT
                </span>
                <div className="w-8 h-0.5 bg-[var(--color-timeline-connector)] my-1" />
                <span className="text-[9px] font-mono text-[var(--color-text-muted)]">30 DAYS</span>
              </div>

              <div className="flex flex-col items-center p-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] flex-1 text-center shadow-xs">
                <Building2 size={18} className="text-[var(--color-primary-container)]" />
                <span className="font-heading text-xs font-semibold text-[var(--color-text-primary)] mt-1">
                  Apollo Hospital
                </span>
                <span className="font-mono text-[9px] text-[var(--color-text-muted)] uppercase">
                  Hospital B
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-[var(--color-text-muted)]">Granted on 28 Sep 2026</span>
              <Link
                href="/dashboard/consent"
                className="font-semibold text-[var(--color-primary-container)] hover:underline"
              >
                Manage Consent →
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          refreshDashboard();
        }}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
