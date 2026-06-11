"use client";

/**
 * Auth Route Group Layout — 2010s design system
 * Wraps all auth pages (login, signup, password reset, etc.)
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e2e8f0] dark:bg-[#0a0f1a] text-[#333] dark:text-[#e2e8f0] font-sans relative overflow-hidden transition-colors duration-300">
      <div className="relative z-10 w-full max-w-[420px] px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
}