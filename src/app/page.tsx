import { 
  Code2, 
  Network, 
  Database, 
  Cpu, 
  Globe, 
  TrendingUp 
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#e2e8f0] dark:bg-[#0a0f1a] text-[#333] dark:text-[#e2e8f0] font-sans transition-colors duration-300">
      
      {/* Shared Navbar — includes theme toggle and consistent spacing */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto text-center pt-24 pb-20">
        
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 dark:bg-[#1e293b] border border-blue-200 dark:border-[#334155] text-[#3b5998] dark:text-[#7dd3fc] text-xs font-bold tracking-wide mb-8 shadow-inner">
          FAANG Prep Ecosystem Active
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1e293b] dark:text-[#f8fafc] max-w-4xl leading-[1.1] mb-6">
          Master your Software Engineering Interviews.
        </h1>

        {/* Hero Sub-headline */}
        <p className="text-[#64748b] dark:text-[#94a3b8] text-base sm:text-lg max-w-2xl leading-relaxed mb-10 font-normal">
          The premium platform to master computer science fundamentals. Conquer DSA, architect scalable systems, and optimize full-stack applications in a distraction-free environment.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto justify-center">
          <a
            href="/signup"
            className="flex h-11 items-center justify-center rounded bg-[#3b5998] hover:bg-[#2d4373] dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8] px-6 font-bold text-white text-sm transition-all shadow-sm w-full sm:w-auto"
          >
            Get Started Instantly
          </a>
          <a
            href="#curriculum"
            className="flex h-11 items-center justify-center rounded border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f1f5f9] dark:hover:bg-[#0f172a] px-6 font-bold text-[#475569] dark:text-[#cbd5e1] hover:text-[#3b5998] dark:hover:text-[#7dd3fc] text-sm transition-all w-full sm:w-auto shadow-sm"
          >
            Explore Curriculum
          </a>
        </div>

        {/* Curriculum Grid Presentation */}
        <div id="curriculum" className="w-full text-left border-t border-[#cbd5e1] dark:border-[#1e3a5f] pt-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-[#1e293b] dark:text-[#f8fafc] mb-2">Complete Curriculum</h2>
            <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">Everything you need to crack top-tier tech interviews.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="group p-6 rounded-xl bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="h-10 w-10 rounded bg-[#e2e8f0] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#1e3a5f] flex items-center justify-center text-[#3b5998] dark:text-[#7dd3fc] mb-4">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#334155] dark:text-[#f1f5f9] mb-2 group-hover:text-[#3b5998] dark:group-hover:text-[#7dd3fc] transition-colors">DSA Mastery</h3>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
                500+ curated problems organized by patterns. Track curated sheets seamlessly with your profile.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-xl bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="h-10 w-10 rounded bg-[#e2e8f0] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#1e3a5f] flex items-center justify-center text-[#3b5998] dark:text-[#7dd3fc] mb-4">
                <Network className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#334155] dark:text-[#f1f5f9] mb-2 group-hover:text-[#3b5998] dark:group-hover:text-[#7dd3fc] transition-colors">System Design</h3>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
                Learn to architect scalable, distributed systems from scratch with real-world case studies.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-xl bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="h-10 w-10 rounded bg-[#e2e8f0] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#1e3a5f] flex items-center justify-center text-[#3b5998] dark:text-[#7dd3fc] mb-4">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#334155] dark:text-[#f1f5f9] mb-2 group-hover:text-[#3b5998] dark:group-hover:text-[#7dd3fc] transition-colors">Database Concepts</h3>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
                Master SQL, NoSQL, indexing, and transaction fundamentals essential for backend engineering.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 rounded-xl bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="h-10 w-10 rounded bg-[#e2e8f0] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#1e3a5f] flex items-center justify-center text-[#3b5998] dark:text-[#7dd3fc] mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#334155] dark:text-[#f1f5f9] mb-2 group-hover:text-[#3b5998] dark:group-hover:text-[#7dd3fc] transition-colors">Operating Systems</h3>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
                Deep dive into processes, threads, concurrency, and memory management at a granular level.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 rounded-xl bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="h-10 w-10 rounded bg-[#e2e8f0] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#1e3a5f] flex items-center justify-center text-[#3b5998] dark:text-[#7dd3fc] mb-4">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#334155] dark:text-[#f1f5f9] mb-2 group-hover:text-[#3b5998] dark:group-hover:text-[#7dd3fc] transition-colors">Computer Networks</h3>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
                Understand the OSI model, TCP/IP, DNS, and modern web protocols running the internet.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 rounded-xl bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="h-10 w-10 rounded bg-[#e2e8f0] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#1e3a5f] flex items-center justify-center text-[#3b5998] dark:text-[#7dd3fc] mb-4">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#334155] dark:text-[#f1f5f9] mb-2 group-hover:text-[#3b5998] dark:group-hover:text-[#7dd3fc] transition-colors">Progress Tracking</h3>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
                Advanced telemetry and analytics to track your learning journey and identify weak spots.
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Footer minimal section */}
      <footer className="border-t border-[#cbd5e1] dark:border-[#1e3a5f] bg-[#f8fafc] dark:bg-[#0f172a] py-8 text-center text-xs text-[#64748b] dark:text-[#94a3b8] mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 Heapify Labs. Crafted for technical excellence.</div>
          <div className="flex gap-6 text-[#475569] dark:text-[#cbd5e1]">
            <a href="#" className="hover:text-[#3b5998] dark:hover:text-[#7dd3fc]">Terms</a>
            <a href="#" className="hover:text-[#3b5998] dark:hover:text-[#7dd3fc]">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}