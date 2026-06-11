/**
 * Toast/Notification Component — 2010s design system
 * Individual toast notification display
 */

import React from "react";
import type { Notification } from "@/context/NotificationContext";

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export function Toast({ notification, onClose }: ToastProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case "success":
        return "bg-[#dcfce7] dark:bg-[#064e3b]/60 border-[#bbf7d0] dark:border-[#047857] text-[#166534] dark:text-[#34d399]";
      case "error":
        return "bg-[#fee2e2] dark:bg-[#7f1d1d]/60 border-[#fecaca] dark:border-[#b91c1c] text-[#991b1b] dark:text-[#f87171]";
      case "warning":
        return "bg-[#fef9c3] dark:bg-[#78350f]/60 border-[#fef08a] dark:border-[#b45309] text-[#854d0e] dark:text-[#fbbf24]";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/60 border-blue-200 dark:border-blue-500/30 text-[#3b5998] dark:text-[#7dd3fc]";
      default:
        return "bg-[#e2e8f0] dark:bg-[#334155] border-[#cbd5e1] dark:border-[#475569] text-[#475569] dark:text-[#cbd5e1]";
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case "success":
        return "text-[#166534] dark:text-[#34d399]";
      case "error":
        return "text-[#991b1b] dark:text-[#f87171]";
      case "warning":
        return "text-[#854d0e] dark:text-[#fbbf24]";
      case "info":
        return "text-[#3b5998] dark:text-[#7dd3fc]";
      default:
        return "text-[#475569] dark:text-[#cbd5e1]";
    }
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-md transition-colors duration-300 ${getStyles()}`}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 text-lg font-bold mt-0.5 ${getIconColor()}`}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="font-bold">{notification.title}</p>
        {notification.message && (
          <p className="mt-1 text-sm opacity-90">{notification.message}</p>
        )}

        {/* Action Button */}
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="mt-2 text-sm font-bold underline hover:opacity-75"
          >
            {notification.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(notification.id)}
        className="flex-shrink-0 text-lg opacity-60 hover:opacity-100 transition-opacity font-bold"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}
