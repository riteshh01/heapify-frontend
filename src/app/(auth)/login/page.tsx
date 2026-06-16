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
const GOOGLE_OAUTH_URL = `${API_BASE_URL}/google`;

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
    // Navigate the full browser window to the backend OAuth initiation URL.
    // The backend issues a redirect to Google — this cannot be done with fetch.
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
    <div className="w-full">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="h-10 w-10 mb-4 rounded bg-[#3b5998] dark:bg-[#2563eb] flex items-center justify-center font-bold text-white text-lg tracking-tighter shadow-sm">
            H
          </div>
          <h2 className="text-2xl font-bold text-[#1e293b] dark:text-[#f8fafc] tracking-tight text-center">
            Welcome back
          </h2>
          <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mt-2">
            Log in to your technical dashboard.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl shadow-sm overflow-hidden p-8 transition-colors duration-300">
          <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
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

            <div className="flex justify-between items-center mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#0f172a] text-[#3b5998] focus:ring-[#3b5998] transition-all cursor-pointer accent-[#3b5998]"
                />
                <span className="text-xs font-semibold text-[#64748b] dark:text-[#94a3b8] group-hover:text-[#334155] dark:group-hover:text-[#cbd5e1] transition-colors">
                  Remember Me
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#3b5998] dark:text-[#7dd3fc] hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {showToast && (
              <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-[#3b5998] dark:text-[#7dd3fc] text-[11px] p-2.5 rounded text-center flex items-center justify-center gap-2 font-semibold">
                You will stay signed in for 30 days
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex h-11 items-center justify-center rounded bg-[#3b5998] hover:bg-[#2d4373] dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8] px-6 font-bold text-white text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Sign In"}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#cbd5e1] dark:border-[#334155]"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-bold text-[#94a3b8] dark:text-[#64748b] uppercase">or</span>
              <div className="flex-grow border-t border-[#cbd5e1] dark:border-[#334155]"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="flex w-full h-11 items-center justify-center gap-2 rounded border border-[#cbd5e1] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#0f172a] hover:bg-[#e2e8f0] dark:hover:bg-[#1e3a5f] px-6 font-bold text-[#475569] dark:text-[#cbd5e1] text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#64748b] dark:text-[#94a3b8] mt-6 font-semibold">
          New to Heapify?{" "}
          <Link
            href="/signup"
            className="text-[#3b5998] dark:text-[#7dd3fc] font-bold hover:underline transition-colors ml-1"
          >
            Create account
          </Link>
        </p>

        <footer className="text-[11px] font-semibold text-[#94a3b8] dark:text-[#64748b] text-center w-full mt-8">
          &copy; 2026 Heapify Labs. Secure & Encrypted.
        </footer>
    </div>
  );
}