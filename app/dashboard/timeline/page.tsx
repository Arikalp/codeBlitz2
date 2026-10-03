/**
 * app/dashboard/timeline/page.tsx
 *
 * /dashboard/timeline — Patient Longitudinal Medical Timeline.
 * 
 * Fetches clinical records from /api/timeline (ordered by clinicalDate descending).
 * Features:
 * - Filter by category (Prescription, CT/MRI, X-ray, Lab, Discharge, Consultation, Other)
 * - Free-text search by title, facility, doctor, or condition tags
 * - Date ordering toggle (Newest first / Oldest first)
 * - In-app document viewer modal for records with attached files
 * - Upload modal trigger to add new clinical records directly from the timeline
 * - Demo data toggle fallback if patient has no live records yet
 */

"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Search,
  Upload,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import TimelineItem, { type TimelineRecordItem } from "@/components/timeline/TimelineItem";
import DocumentPreviewModal from "@/components/documents/DocumentPreviewModal";
import UploadDocumentModal from "@/components/documents/UploadDocumentModal";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { MOCK_RECORDS } from "@/lib/mock-data";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "prescription", label: "Prescriptions" },
  { id: "ct_mri_report", label: "CT & MRI" },
  { id: "xray_report", label: "X-ray Reports" },
  { id: "lab_report", label: "Lab Reports" },
  { id: "discharge_summary", label: "Discharge" },
  { id: "consultation_note", label: "Consultation" },
  { id: "other", label: "Other" },
];

interface PreviewDocData {
  id: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  facility: string;
  practitioner?: string | null;
  clinicalDate: string | Date;
}

export default function TimelinePage() {
  const [records, setRecords] = useState<TimelineRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [useSampleData, setUseSampleData] = useState(false);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocData | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Fetch real records from /api/timeline
  useEffect(() => {
    let ignore = false;
    async function loadTimeline() {
      try {
        setError(null);
        const res = await fetch("/api/timeline", {
          headers: { "Cache-Control": "no-cache" },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `Failed to fetch timeline (HTTP ${res.status})`);
        }

        const data = await res.json();
        if (!ignore) {
          setRecords(data.records || []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Timeline fetch error:", err);
          setError(err instanceof Error ? err.message : "Failed to load timeline records");
          setLoading(false);
        }
      }
    }
    loadTimeline();
    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  function refreshTimeline() {
    setLoading(true);
    setReloadTrigger((prev) => prev + 1);
  }

  // Handle viewing attached document
  const handleViewDocument = async (docId: string, title: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (!res.ok) {
        throw new Error("Unable to load document details");
      }
      const data = await res.json();
      setPreviewDoc(data.document);
    } catch (err) {
      console.error("Failed to load document preview:", err);
      // Fallback preview object with minimal metadata
      setPreviewDoc({
        id: docId,
        title: title || "Attached Medical Document",
        originalFileName: "document.pdf",
        mimeType: "application/pdf",
        facility: "Medical Facility",
        clinicalDate: new Date().toISOString(),
      });
    }
  };

  // Determine active dataset: live records or sample data
  const baseRecords: TimelineRecordItem[] =
    records.length > 0 || !useSampleData
      ? records
      : MOCK_RECORDS.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          clinicalDate: r.clinicalDate,
          facility: r.facility,
          doctor: r.doctor,
          summary: r.summary,
          tags: r.tags,
          hasDocument: r.hasDocument,
          documentId: null,
          source: "mock",
        }));

  // Filtering
  const filteredRecords = baseRecords.filter((rec) => {
    // Category filter
    if (selectedCategory !== "all") {
      if (selectedCategory === "consultation_note") {
        if (rec.category !== "consultation_note" && rec.category !== "consultation") {
          return false;
        }
      } else if (rec.category !== selectedCategory) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = rec.title.toLowerCase().includes(q);
      const matchFacility = rec.facility.toLowerCase().includes(q);
      const matchDoctor = (rec.doctor || "").toLowerCase().includes(q);
      const matchSummary = rec.summary.toLowerCase().includes(q);
      const matchTags = (rec.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchFacility && !matchDoctor && !matchSummary && !matchTags) {
        return false;
      }
    }

    return true;
  });

  // Sorting by clinicalDate
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const timeA = new Date(a.clinicalDate).getTime() || 0;
    const timeB = new Date(b.clinicalDate).getTime() || 0;
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  return (
    <AppShell title="Medical Timeline">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              Longitudinal Health Timeline
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Chronological medical history sorted by clinical examination date ·{" "}
              {sortedRecords.length} {sortedRecords.length === 1 ? "entry" : "entries"}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 shadow-xs"
            >
              <Upload size={14} />
              <span>Add Record</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={refreshTimeline}
              disabled={loading}
              title="Refresh timeline"
              className="p-2"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records by title, doctor, clinic, or tag..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-100)]"
            />
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors whitespace-nowrap"
          >
            <ArrowUpDown size={13} />
            <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
          </button>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all duration-150",
                  isSelected
                    ? "bg-[var(--color-brand-600)] text-white border-[var(--color-brand-600)] shadow-xs"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-600)]",
                ].join(" ")}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={refreshTimeline}>
              Retry
            </Button>
          </div>
        )}

        {/* Sample data banner if patient has no live records */}
        {!loading && records.length === 0 && (
          <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 text-xs text-teal-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-teal-600 flex-shrink-0" />
              <span>
                {useSampleData
                  ? "Currently showing synthetic sample records to demonstrate the longitudinal timeline."
                  : "You haven't uploaded any medical records to your database yet."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUseSampleData(!useSampleData)}
              className="text-xs font-semibold text-teal-700 underline hover:text-teal-900"
            >
              {useSampleData ? "Hide Sample Records" : "Preview Sample Records"}
            </button>
          </div>
        )}

        {/* Loading state skeleton */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-2.5 rounded-2xl border border-[var(--color-border)] p-4 bg-[var(--color-surface)]">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content list */}
        {!loading && sortedRecords.length === 0 ? (
          <EmptyState
            icon={Clock}
            title={searchQuery || selectedCategory !== "all" ? "No matching records" : "No health records yet"}
            description={
              searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search terms or category filter."
                : "Upload your prescriptions, diagnostic reports, or discharge summaries to see them in your chronological timeline."
            }
            action={
              <Button
                variant="primary"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                <span>Upload First Record</span>
              </Button>
            }
          />
        ) : (
          !loading && (
            <div className="relative">
              {sortedRecords.map((record, idx) => (
                <TimelineItem
                  key={record.id}
                  record={record}
                  isLast={idx === sortedRecords.length - 1}
                  onViewDocument={handleViewDocument}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          refreshTimeline();
        }}
      />

      {/* In-app Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </AppShell>
  );
}
