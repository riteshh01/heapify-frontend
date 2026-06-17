"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { useTheme } from "@/context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

const SUBJECT_LINKS = [
  { label: "DSA Sheet", href: "/learning/dsa_sheet" },
  { label: "OS", href: "/learning/os" },
  { label: "CN", href: "/learning/networks" },
  { label: "DBMS", href: "/learning/dbms" },
  { label: "System Design", href: "/learning/system-design" },
  { label: "Git", href: "/learning/git" }, 
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const authContext = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, setTheme } = useTheme();

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
        router.push("/login");
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
    <header className="sticky top-0 z-50 w-full border-b border-[#e2e8f0] dark:border-[#30363d] bg-[#f4fbf6] dark:bg-[#161b22] transition-colors duration-300">
      <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto w-full">

        {/* Solid Green Logo */}
        <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0 group">
          <div className="h-8 w-8 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center font-bold text-white text-sm tracking-tighter shadow-md group-hover:scale-105 transition-transform">
            H
          </div>
          <span className="font-bold text-base tracking-tight text-emerald-700 dark:text-emerald-400">
            Heapify.
          </span>
        </Link>

        {/* Subject Tabs — only when logged in (desktop) */}
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-1.5">
            {SUBJECT_LINKS.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${isActive
                    ? "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-sm"
                    : "text-[#4a5568] dark:text-[#8b949e] hover:text-[#1a202c] dark:hover:text-[#c9d1d9] hover:bg-[#eaf5ed] dark:hover:bg-[#21262d]"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Public nav links — when NOT logged in (desktop) */}
        {!isLoggedIn && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-[#4a5568] dark:text-[#8b949e]">
            <Link href="/#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Features
            </Link>
            <Link href="/#courses" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Curriculum
            </Link>
            <Link href="/docs" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Docs
            </Link>
          </nav>
        )}

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
                href="/dashboard"
                className="hidden md:flex items-center gap-2.5 text-xs font-bold text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-[#eaf5ed] dark:hover:bg-[#21262d]"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-[11px] shadow-sm">
                  {authContext?.user?.name?.[0]?.toUpperCase() || "U"}
                </span>
                Dashboard
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
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[#eaf5ed] dark:hover:bg-[#21262d] transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile subject menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e2e8f0] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-6 py-4 flex flex-col gap-2 shadow-md">
          {isLoggedIn ? (
            <>
              {SUBJECT_LINKS.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30"
                      : "text-[#4a5568] dark:text-[#8b949e] hover:text-[#1a202c] dark:hover:text-[#c9d1d9] hover:bg-[#f0f3f6] dark:hover:bg-[#21262d]"
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-[#e2e8f0] dark:border-[#30363d] pt-3 mt-2 flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[#f0f3f6] dark:hover:bg-[#21262d] transition-all"
                >
                  Dashboard
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
            <>
              {/* Public mobile menu for non-logged-in users */}
              <Link href="/#features" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-bold text-[#4a5568] dark:text-[#8b949e] hover:bg-[#f0f3f6] dark:hover:bg-[#21262d] rounded-xl">Features</Link>
              <Link href="/#courses" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-bold text-[#4a5568] dark:text-[#8b949e] hover:bg-[#f0f3f6] dark:hover:bg-[#21262d] rounded-xl">Curriculum</Link>
              <Link href="/docs" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-bold text-[#4a5568] dark:text-[#8b949e] hover:bg-[#f0f3f6] dark:hover:bg-[#21262d] rounded-xl">Docs</Link>
              <div className="border-t border-[#e2e8f0] dark:border-[#30363d] pt-4 mt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-center w-full text-sm font-bold bg-emerald-600 dark:bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-md active:scale-95 transition-all">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}