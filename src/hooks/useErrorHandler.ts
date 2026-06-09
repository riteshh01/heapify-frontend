/**
 * Hook for handling API errors with notifications
 */

import { useError } from "@/context/ErrorContext";
import { useNotification } from "@/context/NotificationContext";

interface HandleErrorOptions {
  showNotification?: boolean;
  showError?: boolean;
  notificationDuration?: number;
}

export function useErrorHandler() {
  const { addError } = useError();
  const { notify } = useNotification();

  const handleError = (
    error: unknown,
    options: HandleErrorOptions = {}
  ): string => {
    const {
      showNotification = true,
      showError = false,
      notificationDuration = 3000,
    } = options;

    let message = "An unexpected error occurred";
    let code: string | undefined;

    // Handle different error types
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (typeof error === "object" && error !== null) {
      const errorObj = error as Record<string, unknown>;
      message = (errorObj.message as string) || message;
      code = (errorObj.code as string) || undefined;
    }

    // Show notification
    if (showNotification) {
      return notify(message, {
        type: "error",
        duration: notificationDuration,
      });
    }

    // Show error (persists longer)
    if (showError) {
      addError(message, code, "error");
    }

    return "";
  };

  return { handleError };
}
