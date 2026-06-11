"use client";

export function Footer() {
  return (
    <footer className="border-t border-[#cbd5e1] dark:border-[#1e3a5f] bg-[#f8fafc] dark:bg-[#0f172a] py-8 text-center text-xs text-[#64748b] dark:text-[#94a3b8] mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-semibold">&copy; 2026 Heapify Labs. Crafted for technical excellence.</div>
        <div className="flex gap-6 text-[#475569] dark:text-[#cbd5e1] font-semibold">
          <a href="#terms" className="hover:text-[#3b5998] dark:hover:text-[#7dd3fc] transition-colors">
            Terms
          </a>
          <a href="#privacy" className="hover:text-[#3b5998] dark:hover:text-[#7dd3fc] transition-colors">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
