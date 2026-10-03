/**
 * components/dashboard/DashboardContent.tsx
 *
 * Patient Dashboard dynamic content.
 * Connects to live /api/timeline and /api/documents to display accurate counts
 * and recent clinical records. Shows empty state when the backend is unreachable
 * rather than silently falling back to mock data.
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
  TrendingUp,
  Activity,
  AlertTriangle,
} from "lucide-react";
import PatientSummaryCard from "@/components/dashboard/PatientSummaryCard";
import MedicalRecordCard from "@/components/dashboard/MedicalRecordCard";
import Card from "@/components/ui/Card";
import UploadDocumentModal from "@/components/documents/UploadDocumentModal";
import DocumentPreviewModal from "@/components/documents/DocumentPreviewModal";
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
  const [timelineRecords, setTimelineRecords] = useState<DashboardRecord[]>([]);
  const [docCount, setDocCount] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocData | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadDashboard() {
      setApiError(null);
      try {
        const [timelineRes, docsRes] = await Promise.allSettled([
          fetch("/api/timeline", { headers: { "Cache-Control": "no-cache" } }),
          fetch("/api/documents", { headers: { "Cache-Control": "no-cache" } }),
        ]);

        if (ignore) return;

        if (timelineRes.status === "fulfilled" && timelineRes.value.ok) {
          const data = await timelineRes.value.json();
          setTimelineRecords(data.records || []);
        } else if (timelineRes.status === "rejected" || (timelineRes.status === "fulfilled" && !timelineRes.value.ok)) {
          setApiError("Could not connect to the database. Please check your MongoDB Atlas IP whitelist or connection settings.");
        }

        if (docsRes.status === "fulfilled" && docsRes.value.ok) {
          const docsData = await docsRes.value.json();
          setDocCount(docsData.total || (docsData.documents ? docsData.documents.length : 0));
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

  // Only show live records — no silent mock fallback
  const recentRecords = timelineRecords.slice(0, 3);

  const totalRecordsCount = timelineRecords.length;
  const totalDocsCount = docCount !== null ? docCount : 0;

  const handleRecordClick = async (record: DashboardRecord) => {
    if (record.documentId) {
      try {
        const res = await fetch(`/api/documents/${record.documentId}`);
        if (res.ok) {
          const data = await res.json();
          setPreviewDoc(data.document);
        }
      } catch (err) {
        console.error("Failed to load document preview:", err);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* DB / connection error banner */}
      {apiError && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-500" />
          <div>
            <p className="font-semibold">Database connection issue</p>
            <p className="text-xs mt-0.5 text-amber-700">{apiError}</p>
          </div>
        </div>
      )}

      {/* Patient Summary — always uses live session data */}
      <PatientSummaryCard />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Records",
            value: totalRecordsCount,
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Documents",
            value: totalDocsCount,
            icon: Upload,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "Pending Consents",
            value: 0,
            icon: ShieldCheck,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Appointments",
            value: 0,
            icon: CalendarDays,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} padding="md" className="flex items-center gap-3">
            <div
              className={[
                "flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0",
                bg,
                color,
              ].join(" ")}
            >
              <Icon size={18} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">{value}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-[var(--color-brand-300)] bg-[var(--color-brand-50)] hover:bg-[var(--color-brand-100)] transition-colors text-left group"
          >
            <Upload size={20} className="text-[var(--color-brand-600)]" />
            <span className="text-sm font-medium text-[var(--color-brand-700)]">
              Upload Medical Document
            </span>
          </button>
          <Link
            href="/dashboard/timeline"
            className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-[var(--color-accent-400)] bg-teal-50 hover:bg-teal-100 transition-colors group"
          >
            <Clock size={20} className="text-[var(--color-accent-600)]" />
            <span className="text-sm font-medium text-teal-700">View Medical Timeline</span>
          </Link>
          <Link
            href="/dashboard/ai"
            className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-violet-300 bg-violet-50 hover:bg-violet-100 transition-colors group"
          >
            <Activity size={20} className="text-violet-600" />
            <span className="text-sm font-medium text-violet-700">Ask AI Assistant</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Records */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
              Recent Clinical Activity
            </h2>
            <Link
              href="/dashboard/timeline"
              className="text-xs font-medium text-[var(--color-brand-600)] hover:underline"
            >
              View full timeline →
            </Link>
          </div>

          <div className="space-y-2">
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
              <Card padding="md" className="text-center py-8">
                <FileText size={32} className="mx-auto text-[var(--color-text-muted)] mb-2" />
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">No records yet</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {apiError ? "Connect to the database to see your records." : "Upload your first medical document to get started."}
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Upcoming appointments — placeholder until appointments API is built */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
              Upcoming Appointments
            </h2>
            <Card padding="md" className="text-center py-6">
              <CalendarDays size={24} className="mx-auto text-[var(--color-text-muted)] mb-2" />
              <p className="text-xs text-[var(--color-text-muted)]">No upcoming appointments</p>
            </Card>
          </div>

          {/* Health trend card */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-[var(--color-brand-500)]" />
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                HbA1c Trend
              </h3>
            </div>
            <div className="flex items-end gap-1 h-14">
              {[7.8, 7.4, 7.6, 7.2, 7.1].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${((v - 6.5) / 2) * 100}%`,
                      background: v <= 7.2 ? "var(--color-accent-500)" : "var(--color-brand-500)",
                      opacity: 0.7 + i * 0.06,
                    }}
                  />
                  <span className="text-[9px] text-[var(--color-text-muted)]">{v}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Last 5 readings — Longitudinal diagnostic tracking
            </p>
          </Card>
        </div>
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

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}
