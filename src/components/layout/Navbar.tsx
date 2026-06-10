"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export function Navbar() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

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

  const isLoggedIn = authContext?.isLoggedIn || false;

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        if (authContext?.setIsLoggedIn) {
          authContext.setIsLoggedIn(false);
        }
        notifyFn("Logged out successfully", { type: "success" });
        router.push("/login");
      }
    } catch (error) {
      notifyFn("Logout failed", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl w-full mx-auto border-b border-white/[0.05] backdrop-blur-md bg-[#030303]/70">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-black text-xs tracking-tighter">
          H
        </div>
        <span className="font-semibold text-sm tracking-tight text-white">Creepify.</span>
      </Link>

      {/* Navigation Links - Desktop */}
      <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
        <a href="/#features" className="hover:text-white transition-colors">
          Features
        </a>
        <a href="/#courses" className="hover:text-white transition-colors">
          Curriculum
        </a>
        <a href="/docs" className="hover:text-white transition-colors">
          Docs
        </a>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <Link
              href="/dashboard"
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="text-xs font-medium bg-red-600/20 text-red-400 px-4 py-2 rounded-full hover:bg-red-600/30 transition-all border border-red-600/20 disabled:opacity-50"
            >
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-xs font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-all shadow-[0_1px_15px_rgba(255,255,255,0.1)]"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
