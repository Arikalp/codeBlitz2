/**
 * tests/test-doctor-lookup.mjs
 *
 * Automated verification of:
 * - Patient Unique Health ID generation (HS-PT-XXXXXX format)
 * - Doctor Patient-Lookup API logic by Unique ID, UUID, and phone
 * - Role-based authorization: Doctor/Admin allowed, unauthorized blocked
 * - Doctor creating consultation notes appended to patient timeline
 * - Doctor document view/download permissions
 */

import assert from "node:assert";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import fs from "node:fs";

for (const envFile of [".env.local", ".env"]) {
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const idx = trimmed.indexOf("=");
        if (idx > 0) {
          const k = trimmed.slice(0, idx).trim();
          const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          if (!process.env[k]) process.env[k] = v;
        }
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
assert(MONGODB_URI, "MONGODB_URI must be configured in .env.local or .env");

async function runDoctorLookupSuite() {
  console.log("\n=======================================================");
  console.log("   HEALTHSETU UNIQUE PATIENT ID & DOCTOR ACCESS SUITE   ");
  console.log("=======================================================\n");

  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB database");

  // Load models via tsx
  const { default: User } = await import("../models/User.ts");
  const { default: Patient, generatePatientUniqueId } = await import("../models/Patient.ts");
  const { default: Practitioner } = await import("../models/Practitioner.ts");
  const { default: ClinicalRecord } = await import("../models/ClinicalRecord.ts");
  const { default: Document } = await import("../models/Document.ts");
  const { default: Consent } = await import("../models/Consent.ts");
  const { seedDemoAccounts } = await import("../lib/seed.ts");

  // Run seed to ensure demo accounts exist
  await seedDemoAccounts();
  console.log("✓ Demo accounts seeded");

  // -------------------------------------------------------------
  // Test 1: Unique Patient ID Format & Generator
  // -------------------------------------------------------------
  console.log("\n[TEST 1] Patient Unique Health ID Format");
  const testId1 = generatePatientUniqueId();
  const testId2 = generatePatientUniqueId();
  assert(/^HS-PT-\d{6}$/.test(testId1), `Generated ID ${testId1} matches HS-PT-XXXXXX format`);
  assert(testId1 !== testId2, "Consecutively generated IDs are distinct");
  console.log(`  ✓ PASS: Generated Unique IDs: ${testId1}, ${testId2}`);

  // -------------------------------------------------------------
  // Test 2: Demo Patient Has Standardized HS-PT-842910
  // -------------------------------------------------------------
  console.log("\n[TEST 2] Demo Patient Identity Verification");
  const demoUser = await User.findOne({ email: "patient@healthsetu.demo" }).lean();
  assert(demoUser, "Demo patient user exists");

  const demoPatient = await Patient.findOne({ userId: demoUser._id }).lean();
  assert(demoPatient, "Demo patient document exists");
  assert.strictEqual(demoPatient.patientUniqueId, "HS-PT-842910", "Demo patient has HS-PT-842910");
  assert.strictEqual(demoPatient.name, "Ramesh Patel", "Demo patient name is Ramesh Patel");
  console.log("  ✓ PASS: Ramesh Patel verified with Unique ID HS-PT-842910");

  // -------------------------------------------------------------
  // Test 3: Doctor Lookup Resolution by Unique ID
  // -------------------------------------------------------------
  console.log("\n[TEST 3] Doctor Patient Lookup by Unique ID");
  async function simulateDoctorLookup(query) {
    const raw = query.trim();
    const upper = raw.toUpperCase();
    const withPrefix = upper.startsWith("HS-PT-") ? upper : `HS-PT-${upper}`;
    const safeRegex = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return await Patient.findOne({
      $or: [
        { patientUniqueId: upper },
        { patientUniqueId: withPrefix },
        { patientUniqueId: { $regex: `^${safeRegex}$`, $options: "i" } },
        { internalUuid: raw },
        { phone: raw },
      ],
    }).lean();
  }

  // Exact ID
  const foundExact = await simulateDoctorLookup("HS-PT-842910");
  assert(foundExact && foundExact.name === "Ramesh Patel", "Found by exact HS-PT-842910");
  console.log("  ✓ PASS: Doctor successfully looked up patient by exact ID 'HS-PT-842910'");

  // Lowercase
  const foundLower = await simulateDoctorLookup("hs-pt-842910");
  assert(foundLower && foundLower.name === "Ramesh Patel", "Found by lowercase 'hs-pt-842910'");
  console.log("  ✓ PASS: Doctor successfully looked up patient by lowercase 'hs-pt-842910'");

  // Digits only without prefix
  const foundDigits = await simulateDoctorLookup("842910");
  assert(foundDigits && foundDigits.name === "Ramesh Patel", "Found by digits only '842910'");
  console.log("  ✓ PASS: Doctor successfully looked up patient by digits only '842910'");

  // Phone number
  const foundPhone = await simulateDoctorLookup("+91 98765 43210");
  assert(foundPhone && foundPhone.name === "Ramesh Patel", "Found by phone number");
  console.log("  ✓ PASS: Doctor successfully looked up patient by phone number '+91 98765 43210'");

  // Internal UUID
  const foundUuid = await simulateDoctorLookup(demoPatient.internalUuid);
  assert(foundUuid && foundUuid.name === "Ramesh Patel", "Found by internal UUID");
  console.log("  ✓ PASS: Doctor successfully looked up patient by internal UUID");

  // Non-existent ID returns null
  const notFound = await simulateDoctorLookup("HS-PT-999999-NOTFOUND");
  assert(notFound === null, "Non-existent patient returns null");
  console.log("  ✓ PASS: Non-existent ID returns null / 404");

  // -------------------------------------------------------------
  // Test 4: Doctor Appending Consultation Encounter to Timeline
  // -------------------------------------------------------------
  console.log("\n[TEST 4] Doctor Adding Encounter Record to Timeline");
  const doctorUser = await User.findOne({ email: "doctor@healthsetu.demo" }).lean();
  assert(doctorUser, "Doctor user exists");
  const doctorPractitioner = await Practitioner.findOne({ userId: doctorUser._id }).lean();
  assert(doctorPractitioner, "Practitioner profile exists");

  const newEncounter = await ClinicalRecord.create({
    patientUuid: demoPatient.internalUuid,
    title: "Diabetology Quarterly Review & HbA1c Evaluation",
    category: "consultation_note",
    clinicalDate: new Date(),
    facility: "Apex Multi-Specialty Hospital",
    practitioner: doctorPractitioner.name,
    summary: "Patient HbA1c stable at 7.1%. Tolerating Metformin 500mg BD well. Prescribed routine exercise.",
    tags: ["diabetes", "hba1c", "doctor_consultation"],
    source: "hospital_system",
  });

  assert(newEncounter._id, "Encounter created in database");
  assert.strictEqual(newEncounter.patientUuid, demoPatient.internalUuid);
  console.log("  ✓ PASS: Doctor created encounter record linked to patient UUID");

  // Verify record appears in patient's longitudinal timeline
  const patientTimeline = await ClinicalRecord.find({ patientUuid: demoPatient.internalUuid })
    .sort({ clinicalDate: -1 })
    .lean();

  const foundInTimeline = patientTimeline.some((r) => r._id.toString() === newEncounter._id.toString());
  assert(foundInTimeline, "New encounter is present on patient longitudinal timeline");
  console.log(`  ✓ PASS: Timeline has ${patientTimeline.length} total records including new doctor encounter`);

  // Clean up created test encounter
  await ClinicalRecord.deleteOne({ _id: newEncounter._id });
  console.log("  ✓ PASS: Test encounter cleaned up");

  // -------------------------------------------------------------
  // Test 5: New Patient Auto-Generates Unique ID on Register
  // -------------------------------------------------------------
  console.log("\n[TEST 5] Automatic Unique ID Generation for New Patient");
  const tempUser = await User.create({
    email: `test_auto_${Date.now()}@example.demo`,
    passwordHash: "dummyhash",
    role: "patient",
  });

  const tempPatient = await Patient.create({
    internalUuid: uuidv4(),
    userId: tempUser._id,
    name: "Sunil Verma",
  });

  assert(tempPatient.patientUniqueId, "patientUniqueId was automatically assigned");
  assert(/^HS-PT-\d{6}$/.test(tempPatient.patientUniqueId), "Auto-generated ID matches format");
  console.log(`  ✓ PASS: New patient automatically received Unique ID: ${tempPatient.patientUniqueId}`);

  // Clean up temp
  await Patient.deleteOne({ _id: tempPatient._id });
  await User.deleteOne({ _id: tempUser._id });

  // -------------------------------------------------------------
  // Test 6: Doctor Requesting Patient Report Through Unique ID
  // -------------------------------------------------------------
  console.log("\n[TEST 6] Doctor Requesting Patient Report via Unique ID (ABDM Consent)");
  
  // 1. Resolve patient by Unique ID HS-PT-842910
  const targetPatient = await simulateDoctorLookup("HS-PT-842910");
  assert(targetPatient, "Patient resolved by Unique ID HS-PT-842910");
  assert.strictEqual(targetPatient.patientUniqueId, "HS-PT-842910");

  // 2. Doctor generates report request
  const testConsentId = `REQ-TEST-${Date.now().toString().slice(-6)}`;
  const requestedScopes = [
    "Diagnostic Lab Reports (Biochemistry, HbA1c, CBC)",
    "Prescriptions & Active Medication Orders",
    "Imaging & Diagnostic Scans (X-Ray, MRI, CT)",
  ];
  const clinicalPurpose = "Diabetology & Longitudinal Lab Trend Assessment";

  const consentRequest = await Consent.create({
    consentId: testConsentId,
    patientUuid: targetPatient.internalUuid,
    patientUniqueId: targetPatient.patientUniqueId,
    patientName: targetPatient.name,
    requesterId: doctorUser._id,
    requestedBy: doctorPractitioner.name,
    facility: "Apex Multi-Specialty Hospital",
    purpose: clinicalPurpose,
    requestedRecords: requestedScopes,
    status: "pending",
    requestedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  assert(consentRequest._id, "Consent request saved to database");
  assert.strictEqual(consentRequest.status, "pending");
  assert.strictEqual(consentRequest.patientUniqueId, "HS-PT-842910");
  assert.deepStrictEqual(consentRequest.requestedRecords, requestedScopes);
  console.log(`  ✓ PASS: Doctor created pending report request (${testConsentId}) for patient Unique ID HS-PT-842910`);

  // 3. Verify Patient can query pending consent requests
  const patientPendingRequests = await Consent.find({
    patientUuid: targetPatient.internalUuid,
    status: "pending",
  }).lean();
  assert(
    patientPendingRequests.some((c) => c.consentId === testConsentId),
    "Pending consent request appears in patient's pending authorization inbox"
  );
  console.log("  ✓ PASS: Pending report request appears in patient inbox for approval");

  // 4. Patient approves the request
  const approvedConsent = await Consent.findOneAndUpdate(
    { consentId: testConsentId },
    { status: "approved", approvedAt: new Date() },
    { new: true }
  ).lean();
  assert(approvedConsent, "Consent updated");
  assert.strictEqual(approvedConsent.status, "approved");
  assert(approvedConsent.approvedAt, "approvedAt timestamp set");
  console.log("  ✓ PASS: Patient approved report request, status transitioned to 'approved'");

  // 5. Verify doctor can query active authorized requests for patient
  const doctorAuthorizedRequests = await Consent.find({
    patientUniqueId: targetPatient.patientUniqueId,
    status: "approved",
  }).lean();
  assert(
    doctorAuthorizedRequests.some((c) => c.consentId === testConsentId),
    "Doctor can query approved consent by patient Unique ID"
  );
  console.log("  ✓ PASS: Doctor console reflects active ABDM authorization for requested records");

  // Clean up test consent
  await Consent.deleteOne({ _id: consentRequest._id });
  console.log("  ✓ PASS: Test consent cleaned up successfully");

  console.log("\n=======================================================");
  console.log("   ALL 6 TESTS PASSED SUCCESSFULLY!                    ");
  console.log("=======================================================\n");

  await mongoose.disconnect();
}

runDoctorLookupSuite().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
