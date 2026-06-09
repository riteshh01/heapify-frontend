"use client";

/**
 * Notification Context
 * Manages global toast/notification state
 */

import React, { createContext, useCallback, useState } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 = persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  notify: (
    title: string,
    options?: Partial<Omit<Notification, "id" | "title" | "timestamp">>
  ) => string; // returns notification ID
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback(
    (
      title: string,
      options: Partial<Omit<Notification, "id" | "title" | "timestamp">> = {}
    ): string => {
      const id = `notif-${Date.now()}-${Math.random()}`;
      const {
        type = "info",
        message,
        duration = 3000,
        action,
      } = options;

      const newNotification: Notification = {
        id,
        type,
        title,
        message,
        duration,
        action,
        timestamp: new Date(),
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove notification after duration (unless duration is 0)
      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((notif) => notif.id !== id)
          );
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, notify, removeNotification, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
