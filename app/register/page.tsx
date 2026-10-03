/**
 * app/register/page.tsx
 *
 * /register — Patient Registration and Profile Initialisation.
 * Validates inputs client-side & server-side with Zod.
 * Password strength and match checking.
 * Allows entering essential profile information (phone, DOB, gender, blood group, address).
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  MapPin,
  Droplets,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { registerSchema } from "@/validators/auth";
import Button from "@/components/ui/Button";
import BrandLogo from "@/components/ui/BrandLogo";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  // Form State
  const [role, setRole] = useState<"patient" | "doctor" | "facility_admin">("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "prefer_not_to_say" | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Password rules validation
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = {
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      role,
      phone: phone.trim() || undefined,
      gender: gender ? (gender as "male" | "female" | "other" | "prefer_not_to_say") : undefined,
      dateOfBirth: dateOfBirth || undefined,
      bloodGroup: bloodGroup || undefined,
      address: address.trim() || undefined,
    };

    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join(".");
        if (!errs[field]) errs[field] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (!res.success) {
        setError(res.error || "Registration failed");
        if (res.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.fieldErrors)) {
            mapped[k] = v[0] || "Invalid value";
          }
          setFieldErrors(mapped);
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface-muted)]">
      <div className="max-w-2xl mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Link
              href="/"
              className="inline-flex items-center group"
              aria-label="HealthSetu Home"
            >
              <BrandLogo size="lg" layout="horizontal" tagline="Clinical Care Bridge" />
            </Link>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Set up your longitudinal health profile and take control of your medical history
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] py-8 px-6 sm:px-10 border border-[var(--color-border)] rounded-2xl shadow-sm">
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5"
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5"
            >
              <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-600" />
              <span>Account created successfully! Redirecting to your dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wide mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "patient", label: "Patient" },
                  { id: "doctor", label: "Doctor" },
                  { id: "facility_admin", label: "Facility Admin" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as "patient" | "doctor" | "facility_admin")}
                    className={[
                      "py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center",
                      role === r.id
                        ? "border-[var(--color-brand-600)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)] shadow-xs"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]",
                    ].join(" ")}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Essential Credentials */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                1. Account Credentials
              </h2>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                    <User size={16} />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="block w-full rounded-xl border border-[var(--color-border)] py-2.5 pl-10 pr-3 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                    <Mail size={16} />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="block w-full rounded-xl border border-[var(--color-border)] py-2.5 pl-10 pr-3 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="reg-pass"
                    className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                      <Lock size={16} />
                    </div>
                    <input
                      id="reg-pass"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-xl border border-[var(--color-border)] py-2.5 pl-10 pr-9 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reg-conf-pass"
                    className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
                  >
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                      <Lock size={16} />
                    </div>
                    <input
                      id="reg-conf-pass"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-xl border border-[var(--color-border)] py-2.5 pl-10 pr-3 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] space-y-1">
                <p className="font-semibold text-[var(--color-text-primary)] mb-1">
                  Password requirements:
                </p>
                <div className="grid grid-cols-2 gap-1">
                  <span className={hasMinLen ? "text-emerald-600 font-medium" : "text-[var(--color-text-muted)]"}>
                    {hasMinLen ? "✓" : "○"} 8+ characters
                  </span>
                  <span className={hasUpper ? "text-emerald-600 font-medium" : "text-[var(--color-text-muted)]"}>
                    {hasUpper ? "✓" : "○"} 1 uppercase letter
                  </span>
                  <span className={hasNumber ? "text-emerald-600 font-medium" : "text-[var(--color-text-muted)]"}>
                    {hasNumber ? "✓" : "○"} 1 number
                  </span>
                  <span className={passwordsMatch ? "text-emerald-600 font-medium" : "text-[var(--color-text-muted)]"}>
                    {passwordsMatch ? "✓" : "○"} Passwords match
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Information (For Patient) */}
            {role === "patient" && (
              <div className="space-y-4 pt-3 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    2. Patient Profile Information
                  </h2>
                  <span className="text-[11px] text-[var(--color-text-muted)]">Can be edited later</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="reg-phone"
                      className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                        <Phone size={16} />
                      </div>
                      <input
                        id="reg-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="block w-full rounded-xl border border-[var(--color-border)] py-2.5 pl-10 pr-3 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label
                      htmlFor="reg-dob"
                      className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
                    >
                      Date of Birth
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                        <Calendar size={16} />
                      </div>
                      <input
                        id="reg-dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="block w-full rounded-xl border border-[var(--color-border)] py-2.5 pl-10 pr-3 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label
                      htmlFor="reg-gender"
                      className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
                    >
                      Gender
                    </label>
                    <select
                      id="reg-gender"
                      value={gender}
                      onChange={(e) =>
                        setGender(e.target.value as "male" | "female" | "other" | "prefer_not_to_say" | "")
                      }
                      className="block w-full rounded-xl border border-[var(--color-border)] py-2.5 px-3 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                    >
                      <option value="">Select Gender (Optional)</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label
                      htmlFor="reg-blood"
                      className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
                    >
                      Blood Group
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-red-500">
                        <Droplets size={16} />
                      </div>
                      <select
                        id="reg-blood"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="block w-full rounded-xl border border-[var(--color-border)] py-2.5 pl-10 pr-3 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                      >
                        <option value="">Select Blood Group (Optional)</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Residential Address */}
                <div>
                  <label
                    htmlFor="reg-addr"
                    className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
                  >
                    Residential Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute top-3 left-3.5 text-[var(--color-text-muted)]">
                      <MapPin size={16} />
                    </div>
                    <textarea
                      id="reg-addr"
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, State, PIN"
                      className="block w-full rounded-xl border border-[var(--color-border)] py-2.5 pl-10 pr-3 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                id="register-submit-btn"
                type="submit"
                variant="primary"
                size="md"
                disabled={loading || success}
                className="w-full flex justify-center items-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>UUID-based patient isolation · Secure password hashing · No plaintext storage</span>
        </div>
      </div>
    </div>
  );
}
