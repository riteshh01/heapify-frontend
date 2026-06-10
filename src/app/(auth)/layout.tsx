"use client";

/**
 * Auth Route Group Layout
 * Wraps all auth pages (login, signup, password reset, etc.)
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030303] text-[#ededed] font-sans relative overflow-hidden selection:bg-emerald-500/30 selection:text-white antialiased">
      
      {/* Premium Ambient Glow Effect - Centralized for all Auth Pages */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent blur-[120px] pointer-events-none" />

      {/* FIX: Yahan se 'flex' aur 'items-center' hata diya hai aur 'max-w-[420px]' laga diya hai */}
      <div className="relative z-10 w-full max-w-[420px] px-4 sm:px-0">
        {children}
      </div>

    </div>
  );
}