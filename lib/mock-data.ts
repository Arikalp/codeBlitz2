export const MOCK_USER = {
  id: "patient_01",
  name: "Arjun Sharma",
  abhaId: "DEMO-1234-5678-9012",
  bloodGroup: "O+",
  dob: "1985-04-12",
  gender: "Male"
};

export const MOCK_ALLERGIES = [
  { id: "al_1", type: "Medication", allergen: "Penicillin", severity: "High", discovered: "2010-05-14" },
  { id: "al_2", type: "Food", allergen: "Peanuts", severity: "Moderate", discovered: "2015-08-22" }
];

export const MOCK_MEDICATIONS = [
  { id: "med_1", name: "Metformin 500mg", instructions: "Twice daily with meals", status: "Active" },
  { id: "med_2", name: "Atorvastatin 20mg", instructions: "Once daily at bedtime", status: "Active" }
];

export const MOCK_CONDITIONS = [
  { id: "cond_1", name: "Type 2 Diabetes Mellitus", diagnosedOn: "2022-11-10", status: "Active" },
  { id: "cond_2", name: "Hyperlipidemia", diagnosedOn: "2023-02-15", status: "Active" }
];

export const MOCK_TIMELINE = [
  {
    id: "rec_001",
    date: "2026-09-28",
    type: "LAB_REPORT",
    title: "HbA1c & Lipid Profile",
    facility: "Pathcare Diagnostics",
    clinician: "Dr. Meera Nair",
    fields: [
      { key: "HbA1c", value: "7.1 %" },
      { key: "LDL", value: "102 mg/dL" }
    ],
    verified: true
  },
  {
    id: "rec_002",
    date: "2026-09-18",
    type: "CONSULTATION",
    title: "Diabetic Follow-up",
    facility: "Apollo Hospitals, Greams Road",
    clinician: "Dr. Rajesh Kumar",
    fields: [
      { key: "Complaint", value: "Mild fatigue" },
      { key: "Plan", value: "Continue Metformin, order fresh lipids." }
    ],
    verified: true
  }
];

export const MOCK_DOCUMENTS = [
  {
    id: "doc_01",
    title: "Prescription_Scan.jpg",
    type: "PRESCRIPTION",
    status: "PROCESSING",
    date: "2026-10-01"
  },
  {
    id: "doc_02",
    title: "Blood_Panel_Sept.pdf",
    type: "LAB_REPORT",
    status: "VERIFIED",
    date: "2026-09-28"
  }
];

export const MOCK_CONSENTS = [
  {
    id: "con_01",
    facility: "Aster Clinic",
    clinician: "Dr. Priya Thomas",
    purpose: "Diabetes follow-up",
    requestedAt: "2026-10-02T08:30:00Z",
    status: "PENDING",
    scope: ["Blood reports", "Prescriptions", "Recent consultations"],
    duration: "24 hours"
  },
  {
    id: "con_02",
    facility: "Narayana Health",
    clinician: "Emergency Dept",
    purpose: "Emergency admission",
    requestedAt: "2026-05-12T14:20:00Z",
    status: "EXPIRED",
    scope: ["Full medical history"],
    duration: "48 hours"
  }
];

// Extended mock data for new dashboard features
export const MOCK_APPOINTMENTS = [
  {
    id: "apt_01",
    date: "2026-10-05",
    time: "10:00 AM",
    doctor: "Dr. Rajesh Kumar",
    facility: "Apollo Hospitals, Greams Road",
    type: "Follow-up",
    status: "upcoming"
  },
  {
    id: "apt_02",
    date: "2026-10-12",
    time: "02:30 PM",
    doctor: "Dr. Meera Nair",
    facility: "Pathcare Diagnostics",
    type: "Lab Work",
    status: "upcoming"
  },
  {
    id: "apt_03",
    date: "2026-11-02",
    time: "11:00 AM",
    doctor: "Dr. Priya Thomas",
    facility: "Aster Clinic",
    type: "Routine Check-up",
    status: "upcoming"
  }
];

export const MOCK_MEDICATION_SCHEDULE = [
  {
    id: "sched_01",
    time: "08:00 AM",
    medication: "Metformin",
    dosage: "500mg",
    taken: true,
    status: "taken"
  },
  {
    id: "sched_02",
    time: "12:00 PM",
    medication: "Metformin",
    dosage: "500mg",
    taken: false,
    status: "due"
  },
  {
    id: "sched_03",
    time: "08:00 PM",
    medication: "Atorvastatin",
    dosage: "20mg",
    taken: false,
    status: "upcoming"
  }
];

export const MOCK_REMINDERS = [
  {
    id: "rem_01",
    type: "MEDICATION_REFILL",
    title: "Metformin prescription renewal",
    dueDate: "2026-10-08",
    priority: "medium"
  },
  {
    id: "rem_02",
    type: "LAB_TEST",
    title: "HbA1c test due",
    dueDate: "2026-10-15",
    priority: "high"
  }
];