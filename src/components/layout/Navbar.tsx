"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { useTheme } from "@/context/ThemeContext";
// FiX ko add kiya gaya hai close button ke liye
import { FiSun, FiMoon, FiX } from "react-icons/fi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

const SUBJECT_LINKS = [
  { label: "Problems", href: "/dashboard" },
  { label: "Stats", href: "/stats" },
  { label: "DSA Sheet", href: "/learning/dsa_sheet" },
  // { label: "Git", href: "/learning/git" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const authContext = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, setTheme } = useTheme();

  // Scroll lock effect jab mobile menu open ho
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

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
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok || true) {
        if (authContext?.setIsLoggedIn) {
          authContext.setIsLoggedIn(false);
        }
        notifyFn("Logged out successfully", { type: "success" });
        router.push("/");
      }
    } catch (error) {
      notifyFn("Logout failed", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e2e8f0] dark:border-[#30363d] bg-[#f4fbf6] dark:bg-[#161b22] transition-colors duration-300">
      <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto w-full">

        {/* Logo */}
        <Link
          href={isLoggedIn ? "/dashboard" : "/"}
          className="group flex shrink-0 items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold tracking-tighter text-white shadow-md transition-transform duration-200 group-hover:scale-105 transform-gpu dark:bg-emerald-500">
            H
          </div>
          <span className="text-base font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
            Heapify.
          </span>
        </Link>

        {/* Navigation (Desktop) */}
        {isLoggedIn && (
          <nav className="hidden items-center gap-1.5 md:flex">
            {SUBJECT_LINKS.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${isActive
                    ? "border-emerald-200 bg-emerald-100 text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Public nav links — when NOT logged in (Desktop) - intentionally left empty */}
        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#30363d] bg-white dark:bg-[#21262d] hover:bg-[#eaf5ed] dark:hover:bg-[#30363d] transition-all shadow-sm active:scale-95"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <FiSun size={16} className="text-[#fbbf24]" />
            ) : (
              <FiMoon size={16} className="text-emerald-600" />
            )}
          </button>

          {isLoggedIn ? (
            <>
              {/* User avatar pill */}
              <Link
                href="/profile"
                className="hidden md:flex items-center gap-2.5 text-xs font-bold text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-[#eaf5ed] dark:hover:bg-[#21262d]"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-[11px] shadow-sm overflow-hidden">
                  {authContext?.user?.avatar_url ? (
                    <img src={authContext.user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    authContext?.user?.name?.[0]?.toUpperCase() || "U"
                  )}
                </span>
                Profile
              </Link>

              {/* Sign out button */}
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="hidden md:block text-xs font-bold bg-white dark:bg-[#21262d] text-[#4a5568] dark:text-[#8b949e] hover:text-rose-600 dark:hover:text-rose-400 px-4 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-[#e2e8f0] dark:border-[#30363d] hover:border-rose-200 dark:hover:border-rose-800/50 disabled:opacity-50 shadow-sm active:scale-95"
              >
                {isLoading ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden md:block text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger icon */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[#eaf5ed] dark:hover:bg-[#21262d] transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* --- Mobile Sidebar Navigation --- */}

      {/* Background Overlay (Clickable to close) */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 md:hidden ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sliding Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-[#161b22] z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Drawer Header & Cross Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] dark:border-[#30363d]">
          <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
            Menu
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-[#4a5568] dark:text-[#8b949e] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-95"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex flex-col gap-2 p-4 overflow-y-auto h-full">
          {isLoggedIn ? (
            <>
              {SUBJECT_LINKS.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 border
                      ${isActive
                        ? "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : "text-[#4a5568] dark:text-[#8b949e] hover:text-[#1a202c] dark:hover:text-[#c9d1d9] hover:bg-[#eaf5ed] dark:hover:bg-[#21262d] border-transparent"
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-[#e2e8f0] dark:border-[#30363d] pt-4 mt-2 flex flex-col gap-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[#f0f3f6] dark:hover:bg-[#21262d] transition-all"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoading}
                  className="text-left w-full px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                >
                  {isLoading ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Public mobile menu for non-logged-in users - intentionally left empty */}
              <div className="border-t border-[#e2e8f0] dark:border-[#30363d] pt-4 mt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-full text-sm font-bold bg-emerald-600 dark:bg-emerald-500 text-white px-4 py-3.5 rounded-xl shadow-md active:scale-95 transition-all">
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}