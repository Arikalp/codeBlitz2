/**
 * app/login/page.tsx
 *
 * /login — Secure User Login for HealthSetu.
 * Supports Patient, Doctor, and Facility Administrator authentication.
 * Form validation with Zod, informative error banners, loading states,
 * and quick-fill demo credentials for evaluation.
 */

"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Building2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { loginSchema } from "@/validators/auth";
import Button from "@/components/ui/Button";

const DEMO_ACCOUNTS = [
  {
    role: "Patient",
    email: "patient@healthsetu.demo",
    name: "Ramesh Patel",
    icon: UserCheck,
    desc: "Longitudinal health record owner",
    color: "border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-teal-800",
  },
  {
    role: "Doctor",
    email: "doctor@healthsetu.demo",
    name: "Dr. Priya Sharma",
    icon: Stethoscope,
    desc: "Internal Medicine Practitioner",
    color: "border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-800",
  },
  {
    role: "Facility Admin",
    email: "admin@healthsetu.demo",
    name: "Apex Hospital Admin",
    icon: Building2,
    desc: "Hospital System Administrator",
    color: "border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-800",
  },
];

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-muted)]">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-600)] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side Zod validation
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errMap: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as "email" | "password";
        if (field && !errMap[field]) {
          errMap[field] = issue.message;
        }
      }
      setFieldErrors(errMap);
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email: email.trim(), password });
      if (!res.success) {
        setError(res.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Success — redirect to dashboard or target route
      router.push(from);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  function handleDemoSelect(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("HealthSetu@2025");
    setError(null);
    setFieldErrors({});
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface-muted)]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-bold text-2xl text-[var(--color-brand-600)]"
            aria-label="HealthSetu Home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-brand-600)] text-white shadow-md shadow-[var(--color-brand-600)]/20">
              <Stethoscope size={24} strokeWidth={2.2} />
            </span>
            <span>HealthSetu</span>
          </Link>
        </div>

        <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Welcome back
        </h1>
        <p className="mt-1 text-center text-sm text-[var(--color-text-secondary)]">
          Sign in to access your continuous health record
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--color-surface)] py-8 px-6 shadow-sm border border-[var(--color-border)] rounded-2xl sm:px-10">
          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 animate-fade-in"
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wide mb-1.5"
              >
                Email Address
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                  <Mail size={17} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="name@example.com"
                  className={[
                    "block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-colors",
                    "bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]",
                    fieldErrors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[var(--color-border)]",
                  ].join(" ")}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wide mb-1.5"
              >
                Password
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                  <Lock size={17} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={[
                    "block w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm transition-colors",
                    "bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]",
                    fieldErrors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[var(--color-border)]",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                id="login-submit-btn"
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Quick-Fill Demo Logins */}
          <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2.5">
              1-Click Demo Accounts (Pre-loaded):
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleDemoSelect(acc.email)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${acc.color}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-white/70 shadow-xs">
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-tight truncate">{acc.role}: {acc.name}</p>
                        <p className="text-[11px] opacity-80 truncate">{acc.email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium underline flex-shrink-0 ml-2">Fill</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            New to HealthSetu?{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] hover:underline"
            >
              Create patient account
            </Link>
          </div>
        </div>

        {/* Security & Disclaimer Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Server-side protected sessions · 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
}
