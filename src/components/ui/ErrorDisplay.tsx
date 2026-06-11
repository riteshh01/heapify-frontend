"use client";

/**
 * Error Display Component — 2010s design system
 * Shows global errors in a dedicated area
 */

import { useError } from "@/context/ErrorContext";

export function ErrorDisplay() {
  const { errors, removeError } = useError();

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 space-y-3 w-full max-w-md">
      {errors.map((error) => (
        <div
          key={error.id}
          className="flex items-start gap-3 rounded-xl border border-red-300 dark:border-red-500/30 bg-[#fee2e2] dark:bg-[#7f1d1d]/50 px-4 py-3 shadow-md text-[#991b1b] dark:text-[#f87171] transition-colors duration-300"
          role="alert"
        >
          {/* Icon */}
          <div className="flex-shrink-0 text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">
            ✕
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="font-bold">Error</p>
            <p className="mt-1 text-sm opacity-90">{error.message}</p>
            {error.code && (
              <p className="mt-1 text-xs opacity-75">Code: {error.code}</p>
            )}
          </div>

          {/* Close Button */}
          {error.dismissible && (
            <button
              onClick={() => removeError(error.id)}
              className="flex-shrink-0 text-lg opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
