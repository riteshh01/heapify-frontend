"use client";

/**
 * Authentication Context
 * Manages user authentication state and session
 */

import React, { createContext, useCallback, useEffect, useState } from "react";
import { AuthSession, User } from "@/types";
import { clearAuthToken, setAuthToken } from "@/services/api";

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
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
  saveUserToStorage: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Safely read a JSON value from localStorage */
function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Safely write a JSON value to localStorage */
function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/** Safely remove a key from localStorage */
function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // ── Save user to localStorage (called from login page after successful login) ──
  const saveUserToStorage = useCallback((userData: User) => {
    writeStorage("authUser", userData);
    writeStorage("authLoggedIn", true);
  }, []);

  // ── Initialize auth from localStorage on mount ─────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First restore from localStorage immediately (no flicker)
        const storedLoggedIn = localStorage.getItem("authLoggedIn");
        const storedUser = readStorage<User>("authUser");

        if (storedLoggedIn === "true" && storedUser) {
          setUser(storedUser);
          setIsLoggedIn(true);
        }

        // Also try the legacy authSession format
        const storedSession = readStorage<AuthSession>("authSession");
        if (storedSession) {
          if (new Date(storedSession.expiresAt) > new Date()) {
            setSession(storedSession);
            if (!storedUser) {
              setUser(storedSession.user);
              setIsLoggedIn(true);
            }
            setAuthToken(storedSession.token);
          } else {
            removeStorage("authSession");
            clearAuthToken();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        removeStorage("authSession");
        removeStorage("authUser");
        removeStorage("authLoggedIn");
        clearAuthToken();
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      // TODO: Replace with actual API call
      // const response = await post<AuthSession>("/auth/login", { email, password });
      // setSession(response);
      // setUser(response.user);
      // setIsLoggedIn(true);
      // setAuthToken(response.token);
      // writeStorage("authSession", response);
      // saveUserToStorage(response.user);
    },
    []
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      // TODO: Replace with actual API call
      // const response = await post<AuthSession>("/auth/signup", {
      //   email,
      //   password,
      //   name,
      // });
      // setSession(response);
      // setUser(response.user);
      // setIsLoggedIn(true);
      // setAuthToken(response.token);
      // writeStorage("authSession", response);
      // saveUserToStorage(response.user);
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    setSession(null);
    setIsLoggedIn(false);
    clearAuthToken();
    removeStorage("authSession");
    removeStorage("authUser");
    removeStorage("authLoggedIn");
    // TODO: Call logout endpoint
  }, []);

  const getUserData = useCallback(async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";
      const response = await fetch(`${API_BASE_URL}/is-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.user) {
          const userData = data.data.user as User;
          setUser(userData);
          // Persist user data so refresh keeps the session alive
          saveUserToStorage(userData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  }, [saveUserToStorage]);

  const value: AuthContextType = {
    user,
    session,
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
    saveUserToStorage,
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
