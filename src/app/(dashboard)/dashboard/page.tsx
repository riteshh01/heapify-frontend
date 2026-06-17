"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import { fetchTopics, fetchProgress } from "@/services/knowledgeService";
import {
  FiBook,
  FiCpu,
  FiWifi,
  FiDatabase,
  FiGitBranch,
  FiArrowRight,
  FiCheckCircle,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";

const SUBJECTS = [
  {
    label: "DSA Sheet",
    href: "/learning/dsa_sheet",
    icon: <FiBook size={24} />,
    description: "Arrays, Trees, Graphs, DP — structured topic-wise practice",
  },
  {
    label: "Operating Systems",
    href: "/learning/os",
    icon: <FiCpu size={24} />,
    description: "Processes, scheduling, memory, synchronization & file systems",
  },
  {
    label: "Computer Networks",
    href: "/learning/networks",
    icon: <FiWifi size={24} />,
    description: "OSI model, TCP/IP, routing algorithms & network security",
  },
  {
    label: "DBMS",
    href: "/learning/dbms",
    icon: <FiDatabase size={24} />,
    description: "SQL, normalization, transactions, indexing & NoSQL",
  },
  {
    label: "Git & Version Control",
    href: "/learning/git",
    icon: <FiGitBranch size={24} />,
    description: "Branching, merging, rebasing, remotes & real-world workflows",
  },
];

export default function DashboardPage() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const firstName = user?.name?.split(" ")?.[0] || "there";

  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [totalProblems, setTotalProblems] = useState<number>(0);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setIsStatsLoading(false);
      return;
    }

    const loadStats = async () => {
      try {
        setIsStatsLoading(true);

        // Fetch topics for total problem count + user progress in parallel
        const [topics, solvedSet] = await Promise.all([fetchTopics(), fetchProgress()]);

        const total = topics.reduce((acc, t) => acc + Number(t.problem_count), 0);
        setTotalProblems(total);
        setSolvedCount(solvedSet.size);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        // Leave defaults (0) on error — don't crash the page
      } finally {
        setIsStatsLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const QUICK_STATS = [
    {
      icon: <FiCheckCircle size={22} className="text-emerald-500" />,
      label: "Problems Solved",
      value: isStatsLoading ? "..." : String(solvedCount),
    },
    {
      icon: <FiTrendingUp size={22} className="text-amber-500" />,
      label: "Current Streak",
      value: "0 Days",
    },
    {
      icon: <FiAward size={22} className="text-blue-500 dark:text-blue-400" />,
      label: "Badges Earned",
      value: "0",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f4fbf6] dark:bg-[#161b22] text-[#2d3748] dark:text-[#e2e8f0] font-sans transition-colors duration-300 pb-16">

      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
        
        {/* Welcome header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider">Active session</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
            Welcome back, {firstName} <span className="wave">👋</span>
          </h1>
          <p className="text-[#4a5568] dark:text-[#8b949e] mt-3 text-base sm:text-lg font-medium">
            Ready to crush some interviews today? Pick up right where you left off.
          </p>
        </div>

        {/* Unified Quick Stats */}
        <div className="bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-3xl shadow-sm mb-10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#e2e8f0] dark:divide-[#30363d]">
            {QUICK_STATS.map((stat) => (
              <div key={stat.label} className="p-6 sm:p-8 flex items-center gap-5 hover:bg-[#f0f3f6]/50 dark:hover:bg-[#0d1117]/50 transition-colors">
                <div className="p-3.5 bg-[#f0f3f6] dark:bg-[#0d1117] rounded-2xl border border-[#e2e8f0] dark:border-[#30363d] shadow-sm">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-3xl font-black text-[#1a202c] dark:text-[#f0f6fc] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-[#4a5568] dark:text-[#8b949e] font-bold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DSA Solid Banner Progress */}
        <div className="mb-12">
          <div className="bg-emerald-600 dark:bg-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-emerald-500 dark:border-emerald-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">DSA Master Progress</h3>
                  <span className="text-sm font-bold text-emerald-50 bg-emerald-700 dark:bg-emerald-900 px-3.5 py-1.5 rounded-xl border border-emerald-500 dark:border-emerald-700">
                    {isStatsLoading ? "Loading..." : `${solvedCount} / ${totalProblems}`}
                  </span>
                </div>
                <div className="w-full h-3 bg-emerald-800/40 dark:bg-emerald-950/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: totalProblems > 0 ? `${Math.round((solvedCount / totalProblems) * 100)}%` : "0%",
                    }}
                  />
                </div>
                <p className="text-sm text-emerald-100 mt-3 font-medium">
                  {totalProblems > 0
                    ? `${Math.round((solvedCount / totalProblems) * 100)}% completed. Keep pushing!`
                    : "Start solving problems to track your progress."}
                </p>
              </div>
              <Link 
                href="/learning/dsa_sheet" 
                className="shrink-0 inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-[#eaf5ed] hover:scale-105 transition-all shadow-sm active:scale-95"
              >
                Continue Learning <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Study Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-6">
            Explore Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUBJECTS.map((subject) => (
              <Link
                key={subject.href}
                href={subject.href}
                className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                <div className="h-14 w-14 rounded-2xl bg-[#f0f3f6] dark:bg-[#0d1117] flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:scale-110 transition-all duration-300">
                  {subject.icon}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[#1a202c] dark:text-[#f0f6fc] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {subject.label}
                  </h3>
                  <FiArrowRight 
                    size={20} 
                    className="text-[#a0aec0] dark:text-[#4b5563] group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" 
                  />
                </div>
                <p className="text-sm text-[#4a5568] dark:text-[#8b949e] leading-relaxed font-medium">
                  {subject.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Basic Wave Animation for Emoji */}
      <style dangerouslySetInnerHTML={{__html: `
        .wave {
          display: inline-block;
          animation: wave-animation 2.5s infinite;
          transform-origin: 70% 70%;
        }
        @keyframes wave-animation {
          0% { transform: rotate(0.0deg) }
          10% { transform: rotate(14.0deg) }
          20% { transform: rotate(-8.0deg) }
          30% { transform: rotate(14.0deg) }
          40% { transform: rotate(-4.0deg) }
          50% { transform: rotate(10.0deg) }
          60% { transform: rotate(0.0deg) }
          100% { transform: rotate(0.0deg) }
        }
      `}} />
    </div>
  );
}