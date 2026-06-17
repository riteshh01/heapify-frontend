"use client";

import { useState, useContext, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    otpExpiry?: string;
    otpCooldown?: number;
    maskedEmail?: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

export default function SignUpPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is not available");
  }

  let notifyFn = (message: string, options?: any) => {
    console.warn("Notification not available, message:", message);
  };

  try {
    const { notify } = useNotification();
    notifyFn = notify;
  } catch (e) {
    console.error("NotificationContext not available:", e);
  }

  const {
    setVerifyEmail,
    setUserEmail,
    setOtpExpiry,
    setOtpCooldown,
    setMaskedEmail,
  } = authContext;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Live password validation checks
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[\W_]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  // Calculate dynamic score (0 to 4)
  const score = (hasMinLength ? 1 : 0) + ((hasUpper && hasLower) ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);

  // Circular progress calculations
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 4) * circumference;

  // Determine color based on score for the new theme
  let progressColor = "text-rose-500";
  if (score === 4) progressColor = "text-emerald-500";
  else if (score >= 2) progressColor = "text-amber-500";

  // Determine single requirement message to display
  let requirementMsg = "Strong password! ✓";
  if (!hasMinLength) requirementMsg = "Needs at least 8 characters";
  else if (!(hasUpper && hasLower)) requirementMsg = "Needs capital & small letters";
  else if (!hasNumber) requirementMsg = "Needs at least one number";
  else if (!hasSpecial) requirementMsg = "Needs a special character";

  const handleShowPassword = () => {
    setShowPassword(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setShowPassword(false);
    }, 1500);
  };

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!name || !email || !password) {
        notifyFn("Please fill all fields", { type: "error" });
        setLoading(false);
        return;
      }

      if (!isPasswordValid) {
        notifyFn("Please enter a valid password matching all criteria", { type: "error" });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        setUserEmail(email);
        setVerifyEmail(true);
        if (data.data) {
          if (data.data.otpExpiry) setOtpExpiry(data.data.otpExpiry);
          if (data.data.otpCooldown) setOtpCooldown(data.data.otpCooldown);
          if (data.data.maskedEmail) setMaskedEmail(data.data.maskedEmail);
        }
        notifyFn("Registration successful! OTP sent to your email", {
          type: "success",
        });
        router.push("/email-verify");
      } else {
        notifyFn(data.message || "Registration failed", { type: "error" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      notifyFn(errorMessage, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-4">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="h-10 w-10 mb-3 rounded-2xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center font-bold text-white text-xl tracking-tighter shadow-md">
          H
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight text-center">
          Create an account
        </h2>
        <p className="text-xs font-medium text-[#4a5568] dark:text-[#8b949e] mt-1">
          Start your technical journey today.
        </p>
      </div>

      {/* Solid Form Card */}
      <div className="bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-3xl shadow-sm overflow-hidden p-5 sm:p-7 transition-colors duration-300">
        <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
          
          {/* Full Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#4a5568] dark:text-[#8b949e] uppercase tracking-wider">
              Full Name
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="e.g. Ritesh Patel"
              className="w-full h-11 bg-[#f0f3f6] dark:bg-[#0d1117] border border-[#e2e8f0] dark:border-[#30363d] rounded-xl px-4 text-sm text-[#1a202c] dark:text-[#f0f6fc] placeholder:text-[#a0aec0] dark:placeholder:text-[#4b5563] focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#4a5568] dark:text-[#8b949e] uppercase tracking-wider">
              Email Address
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="user@example.com"
              className="w-full h-11 bg-[#f0f3f6] dark:bg-[#0d1117] border border-[#e2e8f0] dark:border-[#30363d] rounded-xl px-4 text-sm text-[#1a202c] dark:text-[#f0f6fc] placeholder:text-[#a0aec0] dark:placeholder:text-[#4b5563] focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#4a5568] dark:text-[#8b949e] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full h-11 bg-[#f0f3f6] dark:bg-[#0d1117] border border-[#e2e8f0] dark:border-[#30363d] rounded-xl pl-4 pr-12 text-sm text-[#1a202c] dark:text-[#f0f6fc] placeholder:text-[#a0aec0] dark:placeholder:text-[#4b5563] focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={handleShowPassword}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#a0aec0] dark:text-[#4b5563] hover:text-[#4a5568] dark:hover:text-[#8b949e] transition-colors focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Live Password Feedback Box */}
          <div className="flex items-center gap-2.5 text-[10px] font-semibold px-3 py-2.5 bg-[#f0f3f6] dark:bg-[#0d1117] border border-[#e2e8f0] dark:border-[#30363d] rounded-xl">
            <div className="relative flex items-center justify-center w-[18px] h-[18px] flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-[#e2e8f0] dark:text-[#30363d]" />
                <circle 
                  cx="12" cy="12" r={radius} 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  fill="transparent" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset} 
                  className={`${progressColor} transition-all duration-500 ease-out`} 
                />
              </svg>
            </div>
            <span className={`transition-colors duration-300 leading-tight ${score === 4 ? "text-emerald-600 dark:text-emerald-400" : "text-[#4a5568] dark:text-[#8b949e]"}`}>
              {password.length === 0 ? "Min 8 characters needed" : requirementMsg}
            </span>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading || (!isPasswordValid && password.length > 0)}
            className="mt-1 w-full flex h-11 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-6 font-bold text-white text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-[#e2e8f0] dark:border-[#30363d]"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-[#a0aec0] dark:text-[#4b5563] uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-[#e2e8f0] dark:border-[#30363d]"></div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            className="flex w-full h-11 items-center justify-center gap-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#30363d] bg-white dark:bg-[#21262d] hover:bg-[#eaf5ed] dark:hover:bg-[#30363d] hover:border-emerald-500 dark:hover:border-emerald-500 px-6 font-bold text-[#4a5568] dark:text-[#c9d1d9] text-[13px] transition-all shadow-sm active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
        </form>
      </div>

      {/* Login Link */}
      <p className="text-center text-[12px] text-[#4a5568] dark:text-[#8b949e] mt-5 font-medium">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors ml-1"
        >
          Log in here
        </Link>
      </p>

      {/* Footer */}
      <footer className="text-[10px] font-semibold text-[#718096] dark:text-[#8b949e] text-center w-full mt-6">
        &copy; 2026 Heapify Labs. Secure & Encrypted.
      </footer>
    </div>
  );
}