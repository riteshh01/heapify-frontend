"use client";

import { 
  Code2, 
  Network, 
  Database, 
  Cpu, 
  Globe, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  GitBranch,
  Terminal,
  Trophy,
  Activity,
  Flame,
  CheckCircle2,
  BrainCircuit,
  Binary
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
// AvatarGroup import kar lena jahan bhi tumne file save ki hai
import AvatarGroup from "@/components/ui/AvatarGroup"; 

const companies = [
  { name: "Google", icon: "https://res.cloudinary.com/djts2p7lb/image/upload/v1783747379/companies/google.png", color: "#4285F4", problems: 152 },
  { name: "Meta", icon: "https://res.cloudinary.com/djts2p7lb/image/upload/v1783746929/companies/meta.png", color: "#0668E1", problems: 120 },
  { name: "Microsoft", icon: "https://res.cloudinary.com/djts2p7lb/image/upload/v1783747349/companies/microsoft.png", color: "#00A4EF", problems: 115 },
  { name: "Amazon", icon: "https://res.cloudinary.com/djts2p7lb/image/upload/v1783746916/companies/amazon.png", color: "#FF9900", problems: 140 },
  { name: "Netflix", icon: "https://res.cloudinary.com/djts2p7lb/image/upload/v1783747449/companies/netflix.png", color: "#E50914", problems: 85 },
  { name: "Apple", icon: "https://res.cloudinary.com/djts2p7lb/image/upload/v1783969056/iphone_sigrs3.png", color: "#000000", darkColor: "FFFFFF", problems: 90 },
];

const topics = [
  { name: "Arrays & Hashing", icon: Database, problems: 45, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Two Pointers", icon: ArrowRight, problems: 30, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "Trees & Graphs", icon: Network, problems: 65, color: "text-purple-500", bg: "bg-purple-500/10" },
  { name: "Dynamic Programming", icon: Cpu, problems: 55, color: "text-rose-500", bg: "bg-rose-500/10" },
  { name: "Advanced Algorithms", icon: BrainCircuit, problems: 40, color: "text-amber-500", bg: "bg-amber-500/10" },
  { name: "Bit Manipulation", icon: Binary, problems: 25, color: "text-indigo-500", bg: "bg-indigo-500/10" },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#f4fbf6] dark:bg-[#161b22] text-[#2d3748] dark:text-[#c9d1d9] font-sans selection:bg-emerald-500/30 transition-colors duration-300 overflow-hidden">
      
      {/* Shared Navbar */}
      <div className="relative z-50 bg-[#f4fbf6]/80 dark:bg-[#161b22]/80 backdrop-blur-md border-b border-[#e2e8f0] dark:border-[#30363d] transition-colors duration-300">
        <Navbar />
      </div>

      <main className="flex-1 flex flex-col w-full mx-auto">
        
        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center justify-center px-6 max-w-6xl mx-auto text-center pt-28 pb-32">
          {/* Background Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            
            {/* === USER AVATAR GROUP ADDED HERE === */}
            <div className="-mt-6 scale-90 sm:scale-100">
              <AvatarGroup />
            </div>

            {/* Solid Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 mb-8 shadow-sm">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold tracking-wide text-emerald-800 dark:text-emerald-300">
                Company Wise Questions
              </span>
            </div>

            {/* Hero Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight max-w-5xl leading-[1.05] mb-8">
              <span className="text-[#1a202c] dark:text-[#c9d1d9]">Prepare your </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                Tech Interviews.
              </span>
            </h1>

            {/* Hero Sub-headline */}
            <p className="text-[#4a5568] dark:text-[#8b949e] text-lg sm:text-xl max-w-2xl leading-relaxed mb-12 font-medium">
              The elite platform to conquer computer science fundamentals. Master topic-wise DSA, ace company-specific interviews, and optimize your algorithms with precision.
            </p>

            {/* Solid CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
              <Link
                href="/signup"
                className="group flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 px-8 font-bold text-white text-base transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 w-full sm:w-auto"
              >
                Start Practicing <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="#curriculum"
                className="flex h-14 items-center justify-center rounded-full border border-[#e2e8f0] dark:border-[#30363d] bg-white dark:bg-[#21262d] hover:bg-[#eaf5ed] dark:hover:bg-[#30363d] hover:border-emerald-500 dark:hover:border-emerald-500 px-8 font-bold text-[#4a5568] dark:text-[#c9d1d9] text-base transition-all w-full sm:w-auto shadow-sm"
              >
                Explore Topics
              </Link>
            </div>
          </div>
        </section>

        {/* TOPIC-WISE DSA SECTION */}
        <section id="curriculum" className="w-full bg-[#f4fbf6] dark:bg-[#161b22] py-24 border-y border-[#e2e8f0] dark:border-[#30363d]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-14 text-center flex flex-col items-center">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1a202c] dark:text-[#c9d1d9] mb-4">Topic-Wise Mastery</h2>
              <div className="h-1.5 w-16 bg-emerald-500 rounded-full mb-6"></div>
              <p className="text-lg text-[#4a5568] dark:text-[#8b949e] max-w-2xl font-medium">
                Structured DSA sheets curated by patterns. Master the core concepts before diving into advanced problems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic, idx) => (
                <div 
                  key={idx} 
                  className="group relative overflow-hidden p-8 rounded-3xl bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                >
                  <div className={`h-16 w-16 rounded-2xl ${topic.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <topic.icon className={`h-8 w-8 ${topic.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a202c] dark:text-[#c9d1d9] mb-2">
                    {topic.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#64748b] dark:text-[#8b949e]">
                    <Code2 className="h-4 w-4" />
                    <span>{topic.problems} Problems</span>
                  </div>
                  
                  {/* Decorative Gradient Blob */}
                  <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full ${topic.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPANY-WISE PROBLEMS SECTION */}
        <section className="w-full py-24 relative">
          <div className="absolute inset-0 bg-white dark:bg-[#161b22] pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="mb-14 text-center flex flex-col items-center">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1a202c] dark:text-[#c9d1d9] mb-4">Target Top Companies</h2>
              <div className="h-1.5 w-16 bg-blue-500 rounded-full mb-6"></div>
              <p className="text-lg text-[#4a5568] dark:text-[#8b949e] max-w-2xl font-medium">
                Practice specific problem sets asked in the most recent interviews at MAANG and top tech giants.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {companies.map((company, idx) => (
                <div 
                  key={idx}
                  className="group relative flex flex-col items-center p-8 rounded-3xl bg-[#f8fafc] dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="h-20 w-20 mb-6 flex items-center justify-center p-4 bg-white dark:bg-[#161b22] rounded-2xl group-hover:bg-blue-50 dark:group-hover:bg-[#1d2633] transition-colors border border-[#e2e8f0] dark:border-[#30363d]">
                    {/* Yaha par humne simpleicons URL hata kar seedha company.icon lagaya hai */}
                    <img 
                      src={company.icon}
                      alt={`${company.name} logo`}
                      className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a202c] dark:text-[#c9d1d9] mb-2">{company.name}</h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-bold">
                    <Database className="h-3.5 w-3.5" />
                    {company.problems} Qs
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/companies" className="inline-flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-all">
                View All Companies <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* PREPARE FOR GIT & VERSION CONTROL */}
        <section className="w-full py-24 bg-[#f4fbf6] dark:bg-[#161b22] border-y border-[#e2e8f0] dark:border-[#30363d]">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d]">
                <GitBranch className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                <span className="text-sm font-bold tracking-wide text-orange-600 dark:text-orange-300">
                  Version Control
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight text-[#1a202c] dark:text-[#c9d1d9]">
                Master <span className="text-orange-500 dark:text-orange-400">Git & GitHub</span> Workflow.
              </h2>
              <p className="text-[#4a5568] dark:text-[#8b949e] text-lg leading-relaxed max-w-xl">
                Interviews are just the beginning. Learn how to manage branches, resolve merge conflicts, and collaborate like a Senior Engineer before day one on the job.
              </p>
              <ul className="space-y-4">
                {['Interactive terminal exercises', 'Advanced branching strategies', 'Open-source contribution guide'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                    <span className="font-medium text-[#4a5568] dark:text-[#c9d1d9]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="rounded-2xl overflow-hidden border border-[#e2e8f0] dark:border-[#30363d] shadow-2xl bg-[#0d1117]">
                <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 text-xs font-mono text-[#8b949e] flex items-center gap-2">
                    <Terminal className="h-3 w-3" /> user@heapify: ~/projects/core
                  </div>
                </div>
                <div className="p-6 font-mono text-sm leading-loose">
                  <div className="text-emerald-400">$ git status</div>
                  <div className="text-[#8b949e]">On branch main<br/>Your branch is up to date with 'origin/main'.</div>
                  <div className="text-emerald-400 mt-2">$ git checkout -b feature/awesome-dsa</div>
                  <div className="text-[#8b949e]">Switched to a new branch 'feature/awesome-dsa'</div>
                  <div className="text-emerald-400 mt-2">$ git commit -m "feat: implement trie traversal"</div>
                  <div className="text-[#c9d1d9]">[feature/awesome-dsa 9f8a3b1] feat: implement trie traversal<br/> 1 file changed, 42 insertions(+)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LEETCODE STATS INTEGRATION */}
        <section className="w-full py-24 relative overflow-hidden bg-white dark:bg-[#161b22]">
          <div className="absolute -left-[20%] top-[20%] w-[500px] h-[500px] bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="mb-14 text-center flex flex-col items-center">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1a202c] dark:text-[#c9d1d9] mb-4">Connect Your Progress</h2>
              <div className="h-1.5 w-16 bg-yellow-500 rounded-full mb-6"></div>
              <p className="text-lg text-[#4a5568] dark:text-[#8b949e] max-w-2xl font-medium">
                Sync your LeetCode profile instantly. Visualize your consistency, track contest ratings, and celebrate your problem-solving streaks.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center bg-[#f8fafc] dark:bg-[#21262d] rounded-3xl p-8 sm:p-12 border border-[#e2e8f0] dark:border-[#30363d] shadow-lg relative overflow-hidden">
              
              <div className="flex-1 space-y-6 z-10">
                <div className="inline-flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-bold mb-2">
                  <Trophy className="h-6 w-6" /> Seamless Sync
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-[#1a202c] dark:text-[#c9d1d9]">
                  Your Stats, Beautifully Rendered.
                </h3>
                <p className="text-[#4a5568] dark:text-[#8b949e] text-lg font-medium">
                  We dynamically fetch and render your competitive programming stats. Identify your weak spots based on real-time data and improve efficiently.
                </p>
                <Link
                  href="/stats"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1a202c] dark:bg-yellow-500/20 text-white dark:text-yellow-400 hover:bg-[#2d3748] dark:hover:bg-yellow-500/30 px-6 font-bold transition-all"
                >
                  View Live Stats <Activity className="h-4 w-4" />
                </Link>
              </div>

              {/* Mockup Stats Card */}
              <div className="flex-1 w-full max-w-sm relative z-10">
                <div className="bg-white dark:bg-[#161b22] rounded-2xl p-6 shadow-xl border border-[#e2e8f0] dark:border-[#30363d] rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-1">
                        <div className="w-full h-full rounded-full bg-white dark:bg-[#21262d] flex items-center justify-center font-bold text-lg text-[#1a202c] dark:text-[#c9d1d9]">
                          R
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-[#1a202c] dark:text-[#c9d1d9]">Ritesh</div>
                        <div className="text-xs text-[#64748b] dark:text-[#8b949e]">Top 3%</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-orange-500 font-bold">
                        <Flame className="h-4 w-4" /> 45 Day
                      </div>
                      <div className="text-xs text-[#64748b] dark:text-[#8b949e]">Streak</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mb-4">
                     <div>
                       <div className="text-3xl font-extrabold text-[#1a202c] dark:text-[#c9d1d9]">412</div>
                       <div className="text-sm font-semibold text-[#64748b] dark:text-[#8b949e]">Solved</div>
                     </div>
                     <div className="flex gap-2 text-sm font-bold">
                        <span className="text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-md">200</span>
                        <span className="text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-md">150</span>
                        <span className="text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-1 rounded-md">62</span>
                     </div>
                  </div>
                  
                  <div className="w-full h-2 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden flex">
                    <div className="h-full bg-green-500 w-[45%]"></div>
                    <div className="h-full bg-yellow-500 w-[40%]"></div>
                    <div className="h-full bg-red-500 w-[15%]"></div>
                  </div>
                </div>
                
                {/* Decorative blob behind card */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 blur-2xl rounded-full"></div>
              </div>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}