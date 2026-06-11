"use client";

import { useState, useContext, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

interface VerifyResponse {
  success: boolean;
  message: string;
  data?: {
    user?: {
      id: string;
      email: string;
      name: string;
    };
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

export default function EmailVerifyPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

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

  const userEmail = authContext?.userEmail || "";
  const maskedEmail = authContext?.maskedEmail || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Handle cooldown timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  // Handle OTP verification
  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!otp || otp.length !== 6) {
        notifyFn("Please enter a valid 6-digit OTP", { type: "error" });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/verify-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: userEmail, otp }),
      });

      const data: VerifyResponse = await response.json();

      if (data.success) {
        notifyFn("Email verified successfully! Welcome to Heapify", {
          type: "success",
        });
        if (authContext?.setIsLoggedIn) {
          authContext.setIsLoggedIn(true);
        }
        router.push("/dashboard");
      } else {
        notifyFn(data.message || "Verification failed", { type: "error" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Verification failed";
      notifyFn(errorMessage, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    try {
      setResendLoading(true);

      const response = await fetch(`${API_BASE_URL}/resend-verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (data.success) {
        notifyFn("OTP resent successfully", { type: "success" });
        setOtpCooldown(60); // 60 second cooldown
      } else {
        notifyFn(data.message || "Failed to resend OTP", { type: "error" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resend OTP";
      notifyFn(errorMessage, { type: "error" });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl shadow-sm p-8 transition-colors duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-500/30 mb-4">
            <svg
              className="w-8 h-8 text-[#3b5998] dark:text-[#7dd3fc]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1e293b] dark:text-[#f8fafc] mb-2">Verify Your Email</h1>
          <p className="text-[#64748b] dark:text-[#94a3b8] text-sm">
            We've sent a verification code to <br />
            <span className="font-bold text-[#3b5998] dark:text-[#7dd3fc]">{maskedEmail}</span>
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#475569] dark:text-[#cbd5e1] mb-2">
              Enter 6-digit OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded text-[#333] dark:text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#3b5998] dark:focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#3b5998] dark:focus:ring-[#7dd3fc] text-center text-lg tracking-widest font-bold transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex h-11 items-center justify-center rounded bg-[#3b5998] hover:bg-[#2d4373] dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8] text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <p className="text-[#64748b] dark:text-[#94a3b8] text-sm mb-3 font-semibold">Didn't receive the code?</p>
          <button
            onClick={handleResendOtp}
            disabled={resendLoading || otpCooldown > 0}
            className="text-[#3b5998] dark:text-[#7dd3fc] hover:underline disabled:text-[#94a3b8] dark:disabled:text-[#64748b] disabled:cursor-not-allowed font-bold text-sm transition-colors"
          >
            {otpCooldown > 0
              ? `Resend in ${otpCooldown}s`
              : resendLoading
                ? "Resending..."
                : "Resend OTP"}
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-[#94a3b8] dark:text-[#64748b] text-xs mt-6 font-semibold">
        This code expires in 15 minutes
      </p>
    </div>
  );
}
