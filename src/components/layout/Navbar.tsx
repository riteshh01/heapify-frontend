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
  { label: "DSA Sheet", href: "/learning/dsa_sheet"}, // Added emoji placeholder based on your original code usage
  { label: "OS", href: "/learning/os"},
  { label: "CN", href: "/learning/networks"},
  { label: "DBMS", href: "/learning/dbms"},
  { label: "System Design", href: "/learning/system-design"},
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
    <header className="sticky top-0 z-50 w-full border-b border-[#cbd5e1] dark:border-[#1e3a5f] backdrop-blur-sm bg-[#f8fafc]/90 dark:bg-[#0f172a]/90 transition-colors duration-300">
      {/* Yahan par px-5 ko px-6 kiya gaya hai aur w-full add kiya gaya hai */}
      <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto w-full">

        {/* Logo */}
        <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0">
          <div className="h-7 w-7 rounded bg-[#3b5998] dark:bg-[#2563eb] flex items-center justify-center font-bold text-white text-sm tracking-tighter shadow-sm">
            H
          </div>
          <span className="font-bold text-sm tracking-tight text-[#3b5998] dark:text-[#7dd3fc]">Heapify.</span>
        </Link>

        {/* Subject Tabs — only when logged in (desktop) */}
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-1">
            {SUBJECT_LINKS.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold transition-all duration-150 ${isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-[#3b5998] dark:text-[#7dd3fc] border border-blue-200 dark:border-blue-500/30"
                    : "text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#334155]"
                    }`}
                >
                  <span>{link.emoji}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Public nav links — when NOT logged in */}
        {!isLoggedIn && (
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#475569] dark:text-[#cbd5e1]">
            <a href="/#features" className="hover:text-[#3b5998] dark:hover:text-[#7dd3fc] transition-colors">
              Features
            </a>
            <a href="/#courses" className="hover:text-[#3b5998] dark:hover:text-[#7dd3fc] transition-colors">
              Curriculum
            </a>
            <a href="/docs" className="hover:text-[#3b5998] dark:hover:text-[#7dd3fc] transition-colors">
              Docs
            </a>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#e2e8f0] dark:hover:bg-[#334155] transition-all shadow-sm"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <FiSun size={16} className="text-[#fbbf24]" />
            ) : (
              <FiMoon size={16} className="text-[#3b5998]" />
            )}
          </button>

          {isLoggedIn ? (
            <>
              {/* User avatar pill */}
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-2 text-xs font-bold text-[#64748b] dark:text-[#94a3b8] hover:text-[#3b5998] dark:hover:text-[#7dd3fc] transition-colors px-3 py-1.5 rounded hover:bg-[#e2e8f0] dark:hover:bg-[#334155]"
              >
                <span className="w-6 h-6 rounded-full bg-[#3b5998] dark:bg-[#2563eb] flex items-center justify-center text-white font-bold text-[10px]">
                  {authContext?.user?.name?.[0]?.toUpperCase() || "U"}
                </span>
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="text-xs font-bold bg-white dark:bg-[#1e293b] text-[#64748b] dark:text-[#94a3b8] hover:text-red-600 dark:hover:text-red-400 px-3.5 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-[#cbd5e1] dark:border-[#334155] hover:border-red-300 dark:hover:border-red-500/30 disabled:opacity-50 shadow-sm"
              >
                {isLoading ? "Signing out..." : "Sign out"}
              </button>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded text-[#475569] dark:text-[#cbd5e1] hover:text-[#3b5998] dark:hover:text-[#7dd3fc] hover:bg-[#e2e8f0] dark:hover:bg-[#334155] transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold bg-[#3b5998] dark:bg-[#2563eb] hover:bg-[#2d4373] dark:hover:bg-[#1d4ed8] text-white px-4 py-2 rounded transition-all shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile subject menu */}
      {isLoggedIn && mobileOpen && (
        <div className="md:hidden border-t border-[#cbd5e1] dark:border-[#1e3a5f] bg-[#f8fafc]/95 dark:bg-[#0f172a]/95 px-6 py-3 flex flex-col gap-1">
          {SUBJECT_LINKS.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded text-sm font-bold transition-all ${isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-[#3b5998] dark:text-[#7dd3fc]"
                  : "text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#334155]"
                  }`}
              >
                <span>{link.emoji}</span>
                {link.label}
              </Link>
            );
          })}
          <div className="border-t border-[#cbd5e1] dark:border-[#1e3a5f] pt-2 mt-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded text-sm font-bold text-[#64748b] dark:text-[#94a3b8] hover:text-[#3b5998] dark:hover:text-[#7dd3fc] hover:bg-[#e2e8f0] dark:hover:bg-[#334155] transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}