/**
 * Login Page
 * Example of using global error handling and notifications
 */

"use client";

import { FormEvent, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { notify } = useNotification();
  const { handleError } = useErrorHandler();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate inputs
      const newErrors: Record<string, string> = {};
      if (!email) newErrors.email = "Email is required";
      if (!password) newErrors.password = "Password is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        notify("Please fill in all fields", { type: "warning" });
        setIsLoading(false);
        return;
      }

      // TODO: Replace with actual API call
      // const response = await post<AuthSession>(AUTH_ENDPOINTS.LOGIN, {
      //   email,
      //   password,
      // });

      // Show success notification
      notify("Login successful! Welcome back.", {
        type: "success",
        duration: 2000,
      });

      // Uncomment after backend is ready:
      // const { user } = response;
      // setUser(user);
      // router.push("/dashboard");
    } catch (error) {
      // Use error handler for consistent error handling
      // Shows as toast notification (temporary)
      handleError(error, {
        showNotification: true,
        notificationDuration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardBody>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
        <p className="text-center mt-2 text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
