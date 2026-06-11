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
  FiArrowRight,
  FiCheckCircle,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";

const SUBJECTS = [
  {
    label: "DSA Sheet",
    href: "/learning/dsa_sheet",
    icon: <FiBook size={20} />,
    description: "Arrays, Trees, Graphs, DP — structured topic-wise practice",
  },
  {
    label: "Operating Systems",
    href: "/learning/os",
    icon: <FiCpu size={20} />,
    description: "Processes, scheduling, memory, synchronization & file systems",
  },
  {
    label: "Computer Networks",
    href: "/learning/networks",
    icon: <FiWifi size={20} />,
    description: "OSI model, TCP/IP, routing algorithms & network security",
  },
  {
    label: "DBMS",
    href: "/learning/dbms",
    icon: <FiDatabase size={20} />,
    description: "SQL, normalization, transactions, indexing & NoSQL",
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
      icon: <FiCheckCircle size={16} className="text-[#166534] dark:text-[#34d399]" />,
      label: "Problems Solved",
      value: isStatsLoading ? "..." : String(solvedCount),
    },
    {
      icon: <FiTrendingUp size={16} className="text-[#3b5998] dark:text-[#7dd3fc]" />,
      label: "Day Streak",
      value: "0",
    },
    {
      icon: <FiAward size={16} className="text-[#854d0e] dark:text-[#fbbf24]" />,
      label: "Badges Earned",
      value: "0",
    },
  ];

  return (
    <div className="min-h-full bg-[#e2e8f0] dark:bg-[#0a0f1a] text-[#333] dark:text-[#e2e8f0] transition-colors duration-300">

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3b5998] dark:bg-[#7dd3fc] animate-pulse" />
            <span className="text-xs text-[#64748b] dark:text-[#94a3b8] font-bold">Active session</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1e293b] dark:text-[#f8fafc] tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-[#64748b] dark:text-[#94a3b8] mt-2 text-sm">
            Ready to crush some interviews today? Pick up where you left off.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {QUICK_STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl p-4 flex items-center gap-3 shadow-sm transition-colors duration-300"
            >
              <div className="p-2 bg-[#e2e8f0] dark:bg-[#0f172a] rounded border border-[#cbd5e1] dark:border-[#334155]">
                {stat.icon}
              </div>
              <div>
                <div className="text-lg font-black text-[#1e293b] dark:text-[#f8fafc]">{stat.value}</div>
                <div className="text-[10px] text-[#64748b] dark:text-[#94a3b8] font-bold uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subject Cards */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-[0.15em] mb-4">
            Study Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUBJECTS.map((subject) => (
              <Link
                key={subject.href}
                href={subject.href}
                className="group bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] hover:border-[#3b5998] dark:hover:border-[#7dd3fc] rounded-xl p-5 transition-all shadow-sm hover:shadow-md block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded bg-[#e2e8f0] dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] text-[#3b5998] dark:text-[#7dd3fc]">
                    {subject.icon}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-[#334155] dark:text-[#f1f5f9] mb-1.5">{subject.label}</h3>
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed mb-4">{subject.description}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] dark:text-[#94a3b8] group-hover:text-[#3b5998] dark:group-hover:text-[#7dd3fc] transition-colors font-bold">
                  Start studying
                  <FiArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Overall Progress */}
        <div className="border border-[#cbd5e1] dark:border-[#334155] rounded-xl p-6 bg-white dark:bg-[#1e293b] shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#334155] dark:text-[#f1f5f9]">DSA Progress</h3>
            <span className="text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              {isStatsLoading ? "Loading..." : `${solvedCount} / ${totalProblems} solved`}
            </span>
          </div>
          <div className="w-full h-3 bg-[#e2e8f0] dark:bg-[#0f172a] rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#3b82f6] to-[#0ea5e9] dark:from-[#2563eb] dark:to-[#38bdf8] rounded-full transition-all duration-700"
              style={{
                width: totalProblems > 0
                  ? `${Math.round((solvedCount / totalProblems) * 100)}%`
                  : "0%",
              }}
            />
          </div>
          <p className="text-right text-xs text-[#64748b] dark:text-[#94a3b8] mt-2 font-bold">
            {totalProblems > 0
              ? `${Math.round((solvedCount / totalProblems) * 100)}% complete`
              : "Start solving problems to track your progress."}
          </p>
        </div>
      </div>
    </div>
  );
}