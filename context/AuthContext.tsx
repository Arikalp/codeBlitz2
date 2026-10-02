/**
 * context/AuthContext.tsx
 *
 * Client-side Authentication Context & Provider for HealthSetu.
 * Manages user identity, session state, patient profile data, and provides
 * login, registration, logout, and profile update actions.
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { LoginInput, RegisterInput, PatientProfileInput } from "@/validators/auth";

export interface UserSession {
  id: string;
  email: string;
  role: "patient" | "doctor" | "facility_admin";
}

export interface PatientProfile {
  uuid: string;
  name: string;
  dateOfBirth?: string | Date;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  bloodGroup?: string;
  phone?: string;
  address?: string;
  allergies: string[];
  conditions: string[];
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  abhaIdDemo?: string | null;
}

export interface PractitionerProfile {
  id: string;
  name: string;
  specialty?: string;
  phone?: string;
}

export interface FacilityProfile {
  id: string;
  name: string;
  type?: string;
}

interface AuthContextType {
  user: UserSession | null;
  patient: PatientProfile | null;
  practitioner: PractitionerProfile | null;
  facility: FacilityProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterInput
  ) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }>;
  logout: () => Promise<void>;
  updateProfile: (
    data: Partial<PatientProfileInput>
  ) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [practitioner, setPractitioner] = useState<PractitionerProfile | null>(null);
  const [facility, setFacility] = useState<FacilityProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data.user);
          setPatient(json.data.patient);
          setPractitioner(json.data.practitioner || null);
          setFacility(json.data.facility || null);
          return;
        }
      }
      setUser(null);
      setPatient(null);
      setPractitioner(null);
      setFacility(null);
    } catch {
      setUser(null);
      setPatient(null);
      setPractitioner(null);
      setFacility(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { "Cache-Control": "no-cache" },
        });
        if (!active) return;
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && active) {
            setUser(json.data.user);
            setPatient(json.data.patient);
            setPractitioner(json.data.practitioner || null);
            setFacility(json.data.facility || null);
            return;
          }
        }
        if (active) {
          setUser(null);
          setPatient(null);
          setPractitioner(null);
          setFacility(null);
        }
      } catch {
        if (active) {
          setUser(null);
          setPatient(null);
          setPractitioner(null);
          setFacility(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = async (
    data: LoginInput
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.error || "Login failed. Please check your credentials.",
        };
      }

      await fetchSession();
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  };

  const register = async (
    data: RegisterInput
  ): Promise<{
    success: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.error || "Registration failed. Please check your inputs.",
          fieldErrors: json.fieldErrors,
        };
      }

      await fetchSession();
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout transport errors
    } finally {
      setUser(null);
      setPatient(null);
      setPractitioner(null);
      setFacility(null);
      router.push("/login");
      router.refresh();
    }
  };

  const updateProfile = async (
    data: Partial<PatientProfileInput>
  ): Promise<{
    success: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  }> => {
    try {
      const res = await fetch("/api/patient/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.error || "Failed to update profile",
          fieldErrors: json.fieldErrors,
        };
      }

      setPatient(json.data);
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Network error while saving profile.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patient,
        practitioner,
        facility,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        refresh: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
