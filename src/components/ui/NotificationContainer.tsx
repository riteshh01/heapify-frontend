"use client";

/**
 * Notification Container Component
 * Displays all active notifications/toasts
 */

import { Toast } from "./Toast";
import { useNotification } from "@/context/NotificationContext";

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-md pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast
            notification={notification}
            onClose={removeNotification}
          />
        </div>
      ))}
    </div>
  );
}
