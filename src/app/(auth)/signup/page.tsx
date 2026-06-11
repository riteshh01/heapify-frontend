"use client";

import { useState, useContext, FormEvent } from "react";
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

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!name || !email || !password) {
        notifyFn("Please fill all fields", { type: "error" });
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e2e8f0] dark:bg-[#0a0f1a] text-[#333] dark:text-[#e2e8f0] font-sans relative overflow-hidden transition-colors duration-300">
      
      <div className="relative z-10 w-full max-w-[420px] px-6">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="h-10 w-10 mb-4 rounded bg-[#3b5998] dark:bg-[#2563eb] flex items-center justify-center font-bold text-white text-lg tracking-tighter shadow-sm">
            H
          </div>
          <h2 className="text-2xl font-bold text-[#1e293b] dark:text-[#f8fafc] tracking-tight text-center">
            Create an account
          </h2>
          <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mt-2">
            Start your technical journey today.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl shadow-sm overflow-hidden p-8 transition-colors duration-300">
          <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#475569] dark:text-[#cbd5e1]">Full Name</label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="e.g. Ritesh Patel"
                className="w-full bg-[#f8fafc] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded px-4 py-2.5 text-sm text-[#333] dark:text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#3b5998] dark:focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#3b5998] dark:focus:ring-[#7dd3fc] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#475569] dark:text-[#cbd5e1]">Email Address</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="user@example.com"
                className="w-full bg-[#f8fafc] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded px-4 py-2.5 text-sm text-[#333] dark:text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#3b5998] dark:focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#3b5998] dark:focus:ring-[#7dd3fc] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#475569] dark:text-[#cbd5e1]">Password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
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
              className="mt-4 w-full flex h-11 items-center justify-center rounded bg-[#3b5998] hover:bg-[#2d4373] dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8] px-6 font-bold text-white text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#cbd5e1] dark:border-[#334155]"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-bold text-[#94a3b8] dark:text-[#64748b] uppercase">or</span>
              <div className="flex-grow border-t border-[#cbd5e1] dark:border-[#334155]"></div>
            </div>

            <button
              type="button"
              className="flex w-full h-11 items-center justify-center gap-2 rounded border border-[#cbd5e1] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#0f172a] hover:bg-[#e2e8f0] dark:hover:bg-[#1e3a5f] px-6 font-bold text-[#475569] dark:text-[#cbd5e1] text-sm transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#64748b] dark:text-[#94a3b8] mt-6 font-semibold">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#3b5998] dark:text-[#7dd3fc] font-bold hover:underline transition-colors ml-1"
          >
            Log in here
          </Link>
        </p>
      </div>

      <footer className="absolute bottom-6 text-[11px] font-semibold text-[#94a3b8] dark:text-[#64748b] text-center w-full">
        &copy; 2026 Heapify Labs. Secure & Encrypted.
      </footer>
    </div>
  );
}