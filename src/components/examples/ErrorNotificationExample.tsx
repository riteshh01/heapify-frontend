"use client";

/**
 * Example Component Demonstrating Global Error & Notification Usage
 * 
 * This component shows how to use:
 * - useNotification() for toast messages
 * - useError() for persistent errors
 * - useErrorHandler() for API error handling
 */

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useNotification } from "@/context/NotificationContext";
import { useError } from "@/context/ErrorContext";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function ErrorNotificationExample() {
  const { notify, removeNotification, notifications } = useNotification();
  const { addError, removeError, errors } = useError();
  const { handleError } = useErrorHandler();

  const [count, setCount] = useState(0);

  // Example: Show success notification
  const handleSuccess = () => {
    notify("Operation completed successfully! 🎉", {
      type: "success",
      duration: 3000,
    });
  };

  // Example: Show info notification
  const handleInfo = () => {
    notify("This is an informational message.", {
      type: "info",
      duration: 3000,
    });
  };

  // Example: Show warning notification
  const handleWarning = () => {
    notify("Warning: Something might need your attention!", {
      type: "warning",
      duration: 4000,
    });
  };

  // Example: Show persistent notification (doesn't auto-dismiss)
  const handlePersistent = () => {
    notify("Persistent notification (click X to dismiss)", {
      type: "info",
      duration: 0, // 0 = never auto-dismiss
    });
  };

  // Example: Show notification with action button
  const handleActionNotification = () => {
    notify("Item deleted", {
      type: "info",
      action: {
        label: "Undo",
        onClick: () => {
          notify("Undo completed!", { type: "success" });
        },
      },
    });
  };

  // Example: Show persistent error
  const handlePersistentError = () => {
    addError(
      "This is a persistent error that stays until dismissed",
      "PERSISTENT_ERROR",
      "error"
    );
  };

  // Example: Simulate API error with handler
  const handleSimulateApiError = () => {
    try {
      // Simulate API error
      throw new Error("Failed to fetch data from server");
    } catch (error) {
      handleError(error, {
        showNotification: true,
        notificationDuration: 5000,
      });
    }
  };

  // Example: Clear all notifications
  const handleClearAll = () => {
    // Clear all notifications
    notifications.forEach((notif) => {
      removeNotification(notif.id);
    });
    // Clear all errors
    errors.forEach((err) => {
      removeError(err.id);
    });
    notify("Cleared all messages!", { type: "info" });
  };

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Error & Notification System Demo
        </h1>
        <p className="text-gray-600 mt-2">
          Click buttons below to see notifications and errors in action
        </p>
      </div>

      {/* Notifications Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Toast Notifications</h2>
          <p className="text-sm text-gray-600 mt-1">
            {notifications.length} active notification(s)
          </p>
        </CardHeader>
        <CardBody className="space-y-3">
          <Button onClick={handleSuccess} className="w-full">
            ✓ Show Success
          </Button>
          <Button onClick={handleInfo} variant="secondary" className="w-full">
            ℹ Show Info
          </Button>
          <Button onClick={handleWarning} variant="secondary" className="w-full">
            ⚠ Show Warning
          </Button>
          <Button onClick={handlePersistent} variant="secondary" className="w-full">
            ● Show Persistent
          </Button>
          <Button onClick={handleActionNotification} variant="secondary" className="w-full">
            ↶ Show with Action
          </Button>
        </CardBody>
      </Card>

      {/* Errors Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Persistent Errors</h2>
          <p className="text-sm text-gray-600 mt-1">
            {errors.length} active error(s)
          </p>
        </CardHeader>
        <CardBody className="space-y-3">
          <Button onClick={handlePersistentError} variant="danger" className="w-full">
            ✕ Show Persistent Error
          </Button>
          <Button onClick={handleSimulateApiError} variant="danger" className="w-full">
            ✕ Simulate API Error
          </Button>
        </CardBody>
      </Card>

      {/* Clear Demo */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardBody>
          <Button onClick={handleClearAll} variant="secondary" className="w-full">
            Clear All Messages
          </Button>
        </CardBody>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Code Examples</h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900">Show Toast Notification:</p>
            <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const { notify } = useNotification();

notify("Success!", { 
  type: "success",
  duration: 3000 
});`}
            </pre>
          </div>

          <div>
            <p className="font-semibold text-gray-900">Show Persistent Error:</p>
            <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const { addError } = useError();

addError("Critical error", "ERROR_CODE", "error");`}
            </pre>
          </div>

          <div>
            <p className="font-semibold text-gray-900">Handle API Error:</p>
            <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const { handleError } = useErrorHandler();

try {
  await fetchData();
} catch (error) {
  handleError(error, {
    showNotification: true,
    notificationDuration: 5000
  });
}`}
            </pre>
          </div>
        </CardBody>
      </Card>

      {/* Status Info */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <h2 className="text-lg font-bold">Current State</h2>
        </CardHeader>
        <CardBody className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">Active Notifications:</span>{" "}
            {notifications.length}
          </div>
          <div>
            <span className="font-semibold">Active Errors:</span> {errors.length}
          </div>
          <div>
            <span className="font-semibold">Demo Counter:</span> {count}
          </div>
          <Button
            onClick={() => setCount(count + 1)}
            variant="secondary"
            className="w-full mt-4"
          >
            Increment Counter ({count})
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
