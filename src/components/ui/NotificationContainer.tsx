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
      className="fixed top-4 right-4 z-[200] space-y-2 w-max max-w-[calc(100vw-2rem)] sm:max-w-sm pointer-events-none"
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
