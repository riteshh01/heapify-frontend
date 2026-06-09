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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            setAuthToken(parsedSession.token);
          } else {
            // Token expired, clear session
            localStorage.removeItem("authSession");
            clearAuthToken();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("authSession");
        clearAuthToken();
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
      // setAuthToken(response.token);
      // localStorage.setItem("authSession", JSON.stringify(response));
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    setSession(null);
    clearAuthToken();
    localStorage.removeItem("authSession");
    // TODO: Call logout endpoint
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    setUser,
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
