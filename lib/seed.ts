/**
 * lib/seed.ts
 *
 * Ensures demo user accounts exist for each role:
 * - Patient: patient@healthsetu.demo
 * - Doctor: doctor@healthsetu.demo
 * - Facility Admin: admin@healthsetu.demo
 *
 * Default password: HealthSetu@2025
 * Uses secure bcrypt hashing (12 rounds) and generated UUIDs.
 */

import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "./mongodb";
import { hashPassword } from "./auth";
import { User, Patient, Practitioner, Facility } from "@/models";

const DEMO_PASSWORD = "HealthSetu@2025";

export async function seedDemoAccounts() {
  await connectToDatabase();

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  // 1. Patient: Ramesh Patel
  const patientEmail = "patient@healthsetu.demo";
  let patientUser = await User.findOne({ email: patientEmail });
  if (!patientUser) {
    patientUser = await User.create({
      email: patientEmail,
      passwordHash,
      role: "patient",
      isActive: true,
    });

    await Patient.create({
      internalUuid: uuidv4(),
      userId: patientUser._id,
      name: "Ramesh Patel",
      dateOfBirth: new Date("1982-06-15"),
      gender: "male",
      bloodGroup: "B+",
      phone: "+91 98765 43210",
      address: "Flat 402, Green Meadows, Bengaluru, Karnataka",
      abhaIdDemo: "91-1234-5678-9012",
      allergies: ["Penicillin", "Sulfa drugs"],
      conditions: ["Type 2 Diabetes", "Hypertension"],
      emergencyContact: {
        name: "Sunita Patel",
        relation: "Spouse",
        phone: "+91 98765 43211",
      },
    });
  }

  // 2. Doctor: Dr. Priya Sharma
  const doctorEmail = "doctor@healthsetu.demo";
  let doctorUser = await User.findOne({ email: doctorEmail });
  if (!doctorUser) {
    doctorUser = await User.create({
      email: doctorEmail,
      passwordHash,
      role: "doctor",
      isActive: true,
    });

    await Practitioner.create({
      userId: doctorUser._id,
      name: "Dr. Priya Sharma",
      specialty: "General & Internal Medicine",
      registrationNumber: "KMC-48291",
      phone: "+91 98111 22334",
    });
  }

  // 3. Facility Administrator: Apex Hospital
  const adminEmail = "admin@healthsetu.demo";
  const adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    let facility = await Facility.findOne({ isDemo: true });
    if (!facility) {
      facility = await Facility.create({
        name: "Apex Multi-Specialty Hospital",
        type: "hospital",
        address: "100 Outer Ring Road, Marathahalli, Bengaluru",
        phone: "+91 80 2345 6789",
        email: "contact@apexhospital.demo",
        registrationNumber: "KA-HOSP-2021-998",
        isDemo: true,
      });
    }

    await User.create({
      email: adminEmail,
      passwordHash,
      role: "facility_admin",
      isActive: true,
    });
  }
}
