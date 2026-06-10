"use client";

export function Footer() {
  return (
    <footer className="border-t border-zinc-950 bg-black/40 py-8 px-6 text-center text-xs text-zinc-600 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>&copy; 2026 Heapify Labs. Crafted for technical excellence.</div>
        <div className="flex gap-6 text-zinc-500">
          <a href="#terms" className="hover:text-zinc-400 transition-colors">
            Terms
          </a>
          <a href="#privacy" className="hover:text-zinc-400 transition-colors">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
