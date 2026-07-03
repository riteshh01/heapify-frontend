"use client";

import { useState, useContext, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";

interface AuthResponse {
  success: boolean;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

// OAuth: use relative path so the request goes through the Next.js proxy.
// This ensures cookies set during the OAuth callback are first-party on the
// frontend domain rather than third-party on the backend domain.
const GOOGLE_OAUTH_URL = "/api/auth/google";


export default function LoginPage() {
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

  const { setIsLoggedIn, getUserData } = authContext;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    window.location.href = GOOGLE_OAUTH_URL;
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    setShowToast(checked);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!email || !password) {
        notifyFn("Please fill all fields", { type: "error" });
        setLoading(false);
        return;
      }

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
            Welcome back
          </h2>
          <p className="text-xs font-medium text-[#4a5568] dark:text-[#8b949e] mt-1">
            Log in to your technical dashboard.
          </p>
        </div>

        {/* Solid Form Card */}
        <div className="bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-3xl shadow-sm overflow-hidden p-5 sm:p-7 transition-colors duration-300">
          <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
            
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
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="••••••••"
                className="w-full h-11 bg-[#f0f3f6] dark:bg-[#0d1117] border border-[#e2e8f0] dark:border-[#30363d] rounded-xl px-4 text-sm text-[#1a202c] dark:text-[#f0f6fc] placeholder:text-[#a0aec0] dark:placeholder:text-[#4b5563] focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleCheckboxChange}
                  className="w-3.5 h-3.5 rounded border-[#e2e8f0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer accent-emerald-600"
                />
                <span className="text-[11px] font-semibold text-[#4a5568] dark:text-[#8b949e] group-hover:text-[#1a202c] dark:group-hover:text-[#c9d1d9] transition-colors">
                  Remember Me
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Green Toast Notification */}
            {showToast && (
              <div className="border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] p-2 rounded-lg text-center flex items-center justify-center gap-2 font-semibold animate-in fade-in zoom-in duration-200">
                You will stay signed in for 30 days
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full flex h-11 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-6 font-bold text-white text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? "Processing..." : "Sign In"}
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
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="flex w-full h-11 items-center justify-center gap-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#30363d] bg-white dark:bg-[#21262d] hover:bg-[#eaf5ed] dark:hover:bg-[#30363d] hover:border-emerald-500 dark:hover:border-emerald-500 px-6 font-bold text-[#4a5568] dark:text-[#c9d1d9] text-[13px] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </button>
          </form>
        </div>

        {/* Signup Link */}
        <p className="text-center text-[12px] text-[#4a5568] dark:text-[#8b949e] mt-5 font-medium">
          New to Heapify?{" "}
          <Link
            href="/signup"
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors ml-1"
          >
            Create account
          </Link>
        </p>

        {/* Footer */}
        <footer className="text-[10px] font-semibold text-[#718096] dark:text-[#8b949e] text-center w-full mt-6">
          &copy; 2026 Heapify Labs. Secure & Encrypted.
        </footer>
    </div>
  );
}