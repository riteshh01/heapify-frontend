"use client";

import { useState, useContext, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: {
      id: string;
      email: string;
      name: string;
    };
    otpExpiry?: string;
    otpCooldown?: number;
    maskedEmail?: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is not available");
  }

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

  const {
    setIsLoggedIn,
    getUserData,
    setVerifyEmail,
    setUserEmail,
    setOtpExpiry,
    setOtpCooldown,
    setMaskedEmail,
  } = authContext;

  const [state, setState] = useState<"Sign In" | "Sign Up">("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle checkbox change for Remember Me
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    setShowToast(checked);
  };

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Handle form submission
  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate required fields
      if (!email || !password || (state === "Sign Up" && !name)) {
        notifyFn("Please fill all fields", { type: "error" });
        setLoading(false);
        return;
      }

      if (state === "Sign Up") {
        // Handle registration
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
            if (data.data.otpExpiry) {
              setOtpExpiry(data.data.otpExpiry);
            }
            if (data.data.otpCooldown) {
              setOtpCooldown(data.data.otpCooldown);
            }
            if (data.data.maskedEmail) {
              setMaskedEmail(data.data.maskedEmail);
            }
          }
          notifyFn("Registration successful! OTP sent to your email", {
            type: "success",
          });
          router.push("/email-verify");
        } else {
          notifyFn(data.message || "Registration failed", { type: "error" });
        }
      } else {
        // Handle login
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, rememberMe }),
        });

        const data: AuthResponse = await response.json();

        if (data.success) {
          setIsLoggedIn(true);
          notifyFn("Login successful! Welcome back", { type: "success" });
          await getUserData();
          router.push("/dashboard");
        } else {
          notifyFn(data.message || "Login failed", { type: "error" });
        }
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030303] text-[#ededed] font-sans relative overflow-hidden selection:bg-emerald-500/30 selection:text-white antialiased">
      
      {/* Premium Ambient Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Main Container / Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[420px] px-6">
        
        {/* Brand/Logo Area */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="h-10 w-10 mb-4 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-black text-lg tracking-tighter shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            H
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight text-center">
            {state === "Sign Up" ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-sm text-zinc-500 mt-2">
            {state === "Sign Up" ? "Start your technical journey today." : "Log in to your technical dashboard."}
          </p>
        </div>

        <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden p-8">
          <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
            
            {/* Full Name Field */}
            {state === "Sign Up" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Full Name
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="e.g. Ritesh Patel"
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Email Address
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="user@example.com"
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>

            {/* Password Strength Check for Sign Up */}
            {state === "Sign Up" && (
              <div className="text-[11px] text-zinc-500 border border-zinc-800/50 rounded-lg p-2.5 bg-zinc-900/30">
                Password must be at least 8 characters long
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center mt-1">
              {state !== "Sign Up" && (
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-zinc-700 bg-[#0a0a0a] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950 transition-all cursor-pointer accent-emerald-500"
                  />
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    Remember Me
                  </span>
                </label>
              )}

              {state === "Sign In" && (
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  Forgot Password?
                </Link>
              )}
            </div>

            {/* Toast Notification (Redesigned) */}
            {showToast && (
              <div className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[11px] p-2.5 rounded-lg text-center animate-fade-in flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                You will stay signed in for 30 days
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex h-11 items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 font-medium text-black text-sm transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : state}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-zinc-600">or</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="flex w-full h-11 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 px-6 font-medium text-zinc-300 hover:text-white text-sm transition-all backdrop-blur-sm"
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

        {/* Toggle Switch */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          {state === "Sign Up"
            ? "Already have an account?"
            : "New to Heapify?"}{" "}
          <button
            type="button"
            onClick={() => setState(state === "Sign Up" ? "Sign In" : "Sign Up")}
            className="text-emerald-500 font-medium cursor-pointer hover:text-emerald-400 hover:underline transition-colors ml-1"
          >
            {state === "Sign Up" ? "Log in here" : "Create account"}
          </button>
        </p>
      </div>

      {/* Minimal Footer */}
      <footer className="absolute bottom-6 text-[11px] text-zinc-600 text-center w-full">
        &copy; 2026 Heapify Labs. Secure & Encrypted.
      </footer>
    </div>
  );
}