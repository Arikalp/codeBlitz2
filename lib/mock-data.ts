/**
 * lib/mock-data.ts
 *
 * Synthetic mock data for HealthSetu UI development.
 * ⚠️  ALL DATA IS FICTIONAL — no real patients, doctors, or hospitals.
 *
 * Replace with real API calls when authentication and backend are ready.
 */

// ─── Types ────────────────────────────────────────────────────────────────

export type RecordCategory =
  | "prescription"
  | "lab_report"
  | "imaging"
  | "discharge_summary"
  | "vaccination"
  | "consultation";

export type ConsentStatus = "approved" | "pending" | "denied" | "revoked";
export type DocumentStatus = "verified" | "pending_review" | "extracted";

// ─── Patient ──────────────────────────────────────────────────────────────

export const MOCK_PATIENT = {
  id: "pat_demo_001",
  name: "Arjun Sharma",
  age: 34,
  gender: "Male",
  bloodGroup: "O+",
  dateOfBirth: "1990-06-15",
  phone: "+91 98765 43210",
  email: "arjun.sharma@example.com",
  address: "12, MG Road, Bengaluru, Karnataka 560001",
  /** ABHA-style ID — clearly synthetic */
  abhaId: "DEMO-1234-5678-9012",
  emergencyContact: { name: "Priya Sharma", relation: "Spouse", phone: "+91 98765 00001" },
  conditions: ["Type 2 Diabetes (managed)", "Hypertension"],
  allergies: ["Penicillin"],
  lastVisit: "2026-09-18",
} as const;

// ─── Medical Records / Timeline ───────────────────────────────────────────

export interface MedicalRecord {
  id: string;
  category: RecordCategory;
  title: string;
  facility: string;
  doctor: string;
  clinicalDate: string; // ISO date
  summary: string;
  tags: string[];
  hasDocument: boolean;
}

export const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: "rec_001",
    category: "consultation",
    title: "General Consultation – Diabetes Review",
    facility: "City Health Hospital, Bengaluru",
    doctor: "Dr. Meera Nair",
    clinicalDate: "2026-09-18",
    summary:
      "Routine diabetes management review. HbA1c at 7.1%. Medication dosage adjusted. Follow-up in 3 months.",
    tags: ["diabetes", "HbA1c", "follow-up"],
    hasDocument: true,
  },
  {
    id: "rec_002",
    category: "lab_report",
    title: "Blood Panel – HbA1c & Lipid Profile",
    facility: "Pathcare Diagnostics, Bengaluru",
    doctor: "Dr. Meera Nair",
    clinicalDate: "2026-09-15",
    summary:
      "HbA1c: 7.1% | Total Cholesterol: 178 mg/dL | LDL: 102 mg/dL | HDL: 48 mg/dL | Triglycerides: 140 mg/dL.",
    tags: ["blood test", "lipids", "HbA1c"],
    hasDocument: true,
  },
  {
    id: "rec_003",
    category: "prescription",
    title: "Prescription – Metformin 500mg",
    facility: "City Health Hospital, Bengaluru",
    doctor: "Dr. Meera Nair",
    clinicalDate: "2026-09-18",
    summary: "Metformin 500mg twice daily with meals. Amlodipine 5mg once daily (BP control).",
    tags: ["metformin", "amlodipine", "diabetes", "hypertension"],
    hasDocument: true,
  },
  {
    id: "rec_004",
    category: "imaging",
    title: "Chest X-Ray – Routine",
    facility: "Apollo Radiology, Bengaluru",
    doctor: "Dr. Suresh Pillai",
    clinicalDate: "2026-07-10",
    summary: "No active cardiopulmonary disease. Heart size within normal limits. Lung fields clear.",
    tags: ["chest x-ray", "radiology"],
    hasDocument: true,
  },
  {
    id: "rec_005",
    category: "discharge_summary",
    title: "Discharge Summary – Viral Fever",
    facility: "Manipal Hospital, Bengaluru",
    doctor: "Dr. Ravi Kumar",
    clinicalDate: "2026-04-03",
    summary:
      "Admitted for 2 days with high-grade fever (104°F). Dengue NS1 negative. Treated with IV fluids and antipyretics. Discharged stable.",
    tags: ["fever", "dengue ruled out", "IV fluids"],
    hasDocument: true,
  },
  {
    id: "rec_006",
    category: "vaccination",
    title: "COVID-19 Booster – Dose 3",
    facility: "BBMP Vaccination Centre",
    doctor: "Nurse Anitha R.",
    clinicalDate: "2025-11-20",
    summary: "Covaxin booster dose administered. No immediate adverse effects noted.",
    tags: ["covid-19", "vaccination", "booster"],
    hasDocument: false,
  },
  {
    id: "rec_007",
    category: "lab_report",
    title: "Thyroid Function Test",
    facility: "Pathcare Diagnostics, Bengaluru",
    doctor: "Dr. Meera Nair",
    clinicalDate: "2025-06-12",
    summary: "TSH: 2.8 mIU/L (Normal). T3 and T4 within reference range. No thyroid disorder detected.",
    tags: ["thyroid", "TSH", "T3", "T4"],
    hasDocument: true,
  },
];

// ─── Documents ────────────────────────────────────────────────────────────

export interface UploadedDocument {
  id: string;
  name: string;
  type: "pdf" | "image";
  size: string;
  uploadedAt: string;
  category: RecordCategory;
  facility: string;
  status: DocumentStatus;
  linkedRecordId?: string;
}

export const MOCK_DOCUMENTS: UploadedDocument[] = [
  {
    id: "doc_001",
    name: "Blood_Panel_Sep2026.pdf",
    type: "pdf",
    size: "1.2 MB",
    uploadedAt: "2026-09-16",
    category: "lab_report",
    facility: "Pathcare Diagnostics",
    status: "verified",
    linkedRecordId: "rec_002",
  },
  {
    id: "doc_002",
    name: "Prescription_Sep2026.pdf",
    type: "pdf",
    size: "320 KB",
    uploadedAt: "2026-09-18",
    category: "prescription",
    facility: "City Health Hospital",
    status: "verified",
    linkedRecordId: "rec_003",
  },
  {
    id: "doc_003",
    name: "ChestXRay_Jul2026.jpg",
    type: "image",
    size: "4.8 MB",
    uploadedAt: "2026-07-11",
    category: "imaging",
    facility: "Apollo Radiology",
    status: "verified",
    linkedRecordId: "rec_004",
  },
  {
    id: "doc_004",
    name: "DischargeSummary_Apr2026.pdf",
    type: "pdf",
    size: "850 KB",
    uploadedAt: "2026-04-04",
    category: "discharge_summary",
    facility: "Manipal Hospital",
    status: "verified",
    linkedRecordId: "rec_005",
  },
  {
    id: "doc_005",
    name: "Thyroid_Report_Jun2025.pdf",
    type: "pdf",
    size: "560 KB",
    uploadedAt: "2025-06-13",
    category: "lab_report",
    facility: "Pathcare Diagnostics",
    status: "extracted",
    linkedRecordId: "rec_007",
  },
  {
    id: "doc_006",
    name: "OldPrescription_Scan.jpg",
    type: "image",
    size: "2.1 MB",
    uploadedAt: "2026-09-28",
    category: "prescription",
    facility: "Unknown Clinic",
    status: "pending_review",
  },
];

// ─── Consent Requests ─────────────────────────────────────────────────────

export interface ConsentRequest {
  id: string;
  requestedBy: string;
  facility: string;
  purpose: string;
  requestedRecords: string[];
  requestedAt: string;
  expiresAt: string;
  status: ConsentStatus;
}

export const MOCK_CONSENTS: ConsentRequest[] = [
  {
    id: "con_001",
    requestedBy: "Dr. Priya Thomas",
    facility: "Aster Clinic, Bengaluru",
    purpose: "Diabetes follow-up — review prior lab reports and prescriptions",
    requestedRecords: ["Blood Panel", "Prescriptions (last 6 months)"],
    requestedAt: "2026-09-29",
    expiresAt: "2026-10-29",
    status: "pending",
  },
  {
    id: "con_002",
    requestedBy: "Dr. Ravi Kumar",
    facility: "Manipal Hospital",
    purpose: "Annual wellness check — prior records for context",
    requestedRecords: ["All records (12 months)"],
    requestedAt: "2026-08-10",
    expiresAt: "2026-09-10",
    status: "approved",
  },
];

// ─── Upcoming Appointments ────────────────────────────────────────────────

export const MOCK_APPOINTMENTS = [
  {
    id: "apt_001",
    doctor: "Dr. Meera Nair",
    specialty: "Diabetologist",
    facility: "City Health Hospital",
    date: "2026-10-15",
    time: "10:30 AM",
    type: "Follow-up",
  },
  {
    id: "apt_002",
    doctor: "Dr. Suresh Pillai",
    specialty: "General Physician",
    facility: "Apollo Clinic",
    date: "2026-11-02",
    time: "02:00 PM",
    type: "Routine Checkup",
  },
];

// ─── Dashboard Quick Stats ────────────────────────────────────────────────

export const MOCK_STATS = {
  totalRecords: MOCK_RECORDS.length,
  totalDocuments: MOCK_DOCUMENTS.length,
  pendingConsents: MOCK_CONSENTS.filter((c) => c.status === "pending").length,
  upcomingAppointments: MOCK_APPOINTMENTS.length,
};
