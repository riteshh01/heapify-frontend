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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedSession = localStorage.getItem("authSession");
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession) as AuthSession;
          // Verify token is still valid
          if (new Date(parsedSession.expiresAt) > new Date()) {
            setSession(parsedSession);
            setUser(parsedSession.user);
            setIsLoggedIn(true);
            setAuthToken(parsedSession.token);
          } else {
            // Token expired, clear session
            localStorage.removeItem("authSession");
            clearAuthToken();
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("authSession");
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
      // localStorage.setItem("authSession", JSON.stringify(response));
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
      // localStorage.setItem("authSession", JSON.stringify(response));
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    setSession(null);
    setIsLoggedIn(false);
    clearAuthToken();
    localStorage.removeItem("authSession");
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
          setUser(data.data.user);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  }, []);

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
