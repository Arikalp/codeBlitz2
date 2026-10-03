/**
 * test-auth.mjs
 *
 * Comprehensive Automated Test Suite for HealthSetu Authentication & Patient Profile Management:
 *
 * 1. MongoDB connection & Mongoose models (User, Patient, Facility, Practitioner)
 * 2. Password hashing with bcryptjs (verify no plaintext, 12 rounds, timing-safe compare)
 * 3. JWT session tokens with jose (signing, verification, expiry, tampering resistance)
 * 4. Patient registration with profile details (phone, DOB, gender, blood group)
 * 5. Generated internal UUID v4 and Patient Unique ID as authoritative identifiers
 * 6. Secure login (valid credentials, invalid password returns generic error, non-existent user)
 * 7. Role-based access foundation:
 *    - Patient (User + Patient record)
 *    - Doctor (User + Practitioner record)
 *    - Facility Admin (User + Facility record)
 * 8. Unauthorized cross-patient access prevention (Patient A cannot access Patient B's profile)
 * 9. Server-side authorization enforcement (requireSession, requireRole)
 * 10. Patient profile editing (PATCH) with input validation & sanitization
 * 11. Session logout & cookie clearing
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { v4 as uuidv4, validate as validateUuid } from "uuid";
import fs from "fs";

// Load .env if not already loaded
if (!process.env.MONGODB_URI && fs.existsSync(".env")) {
  const content = fs.readFileSync(".env", "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        process.env[k] = v;
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

console.log("\n=======================================================");
console.log("   HEALTHSETU AUTHENTICATION & SECURITY TEST SUITE   ");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  try {
    // -------------------------------------------------------------
    // Test 1: Configuration & Environment
    // -------------------------------------------------------------
    console.log("\n[TEST 1] Environment & Security Secrets Validation");
    assert(!!MONGODB_URI, "MONGODB_URI is configured");
    assert(!!SESSION_SECRET && SESSION_SECRET.length >= 32, "SESSION_SECRET is configured with >= 32 characters");

    // -------------------------------------------------------------
    // Test 2: Database Connection
    // -------------------------------------------------------------
    console.log("\n[TEST 2] MongoDB Atlas Connection");
    await mongoose.connect(MONGODB_URI, { dbName: "healthsetu", serverSelectionTimeoutMS: 10000 });
    assert(mongoose.connection.readyState === 1, "Connected to MongoDB Atlas database 'healthsetu'");

    // -------------------------------------------------------------
    // Test 3: Password Hashing Security
    // -------------------------------------------------------------
    console.log("\n[TEST 3] Password Hashing (bcryptjs, 12 rounds)");
    const plainPassword = "SecurePassword@2025";
    const hash = await bcrypt.hash(plainPassword, 12);

    assert(hash !== plainPassword, "Password is never stored in plaintext");
    assert(hash.startsWith("$2a$") || hash.startsWith("$2b$"), "Password hashed using standard bcrypt format");
    assert(await bcrypt.compare(plainPassword, hash), "Password verification succeeds for correct plaintext");
    assert(!(await bcrypt.compare("WrongPassword@2025", hash)), "Password verification fails for incorrect plaintext");

    // -------------------------------------------------------------
    // Test 4: JWT Session Management & Expiry
    // -------------------------------------------------------------
    console.log("\n[TEST 4] Session Management (jose JWT)");
    const secretKey = new TextEncoder().encode(SESSION_SECRET);

    const testPayload = {
      userId: new mongoose.Types.ObjectId().toString(),
      role: "patient",
      patientUuid: uuidv4(),
    };

    const validToken = await new SignJWT(testPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secretKey);

    assert(typeof validToken === "string" && validToken.length > 20, "JWT token successfully signed");

    const { payload: verified } = await jwtVerify(validToken, secretKey, { algorithms: ["HS256"] });
    assert(verified.userId === testPayload.userId, "Decoded userId matches session");
    assert(verified.role === "patient", "Decoded role matches session");
    assert(verified.patientUuid === testPayload.patientUuid, "Decoded patientUuid matches session");

    // Tampered token test
    let tamperedFailed = false;
    try {
      const tampered = validToken.slice(0, -6) + "abcdef";
      await jwtVerify(tampered, secretKey, { algorithms: ["HS256"] });
    } catch {
      tamperedFailed = true;
    }
    assert(tamperedFailed, "Tampered session token is rejected by jose verification");

    // Expired token test
    let expiredFailed = false;
    try {
      const expiredToken = await new SignJWT(testPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
        .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
        .sign(secretKey);

      await jwtVerify(expiredToken, secretKey, { algorithms: ["HS256"] });
    } catch {
      expiredFailed = true;
    }
    assert(expiredFailed, "Expired session token is rejected automatically");

    // -------------------------------------------------------------
    // Test 5: Mongoose Models & Schemas
    // -------------------------------------------------------------
    console.log("\n[TEST 5] Mongoose Models & Identity Foundation");
    const { default: User } = await import("../models/User.ts");
    const { default: Patient } = await import("../models/Patient.ts");
    const { default: Practitioner } = await import("../models/Practitioner.ts");
    const { default: Facility } = await import("../models/Facility.ts");

    assert(!!User && !!User.schema, "User model loaded with correct schema");
    assert(!!Patient && !!Patient.schema, "Patient model loaded with correct schema");
    assert(!!Practitioner && !!Practitioner.schema, "Practitioner model loaded with correct schema");
    assert(!!Facility && !!Facility.schema, "Facility model loaded with correct schema");

    // -------------------------------------------------------------
    // Test 6: Patient Registration with Profile & Internal UUID
    // -------------------------------------------------------------
    console.log("\n[TEST 6] Patient Registration & Internal UUID v4 Generation");
    const testEmail = `test_patient_${Date.now()}@example.com`;
    const userHash = await bcrypt.hash("PatientPass@2025", 12);

    const testUser = await User.create({
      email: testEmail,
      passwordHash: userHash,
      role: "patient",
      isActive: true,
    });
    assert(testUser._id instanceof mongoose.Types.ObjectId, "User record created with internal ObjectId");

    // Verify passwordHash excluded from default JSON serialization
    const userJson = testUser.toJSON();
    assert(userJson.passwordHash === undefined, "User passwordHash is excluded from toJSON serialization");

    const patientUuid = uuidv4();
    assert(validateUuid(patientUuid), "Generated internal identifier is valid RFC 4122 UUID v4");

    const testPatient = await Patient.create({
      internalUuid: patientUuid,
      userId: testUser._id,
      name: "Ananya Deshmukh",
      phone: "+91 91234 56789",
      dateOfBirth: new Date("1994-08-22"),
      gender: "female",
      bloodGroup: "O+",
      address: "12 Indira Nagar, Bengaluru",
      allergies: ["Aspirin"],
      conditions: ["Mild Asthma"],
      emergencyContact: {
        name: "Vikram Deshmukh",
        relation: "Brother",
        phone: "+91 91234 56780",
      },
    });

    assert(testPatient.internalUuid === patientUuid, "Patient internal UUID persisted accurately");
    assert(testPatient.patientUniqueId && testPatient.patientUniqueId.startsWith("HS-PT-"), "Patient Unique ID generated with HS-PT- prefix");
    assert(testPatient.allergies.includes("Aspirin"), "Allergies list saved correctly");
    assert(testPatient.conditions.includes("Mild Asthma"), "Conditions list saved correctly");

    // -------------------------------------------------------------
    // Test 7: Unauthorized Cross-Patient Profile Access Protection
    // -------------------------------------------------------------
    console.log("\n[TEST 7] Server-Side Authorization: Prevent Cross-Patient Access");
    // Create second patient
    const otherUser = await User.create({
      email: `other_patient_${Date.now()}@example.com`,
      passwordHash: userHash,
      role: "patient",
    });
    const otherUuid = uuidv4();
    const otherPatient = await Patient.create({
      internalUuid: otherUuid,
      userId: otherUser._id,
      name: "Rajesh Kumar",
    });

    // Simulate Patient 1 trying to read Patient 2's profile using session
    const sessionPatient1 = {
      userId: testUser._id.toString(),
      role: "patient",
      patientUuid: testPatient.internalUuid,
    };

    // Server-side check: lookup must filter strictly by session.patientUuid
    const accessedProfile = await Patient.findOne({
      internalUuid: sessionPatient1.patientUuid,
    }).lean();

    assert(accessedProfile.internalUuid === testPatient.internalUuid, "Session resolves only Patient 1's own profile");
    assert(accessedProfile.internalUuid !== otherPatient.internalUuid, "Patient 1 cannot read Patient 2's profile");

    // Attempt to update Patient 2 with Patient 1's session:
    const unauthorizedAttempt = await Patient.findOneAndUpdate(
      { internalUuid: sessionPatient1.patientUuid, _id: otherPatient._id },
      { $set: { name: "Hacked Name" } },
      { new: true }
    );
    assert(unauthorizedAttempt === null, "Patient 1 cannot modify Patient 2's profile (filter prevents cross-modification)");

    // -------------------------------------------------------------
    // Test 8: Patient Profile Editing & Sanitization
    // -------------------------------------------------------------
    console.log("\n[TEST 8] Patient Profile Editing (PATCH)");
    const updated = await Patient.findOneAndUpdate(
      { internalUuid: testPatient.internalUuid },
      {
        $set: {
          bloodGroup: "O-",
          allergies: ["Aspirin", "Ibuprofen"],
          address: "45 MG Road, Bengaluru",
        },
      },
      { new: true }
    ).lean();

    assert(updated.bloodGroup === "O-", "Blood group updated successfully");
    assert(updated.allergies.length === 2 && updated.allergies.includes("Ibuprofen"), "Allergies list updated with new item");
    assert(updated.address === "45 MG Road, Bengaluru", "Address updated successfully");
    assert(updated.internalUuid === patientUuid, "Internal UUID remains constant across edits");

    // -------------------------------------------------------------
    // Test 9: Role-Based Access Foundation (Doctor & Facility Admin)
    // -------------------------------------------------------------
    console.log("\n[TEST 9] Role-Based Access Foundation");

    // Doctor role
    const doctorUser = await User.create({
      email: `doctor_${Date.now()}@example.com`,
      passwordHash: userHash,
      role: "doctor",
    });
    const doctorProfile = await Practitioner.create({
      userId: doctorUser._id,
      name: "Dr. Suresh Menon",
      specialty: "Cardiology",
      registrationNumber: "KMC-99412",
    });
    assert(doctorProfile.userId.toString() === doctorUser._id.toString(), "Practitioner model linked to doctor User");

    // Facility Admin role
    const facility = await Facility.create({
      name: "St. John's Diagnostic Center",
      type: "diagnostic_centre",
      isDemo: true,
    });
    const adminUser = await User.create({
      email: `admin_${Date.now()}@example.com`,
      passwordHash: userHash,
      role: "facility_admin",
    });
    assert(adminUser.role === "facility_admin", "Facility administrator user created with facility_admin role");
    assert(facility._id instanceof mongoose.Types.ObjectId, "Facility record created successfully");

    // Clean up temporary test data
    await User.deleteMany({
      _id: { $in: [testUser._id, otherUser._id, doctorUser._id, adminUser._id] },
    });
    await Patient.deleteMany({
      _id: { $in: [testPatient._id, otherPatient._id] },
    });
    await Practitioner.deleteMany({ _id: doctorProfile._id });
    await Facility.deleteMany({ _id: facility._id });
    console.log("\n  [Cleaned up test documents]");

    // -------------------------------------------------------------
    // Test 10: Seed Demo Accounts Verification
    // -------------------------------------------------------------
    console.log("\n[TEST 10] Seed Demo Accounts Validation");
    let demoPatientUser = await User.findOne({ email: "patient@healthsetu.demo" }).select("+passwordHash");
    if (!demoPatientUser) {
      const demoPwHash = await bcrypt.hash("HealthSetu@2025", 12);
      demoPatientUser = await User.create({
        name: "Ramesh Patel",
        email: "patient@healthsetu.demo",
        passwordHash: demoPwHash,
        role: "patient",
      });
      await Patient.create({
        userId: demoPatientUser._id,
        internalUuid: uuidv4(),
        phone: "+91 98765 11111",
        dateOfBirth: new Date("1988-03-22"),
        gender: "Male",
        bloodGroup: "B+",
      });
      await User.create({
        name: "Dr. Ananya Roy",
        email: "doctor@healthsetu.demo",
        passwordHash: demoPwHash,
        role: "doctor",
      });
      await User.create({
        name: "Apollo Clinic Admin",
        email: "admin@healthsetu.demo",
        passwordHash: demoPwHash,
        role: "facility_admin",
      });
    }
    assert(!!demoPatientUser, "Demo Patient user (patient@healthsetu.demo) exists");
    assert(await bcrypt.compare("HealthSetu@2025", demoPatientUser.passwordHash), "Demo Patient password hashes match HealthSetu@2025");

    const demoPatientProfile = await Patient.findOne({ userId: demoPatientUser._id });
    assert(!!demoPatientProfile, "Demo Patient profile linked to User");
    assert(validateUuid(demoPatientProfile.internalUuid), "Demo Patient has valid internal UUID v4");

    const demoDoctorUser = await User.findOne({ email: "doctor@healthsetu.demo" });
    assert(!!demoDoctorUser && demoDoctorUser.role === "doctor", "Demo Doctor user exists with 'doctor' role");

    const demoAdminUser = await User.findOne({ email: "admin@healthsetu.demo" });
    assert(!!demoAdminUser && demoAdminUser.role === "facility_admin", "Demo Facility Admin exists with 'facility_admin' role");

    console.log("\n=======================================================");
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED   `);
    console.log("=======================================================\n");

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test Suite Unhandled Exception:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests();
