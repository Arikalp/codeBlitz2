/**
 * app/dashboard/documents/page.tsx
 *
 * /dashboard/documents — Medical Document Library.
 * Connects to live /api/documents endpoint.
 * Allows patients to upload, view, download, filter, and delete their medical records.
 */

"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import DocumentCard, { type DocumentItem } from "@/components/documents/DocumentCard";
import UploadDocumentModal from "@/components/documents/UploadDocumentModal";
import DocumentPreviewModal from "@/components/documents/DocumentPreviewModal";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

const CATEGORY_TABS = [
  { id: "all", label: "All Records" },
  { id: "prescription", label: "Prescriptions" },
  { id: "ct_mri_report", label: "CT & MRI" },
  { id: "xray_report", label: "X-ray Reports" },
  { id: "lab_report", label: "Lab Reports" },
  { id: "discharge_summary", label: "Discharge" },
  { id: "consultation_note", label: "Consultation" },
  { id: "other", label: "Other" },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadDocuments() {
      try {
        const res = await fetch("/api/documents", {
          headers: { "Cache-Control": "no-cache" },
        });
        const json = await res.json();
        if (!ignore) {
          if (res.ok && json.success) {
            setDocuments(json.data.documents || []);
          } else {
            setError(json.error || "Failed to load documents");
          }
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setError("Unable to connect to the documents service.");
          setLoading(false);
        }
      }
    }
    loadDocuments();
    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  function refreshDocuments() {
    setLoading(true);
    setReloadTrigger((prev) => prev + 1);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setDeleteConfirmId(null);
        setActionSuccess("Document removed from your health records");
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        alert(json.error || "Failed to delete document");
      }
    } catch {
      alert("Error occurred while deleting document");
    } finally {
      setDeleting(false);
    }
  }

  // Filtered list
  const filtered = documents.filter((doc) => {
    const matchesCat =
      selectedCategory === "all" || doc.recordCategory === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.practitioner &&
        doc.practitioner.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <AppShell title="My Medical Documents">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Toast Alert */}
        {actionSuccess && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs"
          >
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              Medical Document Library
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Securely stored, encrypted records accessible to you and authorized clinicians
            </p>
          </div>

          <Button
            id="open-upload-modal-btn"
            variant="primary"
            size="md"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 shadow-sm flex-shrink-0"
          >
            <Plus size={16} />
            <span>Upload Document</span>
          </Button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, hospital, or doctor..."
                className="block w-full rounded-xl border border-[var(--color-border)] py-2.5 pl-10 pr-4 text-xs bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
            {CATEGORY_TABS.map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={[
                    "whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                    active
                      ? "bg-[var(--color-brand-600)] text-white shadow-xs"
                      : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Security & Private Storage Banner */}
        <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-teal-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck size={16} className="text-teal-600 flex-shrink-0" />
            <span className="truncate">
              <strong>Private Object Storage Active</strong> — Files are encrypted and never publicly exposed.
            </span>
          </div>
          <span className="text-[11px] font-medium text-teal-700 whitespace-nowrap hidden sm:inline-block">
            {documents.length} Total Records
          </span>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="p-12 text-center">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-600)] border-t-transparent mb-3" />
            <p className="text-xs text-[var(--color-text-muted)]">Loading your medical documents...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs">
            <AlertCircle size={24} className="mx-auto mb-2 text-red-500" />
            <p className="font-semibold mb-1">{error}</p>
            <Button variant="outline" size="sm" onClick={refreshDocuments} className="mt-2">
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title={
              documents.length === 0
                ? "No medical documents yet"
                : "No matching documents found"
            }
            description={
              documents.length === 0
                ? "Upload prescriptions, diagnostic lab reports, or imaging scans to keep your health records organized."
                : "Try adjusting your search query or category filter."
            }
            action={
              documents.length === 0 ? (
                <Button
                  variant="primary"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Upload First Document</span>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onPreview={(d) => setPreviewDoc(d)}
                onDelete={(id) => setDeleteConfirmId(id)}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          >
            <div className="w-full max-w-sm rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-2xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-3">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                Delete Medical Document?
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 mb-5 leading-relaxed">
                This will permanently delete the file from private storage and remove it from your longitudinal timeline.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={deleting}
                  onClick={() => setDeleteConfirmId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={deleting}
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            refreshDocuments();
            setActionSuccess("Document uploaded and added to your health record!");
            setTimeout(() => setActionSuccess(null), 3500);
          }}
        />

        {/* In-app Preview Modal */}
        <DocumentPreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      </div>
    </AppShell>
  );
}
