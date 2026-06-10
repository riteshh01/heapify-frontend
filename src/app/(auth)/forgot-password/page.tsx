"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";

interface ResetResponse {
  success: boolean;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Wrap notify in a try-catch to handle context availability
  let notifyFn = (message: string, options?: any) => {
    console.warn("Notification not available, message:", message);
  };

  try {
    const { notify } = useNotification();
    notifyFn = notify;
  } catch (e) {
    console.error("NotificationContext not available:", e);
  }

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle cooldown timer
  const handleCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  };

  // Step 1: Send reset OTP
  const handleSendResetOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!email) {
        notifyFn("Please enter your email", { type: "error" });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/send-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data: ResetResponse = await response.json();

      if (data.success) {
        notifyFn("Reset OTP sent to your email", { type: "success" });
        setStep("otp");
        handleCooldown();
      } else {
        notifyFn(data.message || "Failed to send reset OTP", { type: "error" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      notifyFn(errorMessage, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!otp || otp.length !== 6) {
        notifyFn("Please enter a valid 6-digit OTP", { type: "error" });
        setLoading(false);
        return;
      }

      setStep("password");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      notifyFn(errorMessage, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!newPassword || !confirmPassword) {
        notifyFn("Please fill in all password fields", { type: "error" });
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        notifyFn("Passwords do not match", { type: "error" });
        setLoading(false);
        return;
      }

      if (newPassword.length < 8) {
        notifyFn("Password must be at least 8 characters", { type: "error" });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data: ResetResponse = await response.json();

      if (data.success) {
        notifyFn("Password reset successfully! Redirecting to login...", {
          type: "success",
        });
        setTimeout(() => router.push("/login"), 2000);
      } else {
        notifyFn(data.message || "Password reset failed", { type: "error" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      notifyFn(errorMessage, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-400 text-sm">
              {step === "email" && "Enter your email to receive a reset code"}
              {step === "otp" && "Enter the OTP sent to your email"}
              {step === "password" && "Create a new password"}
            </p>
          </div>

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendResetOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-center text-lg tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                disabled={resendCooldown > 0}
                className="w-full text-emerald-400 hover:text-emerald-300 disabled:text-slate-500 disabled:cursor-not-allowed font-medium text-sm"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
