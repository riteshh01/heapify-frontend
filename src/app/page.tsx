"use client";

import { 
  Code2, 
  Network, 
  Database, 
  Cpu, 
  Globe, 
  TrendingUp, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#f4fbf6] dark:bg-[#161b22] text-[#2d3748] dark:text-[#e2e8f0] font-sans selection:bg-emerald-500/30 transition-colors duration-300">
      
      {/* Shared Navbar */}
      <div className="relative z-10 bg-[#f4fbf6] dark:bg-[#161b22] border-b border-transparent transition-colors duration-300">
        <Navbar />
      </div>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-6xl mx-auto text-center pt-28 pb-24">
        
        {/* Solid Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 mb-8">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs sm:text-sm font-bold tracking-wide text-emerald-800 dark:text-emerald-300">
            MANGOS Prep Ecosystem 2.0 Live
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight max-w-5xl leading-[1.05] mb-8">
          <span className="text-[#1a202c] dark:text-[#f0f6fc]">Master your </span>
          <span className="text-emerald-600 dark:text-emerald-500">
            Tech Interviews.
          </span>
        </h1>

        {/* Hero Sub-headline */}
        <p className="text-[#4a5568] dark:text-[#8b949e] text-lg sm:text-xl max-w-2xl leading-relaxed mb-12 font-medium">
          The elite platform to conquer computer science fundamentals. Master DSA, architect scalable systems, and optimize algorithms in a distraction-free environment.
        </p>

        {/* Solid CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-24 w-full sm:w-auto justify-center">
          <a
            href="/signup"
            className="group flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-8 font-bold text-white text-base transition-all active:scale-95 w-full sm:w-auto shadow-md"
          >
            Start Free Trial <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <a
            href="#curriculum"
            className="flex h-14 items-center justify-center rounded-full border border-[#cbd5e1] dark:border-[#30363d] bg-white dark:bg-[#21262d] hover:bg-[#eaf5ed] dark:hover:bg-[#30363d] hover:border-emerald-500 dark:hover:border-emerald-500 px-8 font-bold text-[#4a5568] dark:text-[#c9d1d9] text-base transition-all w-full sm:w-auto shadow-sm"
          >
            Explore Curriculum
          </a>
        </div>

        {/* Curriculum Section */}
        <div id="curriculum" className="w-full text-left pt-16">
          <div className="mb-14 text-center flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-4">Complete Curriculum</h2>
            <div className="h-1.5 w-12 bg-emerald-500 rounded-full mb-4"></div>
            <p className="text-base text-[#4a5568] dark:text-[#8b949e] max-w-xl">Everything you need to crack top-tier tech interviews at MAANG and beyond.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Soft Feature Cards */}
            {[
              { icon: Code2, title: "DSA Mastery", desc: "500+ curated problems organized by patterns. Track curated sheets seamlessly with your profile." },
              { icon: Network, title: "System Design", desc: "Learn to architect scalable, distributed systems from scratch with real-world case studies." },
              { icon: Database, title: "Database Concepts", desc: "Master SQL, NoSQL, indexing, and transaction fundamentals essential for backend engineering." },
              { icon: Cpu, title: "Operating Systems", desc: "Deep dive into processes, threads, concurrency, and memory management at a granular level." },
              { icon: Globe, title: "Computer Networks", desc: "Understand the OSI model, TCP/IP, DNS, and modern web protocols running the internet." },
              { icon: TrendingUp, title: "Progress Tracking", desc: "Advanced telemetry and analytics to track your learning journey and identify weak spots." }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group p-8 rounded-3xl bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="h-14 w-14 rounded-2xl bg-[#eaf5ed] dark:bg-[#0d1117] flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#4a5568] dark:text-[#8b949e] leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
            
          </div>
        </div>
      </main>

      {/* Mild Footer */}
      <footer className="bg-[#eaf5ed] dark:bg-[#0d1117] border-t border-[#d1e8d8] dark:border-[#30363d] py-8 mt-auto transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-[#718096] dark:text-[#8b949e]">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-[10px]">H</div>
            © 2026 Heapify Labs. Crafted for technical excellence.
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}