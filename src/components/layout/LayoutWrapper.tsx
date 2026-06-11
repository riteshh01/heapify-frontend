/**
 * Layout wrapper for authenticated dashboard pages
 * Provides consistent Navbar + content shell in the 2010s design system
 */

"use client";

import { Navbar } from "./Navbar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#e2e8f0] dark:bg-[#0a0f1a] text-[#333] dark:text-[#e2e8f0] transition-colors duration-300">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
