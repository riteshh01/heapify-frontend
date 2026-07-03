"use client";

/**
 * Authentication Context
 *
 * Session persistence strategy (no localStorage for auth state):
 *   1. On mount → call GET /api/auth/me with credentials:"include"
 *   2. If /me returns user data → populate state (access token is valid)
 *   3. If /me returns 401 → api.ts interceptor auto-calls POST /refresh
 *   4. If refresh succeeds → /me is replayed automatically → user stays logged in
 *   5. If refresh also fails → "auth:logout" event fires → clear state, user sees login
 *
 * This means a page refresh NEVER logs the user out as long as either the
 * 15-min access token or the 7-day refresh token is still valid.
 * No JWT or sensitive data ever touches localStorage.
 */

import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { User } from "@/types";
import { apiCall } from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  userEmail: string;
  maskedEmail: string;
  verifyEmail: boolean;
  otpExpiry: string | null;
  otpCooldown: number;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setIsLoggedIn: (value: boolean) => void;
  setUserEmail: (email: string) => void;
  setMaskedEmail: (email: string) => void;
  setVerifyEmail: (value: boolean) => void;
  setOtpExpiry: (expiry: string) => void;
  setOtpCooldown: (cooldown: number) => void;
  getUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Constants ────────────────────────────────────────────────────────────────
// NOTE: Do NOT build full URLs here and pass them to apiCall().
// apiCall() already prepends NEXT_PUBLIC_API_BASE_URL (/api) internally.
// Just pass the path after /api, e.g. "/auth/me" → becomes "/api/auth/me".

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // ── Validate session on mount via API (replaces localStorage hydration) ───
  // The httpOnly cookies are sent automatically. If the access token has
  // expired, api.ts silently refreshes it before this resolves.
  useEffect(() => {
    const validateSession = async () => {
      try {
        const data = await apiCall<{ success: boolean; data?: { user: User } }>(
          "/auth/me"
        );

        if (data.success && data.data?.user) {
          setUser(data.data.user);
          setIsLoggedIn(true);
        }
      } catch {
        // 401 after failed refresh → "auth:logout" event will fire from api.ts
        // Nothing extra needed here; state stays empty → user sees login page.
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  // ── Listen for the global auth:logout event emitted by api.ts ─────────────
  // Fired when a token refresh fails (both tokens expired). Clears all state
  // so the user is redirected to login by the route guard.
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      setIsLoggedIn(false);
    };

    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  // ── Login (stub — actual call is in login/page.tsx directly) ─────────────
  const login = useCallback(async (_email: string, _password: string) => {
    // TODO: wire up when login page is refactored to use this context method
    // const data = await post<{ success: boolean }>(`${AUTH_BASE_URL}/login`, { email, password });
    // if (data.success) await getUserData();
  }, []);

  // ── Signup stub ───────────────────────────────────────────────────────────
  const signup = useCallback(
    async (_email: string, _password: string, _name: string) => {
      // TODO: wire up when signup page is refactored to use this context method
    },
    []
  );

  // ── Logout — clears both httpOnly cookies server-side ────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  // ── Fetch current user from /me (can be called anywhere to refresh data) ──
  const getUserData = useCallback(async () => {
    try {
      const data = await apiCall<{ success: boolean; data?: { user: User } }>(
        "/auth/me"
      );

      if (data.success && data.data?.user) {
        setUser(data.data.user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoggedIn,
    isLoading,
    userEmail,
    maskedEmail,
    verifyEmail,
    otpExpiry,
    otpCooldown,
    login,
    signup,
    logout,
    setUser,
    setIsLoggedIn,
    setUserEmail,
    setMaskedEmail,
    setVerifyEmail,
    setOtpExpiry,
    setOtpCooldown,
    getUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
