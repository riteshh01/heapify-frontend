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

  const handleCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  };

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
    <div className="w-full">

      {/* Brand/Logo Area */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="h-10 w-10 mb-4 rounded bg-[#3b5998] dark:bg-[#2563eb] flex items-center justify-center font-bold text-white text-lg tracking-tighter shadow-sm">
          H
        </div>
        <h2 className="text-2xl font-bold text-[#1e293b] dark:text-[#f8fafc] tracking-tight text-center">
          Reset Password
        </h2>
        <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mt-2 text-center">
          {step === "email" && "Enter your email to receive a reset code"}
          {step === "otp" && "Enter the OTP sent to your email"}
          {step === "password" && "Create a new strong password"}
        </p>
      </div>

      <div className="bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl shadow-sm overflow-hidden p-8 transition-colors duration-300">
        
        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleSendResetOtp} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#475569] dark:text-[#cbd5e1]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-[#f8fafc] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded px-4 py-2.5 text-sm text-[#333] dark:text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#3b5998] dark:focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#3b5998] dark:focus:ring-[#7dd3fc] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex h-11 items-center justify-center rounded bg-[#3b5998] hover:bg-[#2d4373] dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8] px-6 font-bold text-white text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#475569] dark:text-[#cbd5e1]">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full bg-[#f8fafc] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded px-4 py-3 text-[#333] dark:text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#3b5998] dark:focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#3b5998] dark:focus:ring-[#7dd3fc] transition-all text-center text-lg tracking-[0.5em] font-bold"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex h-11 items-center justify-center rounded bg-[#3b5998] hover:bg-[#2d4373] dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8] px-6 font-bold text-white text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                disabled={resendCooldown > 0}
                className="text-xs font-bold text-[#3b5998] dark:text-[#7dd3fc] hover:underline disabled:text-[#94a3b8] dark:disabled:text-[#64748b] disabled:cursor-not-allowed transition-colors text-center w-full"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive it? Resend"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === "password" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#475569] dark:text-[#cbd5e1]">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#f8fafc] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded px-4 py-2.5 text-sm text-[#333] dark:text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#3b5998] dark:focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#3b5998] dark:focus:ring-[#7dd3fc] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#475569] dark:text-[#cbd5e1]">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#f8fafc] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded px-4 py-2.5 text-sm text-[#333] dark:text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#3b5998] dark:focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#3b5998] dark:focus:ring-[#7dd3fc] transition-all"
              />
            </div>

            <div className="text-[11px] font-semibold text-[#64748b] dark:text-[#94a3b8] border border-[#cbd5e1] dark:border-[#334155] rounded p-2.5 bg-[#f8fafc] dark:bg-[#0f172a]">
              Password must be at least 8 characters long
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex h-11 items-center justify-center rounded bg-[#3b5998] hover:bg-[#2d4373] dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8] px-6 font-bold text-white text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Set New Password"}
            </button>
          </form>
        )}
      </div>

      {/* Back to Login Link */}
      <p className="text-center text-xs text-[#64748b] dark:text-[#94a3b8] mt-6 font-semibold">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-[#3b5998] dark:text-[#7dd3fc] font-bold hover:underline transition-colors ml-1"
        >
          Log in here
        </Link>
      </p>

      {/* Minimal Footer */}
      <footer className="text-[11px] font-semibold text-[#94a3b8] dark:text-[#64748b] text-center w-full mt-8">
        &copy; 2026 Heapify Labs. Secure & Encrypted.
      </footer>
    </div>
  );
}