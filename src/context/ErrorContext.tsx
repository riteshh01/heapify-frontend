"use client";

/**
 * Error Context
 * Manages global error state and provides error display functionality
 */

import React, { createContext, useCallback, useState } from "react";

export interface AppError {
  id: string;
  message: string;
  code?: string;
  severity: "error" | "warning" | "info";
  timestamp: Date;
  dismissible?: boolean;
}

interface ErrorContextType {
  errors: AppError[];
  addError: (message: string, code?: string, severity?: "error" | "warning") => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(
  undefined
);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = useCallback(
    (
      message: string,
      code?: string,
      severity: "error" | "warning" = "error"
    ) => {
      const id = `error-${Date.now()}-${Math.random()}`;
      const newError: AppError = {
        id,
        message,
        code,
        severity,
        timestamp: new Date(),
        dismissible: true,
      };

      setErrors((prev) => [...prev, newError]);

      // Auto-remove after 5 seconds (unless dismissed)
      if (severity === "warning") {
        setTimeout(() => {
          setErrors((prev) => prev.filter((err) => err.id !== id));
        }, 5000);
      }
    },
    []
  );

  const removeError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((err) => err.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = React.useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within ErrorProvider");
  }
  return context;
}
