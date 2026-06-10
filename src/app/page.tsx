import Image from "next/image";
import { 
  Code2, 
  Network, 
  Database, 
  Cpu, 
  Globe, 
  TrendingUp 
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#030303] text-[#ededed] font-sans selection:bg-emerald-500/30 selection:text-white overflow-x-hidden antialiased">
      
      {/* Premium Ambient Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Header / Navbar section */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl w-full mx-auto border-b border-white/[0.05] backdrop-blur-md bg-[#030303]/70">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-black text-xs tracking-tighter">
            H
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">heapify.</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#curriculum" className="hover:text-white transition-colors">Curriculum</a>
          <a href="#" className="hover:text-white transition-colors">Community</a>
        </nav>
        <div>
          <a 
            href="/login" 
            className="text-xs font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-all shadow-[0_1px_15px_rgba(255,255,255,0.1)]"
          >
            Sign In
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto text-center pt-24 pb-20 relative z-10">
        
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[11px] font-medium tracking-wide mb-8 animate-fade-in">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          FAANG Prep Ecosystem Active
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
          Master your Software Engineering Interviews.
        </h1>

        {/* Hero Sub-headline */}
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-10 font-normal">
          The premium platform to master computer science fundamentals. Conquer DSA, architect scalable systems, and optimize full-stack applications in a distraction-free environment.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto justify-center">
          <a
            href="/signup"
            className="flex h-11 items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 font-medium text-black text-sm transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:scale-[1.02] w-full sm:w-auto"
          >
            Get Started Instantly
          </a>
          <a
            href="#curriculum"
            className="flex h-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 px-6 font-medium text-zinc-300 hover:text-white text-sm transition-all w-full sm:w-auto backdrop-blur-sm"
          >
            Explore Curriculum
          </a>
        </div>

        {/* Curriculum Grid Presentation */}
        <div id="curriculum" className="w-full text-left border-t border-zinc-900 pt-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Complete Curriculum</h2>
            <p className="text-sm text-zinc-500">Everything you need to crack top-tier tech interviews.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="group p-6 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm hover:border-zinc-800 transition-all">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">DSA Mastery</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                500+ curated problems organized by patterns. Track curated sheets seamlessly with your profile.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm hover:border-zinc-800 transition-all">
              <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                <Network className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">System Design</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Learn to architect scalable, distributed systems from scratch with real-world case studies.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm hover:border-zinc-800 transition-all">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">Database Concepts</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Master SQL, NoSQL, indexing, and transaction fundamentals essential for backend engineering.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm hover:border-zinc-800 transition-all">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">Operating Systems</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Deep dive into processes, threads, concurrency, and memory management at a granular level.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm hover:border-zinc-800 transition-all">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">Computer Networks</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Understand the OSI model, TCP/IP, DNS, and modern web protocols running the internet.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm hover:border-zinc-800 transition-all">
              <div className="h-10 w-10 rounded-lg bg-zinc-500/10 border border-zinc-700 flex items-center justify-center text-zinc-400 mb-4">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-zinc-300 transition-colors">Progress Tracking</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Advanced telemetry and analytics to track your learning journey and identify weak spots.
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Footer minimal section */}
      <footer className="border-t border-zinc-950 bg-black/40 py-8 px-6 text-center text-xs text-zinc-600 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 Heapify Labs. Crafted for technical excellence.</div>
          <div className="flex gap-6 text-zinc-500">
            <a href="#" className="hover:text-zinc-400">Terms</a>
            <a href="#" className="hover:text-zinc-400">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}