"use client";

import { useState, useContext, useEffect, useRef, FormEvent } from "react";
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

  // 6 boxes ke liye array state aur refs
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

  // Handle Input Change for specific box
  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Sirf numbers allow karega
    if (!value && e.target.value !== "") return;

    const newOtp = [...otp];
    // Agar multiple characters (e.g. typing fast), toh last char lega
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Agle box par focus move karo agar value dali hai aur last box nahi hai
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace & Navigation keys
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Agar current box khali hai aur backspace dabaya, toh pichle box pe jao
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      } else {
        // Current box ki value clear karo
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

  // Handle Paste event so user can copy-paste whole 6 digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      // Focus on the next empty box or the last box
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  // Final submit handler
  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    try {
      setLoading(true);

      if (otpString.length !== 6) {
        notifyFn("Please enter a valid 6-digit OTP", { type: "error" });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/verify-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: userEmail, otp: otpString }),
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

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="w-full pb-4">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="h-10 w-10 mb-3 rounded-2xl bg-emerald-500 dark:bg-emerald-500 flex items-center justify-center font-bold text-white shadow-md">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight text-center">
          Verify Your Email
        </h2>
        <p className="text-xs font-medium text-[#4a5568] dark:text-[#8b949e] mt-1 text-center leading-relaxed">
          We've sent a verification code to <br />
          <span className="font-bold text-emerald-500 dark:text-emerald-400">{maskedEmail}</span>
        </p>
      </div>

      {/* Solid Form Card */}
      <div className="bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-3xl shadow-sm overflow-hidden p-5 sm:p-7 transition-colors duration-300">
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
          
          {/* OTP Multi-box Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#4a5568] dark:text-[#8b949e] uppercase tracking-wider text-center mb-1">
              Enter 6-digit OTP
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 bg-[#f0f3f6] dark:bg-[#0d1117] border border-[#e2e8f0] dark:border-[#30363d] rounded-xl text-center text-xl sm:text-2xl font-bold text-[#1a202c] dark:text-[#f0f6fc] focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                />
              ))}
            </div>
          </div>

          {/* Submit Button (Bright Green) */}
          <button
            type="submit"
            disabled={loading || !isOtpComplete}
            className={`w-full flex h-12 items-center justify-center rounded-xl px-6 font-bold text-white text-sm transition-all shadow-md active:scale-[0.98] 
              ${isOtpComplete && !loading
                ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400" 
                : "bg-emerald-400/60 dark:bg-emerald-600/40 cursor-not-allowed opacity-80"
              }`}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend OTP */}
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
      </div>

      {/* Footer Note */}
      <footer className="text-[10px] font-semibold text-[#718096] dark:text-[#8b949e] text-center w-full mt-6">
        This code expires in 15 minutes
      </footer>
    </div>
  );
}