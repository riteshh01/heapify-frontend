"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();

  let notifyFn = (message: string, options?: any) => {
    console.warn("Notification not available:", message);
  };

  try {
    const { notify } = useNotification();
    notifyFn = notify;
  } catch (e) {
    console.error("NotificationContext not available:", e);
  }

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // OTP State
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Handle OTP Input Change
  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); 
    if (!value && e.target.value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP Backspace & Navigation keys
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      notifyFn("Please enter your email", { type: "error" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/send-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        notifyFn("Reset code sent to your email", { type: "success" });
        setStep(2);
        setOtpCooldown(60);
      } else {
        notifyFn(data.message || "Failed to send reset code", { type: "error" });
      }
    } catch (error) {
      notifyFn("Failed to send reset code", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      notifyFn("Please enter a valid 6-digit OTP", { type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      notifyFn("Password must be at least 6 characters long", { type: "error" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp: otpString, newPassword }),
      });

      const data = await response.json();
      if (data.success) {
        notifyFn("Password reset successful! You can now log in.", { type: "success" });
        router.push("/login");
      } else {
        notifyFn(data.message || "Failed to reset password", { type: "error" });
      }
    } catch (error) {
      notifyFn("Failed to reset password", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      const response = await fetch(`${API_BASE_URL}/send-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        notifyFn("OTP resent successfully", { type: "success" });
        setOtpCooldown(60);
      } else {
        notifyFn(data.message || "Failed to resend OTP", { type: "error" });
      }
    } catch (error) {
      notifyFn("Failed to resend OTP", { type: "error" });
    } finally {
      setResendLoading(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="w-full pb-4">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="h-10 w-10 mb-3 rounded-2xl bg-emerald-500 flex items-center justify-center font-bold text-white shadow-md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight text-center">
          Reset Password
        </h2>
        <p className="text-xs font-medium text-[#4a5568] dark:text-[#8b949e] mt-1 text-center leading-relaxed">
          {step === 1 
            ? "Enter your email to receive a password reset link." 
            : `We've sent a verification code to ${email}`}
        </p>
      </div>

      {/* Solid Form Card */}
      <div className="bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-3xl shadow-sm overflow-hidden p-5 sm:p-7 transition-colors duration-300">
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
            <div>
              <label className="text-[11px] font-bold text-[#4a5568] dark:text-[#8b949e] uppercase tracking-wider mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0aec0] dark:text-[#64748b]" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 pl-10 pr-4 bg-[#f4fcf7] dark:bg-[#0d1117] border border-[#d1e8d8] dark:border-[#30363d] rounded-xl text-sm font-semibold text-[#1a202c] dark:text-[#f0f6fc] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-[#a0aec0] dark:placeholder:text-[#4b5563]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className={`w-full flex h-11 items-center justify-center gap-2 rounded-xl px-6 font-bold text-white text-sm transition-all shadow-md active:scale-[0.98] 
                ${email && !loading
                  ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400" 
                  : "bg-emerald-400/60 dark:bg-emerald-600/40 cursor-not-allowed opacity-80"
                }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
              {!loading && <FiArrowRight size={16} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
            
            {/* OTP Multi-box Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#4a5568] dark:text-[#8b949e] uppercase tracking-wider text-center mb-1">
                Enter 6-digit OTP
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 bg-[#f0f3f6] dark:bg-[#0d1117] border border-[#e2e8f0] dark:border-[#30363d] rounded-xl text-center text-xl sm:text-2xl font-bold text-[#1a202c] dark:text-[#f0f6fc] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                  />
                ))}
              </div>
            </div>

            {/* New Password Input */}
            <div>
              <label className="text-[11px] font-bold text-[#4a5568] dark:text-[#8b949e] uppercase tracking-wider mb-1 block">
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0aec0] dark:text-[#64748b]" size={16} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full h-11 pl-10 pr-4 bg-[#f4fcf7] dark:bg-[#0d1117] border border-[#d1e8d8] dark:border-[#30363d] rounded-xl text-sm font-semibold text-[#1a202c] dark:text-[#f0f6fc] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-[#a0aec0] dark:placeholder:text-[#4b5563]"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isOtpComplete || newPassword.length < 6}
              className={`w-full flex h-11 items-center justify-center rounded-xl px-6 font-bold text-white text-sm transition-all shadow-md active:scale-[0.98] 
                ${isOtpComplete && newPassword.length >= 6 && !loading
                  ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400" 
                  : "bg-emerald-400/60 dark:bg-emerald-600/40 cursor-not-allowed opacity-80"
                }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="mt-5 text-center flex flex-col items-center gap-1">
            <p className="text-[11px] font-semibold text-[#4a5568] dark:text-[#8b949e]">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={resendLoading || otpCooldown > 0}
              className="text-[12px] font-bold text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:underline transition-colors disabled:text-[#a0aec0] dark:disabled:text-[#4b5563] disabled:cursor-not-allowed disabled:no-underline"
            >
              {otpCooldown > 0
                ? `Resend in ${otpCooldown}s`
                : resendLoading
                  ? "Resending..."
                  : "Resend OTP"}
            </button>
          </div>
        )}
      </div>

      {/* Footer Links */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-xs font-bold text-[#4a5568] dark:text-[#8b949e] hover:text-[#1a202c] dark:hover:text-[#f0f6fc] transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}