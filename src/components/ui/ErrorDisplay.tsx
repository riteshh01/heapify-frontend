"use client";

/**
 * Error Display Component
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
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-md animate-in slide-in-from-bottom text-red-800"
          role="alert"
        >
          {/* Icon */}
          <div className="flex-shrink-0 text-lg font-bold text-red-600 mt-0.5">
            ✕
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="font-semibold">Error</p>
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
