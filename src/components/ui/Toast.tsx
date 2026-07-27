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
        return "bg-emerald-50 dark:bg-[#0d1f16] border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300";
      case "error":
        return "bg-rose-50 dark:bg-[#2b1014] border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300";
      case "warning":
        return "bg-amber-50 dark:bg-[#2a1a09] border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300";
      case "info":
        return "bg-blue-50 dark:bg-[#0f172a] border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300";
      default:
        return "bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] text-slate-800 dark:text-[#c9d1d9]";
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
      className={`flex items-start gap-2.5 sm:gap-3 rounded-xl border px-3 py-2 sm:px-4 sm:py-3 shadow-lg transition-colors duration-300 ${getStyles()}`}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 text-lg font-bold mt-0.5 ${getIconColor()}`}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 mt-0.5">
        <p className="font-bold text-xs sm:text-sm">{notification.title}</p>
        {notification.message && (
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-medium opacity-90">{notification.message}</p>
        )}

        {/* Action Button */}
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-bold underline hover:opacity-75"
          >
            {notification.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(notification.id)}
        className="flex-shrink-0 text-sm sm:text-base opacity-60 hover:opacity-100 transition-opacity font-bold mt-0.5"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}
