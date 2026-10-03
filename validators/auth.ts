/**
 * validators/auth.ts
 *
 * Zod schemas for all authentication-related inputs.
 * Used server-side in API routes AND client-side for real-time form feedback.
 */

import { z } from "zod";

// ─── Shared field rules ─────────────────────────────────────────────────────

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(254, "Email is too long");

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[0-9]/, "Password must include at least one number");

// ─── Registration ───────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(200),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["patient", "doctor", "facility_admin"]).default("patient"),
    phone: z.string().trim().max(20).optional().transform((v) => (v === "" ? undefined : v)),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
    dateOfBirth: z.string().optional().transform((v) => (v === "" ? undefined : v)),
    bloodGroup: z.string().trim().max(10).optional().transform((v) => (v === "" ? undefined : v)),
    address: z.string().trim().max(500).optional().transform((v) => (v === "" ? undefined : v)),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Login ──────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Patient profile ────────────────────────────────────────────────────────

export const patientProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(200),
  dateOfBirth: z.string().optional().transform((v) => (v === "" ? undefined : v)),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  bloodGroup: z.string().trim().max(10).optional().transform((v) => (v === "" ? undefined : v)),
  phone: z.string().trim().max(20).optional().transform((v) => (v === "" ? undefined : v)),
  address: z.string().trim().max(500).optional().transform((v) => (v === "" ? undefined : v)),
  allergies: z.array(z.string().trim().max(100)).default([]),
  conditions: z.array(z.string().trim().max(200)).default([]),
  emergencyContact: z
    .object({
      name:     z.string().trim().max(200).optional().transform((v) => (v === "" ? undefined : v)),
      relation: z.string().trim().max(100).optional().transform((v) => (v === "" ? undefined : v)),
      phone:    z.string().trim().max(20).optional().transform((v) => (v === "" ? undefined : v)),
    })
    .optional(),
});

export type PatientProfileInput = z.infer<typeof patientProfileSchema>;
