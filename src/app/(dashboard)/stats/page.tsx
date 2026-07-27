"use client";

import React, { useState, useEffect, useMemo, FormEvent } from "react";
import {
  FiTrendingUp,
  FiActivity,
  FiSettings,
  FiCheck,
  FiEdit2,
  FiAlertCircle,
  FiTrash2,
} from "react-icons/fi";
import { SiLeetcode } from "react-icons/si";
import {
  fetchProgressSummary,
  fetchTopics,
  ProgressSummary,
} from "@/services/knowledgeService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface DashboardViewProps {
  progressSummary: ProgressSummary | null;
  totalProblemsCount: number;
  solvedProblems: Set<string | number>;
}

interface LeetCodeStats {
  solvedProblem: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalQuestions: number;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
  totalSubmissionNum: { difficulty: string; count: number; submissions: number }[];
  acSubmissionNum: { difficulty: string; count: number; submissions: number }[];
}

interface LeetCodeProfile {
  username: string;
  name: string;
  avatar: string;
  ranking: number;
}

interface SkillTag {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
}

interface LeetCodeSkills {
  tagProblemCounts: {
    advanced: SkillTag[];
    intermediate: SkillTag[];
    fundamental: SkillTag[];
  };
}

// ─── Local Progress Chart ─────────────────────────────────────────────────────

function DifficultyArcChart({ progressSummary, totalProblemsCount, solvedProblems }: DashboardViewProps) {
  const summary = progressSummary;
  const totalSolved = summary?.totalSolved ?? solvedProblems.size;
  const totalProblems = summary?.totalProblems ?? totalProblemsCount;

  const easy = summary?.byDifficulty.easy ?? { solved: 0, total: 0 };
  const medium = summary?.byDifficulty.medium ?? { solved: 0, total: 0 };
  const hard = summary?.byDifficulty.hard ?? { solved: 0, total: 0 };

  const overallPct = totalProblems > 0 ? (totalSolved / totalProblems) : 0;

  function describeArc(cx: number, cy: number, r: number, pct: number, startAngle = -210, sweepAngle = 240) {
    const clamp = Math.min(Math.max(pct, 0), 0.9999);
    const start = (startAngle * Math.PI) / 180;
    const end = start + (sweepAngle * clamp * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = sweepAngle * clamp > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  function trackArc(cx: number, cy: number, r: number, startAngle = -210, sweepAngle = 240) {
    return describeArc(cx, cy, r, 1, startAngle, sweepAngle);
  }

  const cx = 110;
  const cy = 110;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
      <div className="relative shrink-0 flex justify-center w-full md:w-auto">
        <svg width={220} height={220} viewBox="0 0 220 220" className="max-w-full">
          {/* Easy */}
          <path d={trackArc(cx, cy, 90)} fill="none" stroke="#d1fae5" strokeWidth={10} strokeLinecap="round" className="dark:stroke-emerald-900/40" />
          <path d={describeArc(cx, cy, 90, easy.total > 0 ? easy.solved / easy.total : 0)} fill="none" stroke="#10b981" strokeWidth={10} strokeLinecap="round" className="transition-all duration-700" />
          {/* Medium */}
          <path d={trackArc(cx, cy, 73)} fill="none" stroke="#fef3c7" strokeWidth={10} strokeLinecap="round" className="dark:stroke-amber-900/40" />
          <path d={describeArc(cx, cy, 73, medium.total > 0 ? medium.solved / medium.total : 0)} fill="none" stroke="#f59e0b" strokeWidth={10} strokeLinecap="round" className="transition-all duration-700" />
          {/* Hard */}
          <path d={trackArc(cx, cy, 56)} fill="none" stroke="#fee2e2" strokeWidth={10} strokeLinecap="round" className="dark:stroke-rose-900/40" />
          <path d={describeArc(cx, cy, 56, hard.total > 0 ? hard.solved / hard.total : 0)} fill="none" stroke="#ef4444" strokeWidth={10} strokeLinecap="round" className="transition-all duration-700" />

          {/* Centre */}
          <text x={cx} y={cy - 10} textAnchor="middle" className="fill-[#1a202c] dark:fill-[#f0f6fc]" fontSize={32} fontWeight={800} fontFamily="inherit">
            {totalSolved}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-[#4a5568] dark:fill-[#8b949e]" fontSize={11} fontWeight={600} fontFamily="inherit">
            / {totalProblems}
          </text>
          <text x={cx} y={cy + 28} textAnchor="middle" className="fill-[#a0aec0] dark:fill-[#64748b]" fontSize={10} fontFamily="inherit" fontWeight={500}>
            solved
          </text>

          {/* Bottom Badge */}
          <text x={cx} y={200} textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" fontSize={12} fontWeight={700} fontFamily="inherit">
            {Math.round(overallPct * 100)}% complete
          </text>
        </svg>
      </div>

      <div className="flex-1 space-y-4 md:space-y-5 w-full max-w-sm">
        {([
          { label: "Easy", data: easy, color: "bg-emerald-500", track: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", badge: "bg-emerald-100/80 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800/50" },
          { label: "Medium", data: medium, color: "bg-amber-400", track: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", badge: "bg-amber-100/80 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800/50" },
          { label: "Hard", data: hard, color: "bg-rose-500", track: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", badge: "bg-rose-100/80 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800/50" },
        ] as const).map(({ label, data, color, track, text, badge }) => {
          const pct = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${text}`}>{label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${badge} ${text}`}>
                    {data.solved} / {data.total}
                  </span>
                  <span className="text-[11px] font-bold text-[#4a5568] dark:text-[#8b949e]">{pct}%</span>
                </div>
              </div>
              <div className={`w-full h-2.5 ${track} rounded-full overflow-hidden`}>
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t border-[#d1e8d8] dark:border-[#30363d] grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-[#f4fcf7] dark:bg-[#0d1117] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#d1e8d8] dark:border-[#30363d]">
            <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] uppercase tracking-wider mb-1">Total Solved</div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">{totalSolved}</div>
          </div>
          <div className="bg-[#f4fcf7] dark:bg-[#0d1117] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#d1e8d8] dark:border-[#30363d]">
            <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] uppercase tracking-wider mb-1">Total Problems</div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">{totalProblems}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LeetCode Progress Chart ────────────────────────────────────────────────────

function LeetCodeDifficultyArcChart({ stats }: { stats: LeetCodeStats }) {
  const easy = { solved: stats.easySolved, total: stats.easyTotal || 1 };
  const medium = { solved: stats.mediumSolved, total: stats.mediumTotal || 1 };
  const hard = { solved: stats.hardSolved, total: stats.hardTotal || 1 };
  const totalSolved = stats.solvedProblem;
  const totalProblems = stats.totalQuestions || 3991;
  const overallPct = totalProblems > 0 ? (totalSolved / totalProblems) : 0;

  function describeArc(cx: number, cy: number, r: number, pct: number, startAngle = -210, sweepAngle = 240) {
    const clamp = Math.min(Math.max(pct, 0), 0.9999);
    const start = (startAngle * Math.PI) / 180;
    const end = start + (sweepAngle * clamp * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = sweepAngle * clamp > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  function trackArc(cx: number, cy: number, r: number, startAngle = -210, sweepAngle = 240) {
    return describeArc(cx, cy, r, 1, startAngle, sweepAngle);
  }

  const cx = 110;
  const cy = 110;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14 w-full justify-center">
      <div className="relative shrink-0 flex justify-center w-full md:w-auto">
        <svg width={220} height={220} viewBox="0 0 220 220" className="max-w-full">
          {/* Easy */}
          <path d={trackArc(cx, cy, 90)} fill="none" stroke="#d1fae5" strokeWidth={10} strokeLinecap="round" className="dark:stroke-emerald-900/40" />
          <path d={describeArc(cx, cy, 90, easy.total > 0 ? easy.solved / easy.total : 0)} fill="none" stroke="#10b981" strokeWidth={10} strokeLinecap="round" className="transition-all duration-700" />
          {/* Medium */}
          <path d={trackArc(cx, cy, 73)} fill="none" stroke="#fef3c7" strokeWidth={10} strokeLinecap="round" className="dark:stroke-amber-900/40" />
          <path d={describeArc(cx, cy, 73, medium.total > 0 ? medium.solved / medium.total : 0)} fill="none" stroke="#f59e0b" strokeWidth={10} strokeLinecap="round" className="transition-all duration-700" />
          {/* Hard */}
          <path d={trackArc(cx, cy, 56)} fill="none" stroke="#fee2e2" strokeWidth={10} strokeLinecap="round" className="dark:stroke-rose-900/40" />
          <path d={describeArc(cx, cy, 56, hard.total > 0 ? hard.solved / hard.total : 0)} fill="none" stroke="#ef4444" strokeWidth={10} strokeLinecap="round" className="transition-all duration-700" />

          {/* Centre */}
          <text x={cx} y={cy - 10} textAnchor="middle" className="fill-[#1a202c] dark:fill-[#f0f6fc]" fontSize={32} fontWeight={800} fontFamily="inherit">
            {totalSolved}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-[#4a5568] dark:fill-[#8b949e]" fontSize={11} fontWeight={600} fontFamily="inherit">
            / {totalProblems}
          </text>
          <text x={cx} y={cy + 28} textAnchor="middle" className="fill-[#a0aec0] dark:fill-[#64748b]" fontSize={10} fontFamily="inherit" fontWeight={500}>
            solved
          </text>

          {/* Bottom Badge */}
          <text x={cx} y={200} textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" fontSize={12} fontWeight={700} fontFamily="inherit">
            {Math.round(overallPct * 100)}% complete
          </text>
        </svg>
      </div>

      <div className="flex-1 space-y-4 md:space-y-5 w-full max-w-sm">
        {([
          { label: "Easy", data: easy, color: "bg-emerald-500", track: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", badge: "bg-emerald-100/80 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800/50" },
          { label: "Medium", data: medium, color: "bg-amber-400", track: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", badge: "bg-amber-100/80 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800/50" },
          { label: "Hard", data: hard, color: "bg-rose-500", track: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", badge: "bg-rose-100/80 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800/50" },
        ] as const).map(({ label, data, color, track, text, badge }) => {
          const pct = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${text}`}>{label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${badge} ${text}`}>
                    {data.solved} / {data.total}
                  </span>
                  <span className="text-[11px] font-bold text-[#4a5568] dark:text-[#8b949e]">{pct}%</span>
                </div>
              </div>
              <div className={`w-full h-2.5 ${track} rounded-full overflow-hidden`}>
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t border-[#d1e8d8] dark:border-[#30363d] grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-[#f4fcf7] dark:bg-[#0d1117] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#d1e8d8] dark:border-[#30363d]">
            <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] uppercase tracking-wider mb-1">Total Solved</div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">{totalSolved}</div>
          </div>
          <div className="bg-[#f4fcf7] dark:bg-[#0d1117] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#d1e8d8] dark:border-[#30363d]">
            <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] uppercase tracking-wider mb-1">Total Problems</div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">{totalProblems}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14 w-full animate-pulse justify-center">
      {/* Circle Skeleton */}
      <div className="relative shrink-0 flex justify-center w-full md:w-auto">
        <div className="w-[200px] h-[200px] rounded-full border-[10px] border-slate-100 dark:border-slate-800/60 flex items-center justify-center shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700/50 rounded-md"></div>
            <div className="w-10 h-3 bg-slate-200 dark:bg-slate-700/50 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Bars and Stats Skeleton */}
      <div className="flex-1 space-y-5 w-full max-w-sm">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-14 h-3.5 bg-slate-200 dark:bg-slate-700/50 rounded-md"></div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-4 bg-slate-200 dark:bg-slate-700/50 rounded-lg"></div>
                <div className="w-6 h-3 bg-slate-200 dark:bg-slate-700/50 rounded-md"></div>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-full"></div>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-3">
          <div className="h-[72px] bg-slate-100 dark:bg-slate-800/60 rounded-2xl"></div>
          <div className="h-[72px] bg-slate-100 dark:bg-slate-800/60 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}

function TopicSkeleton() {
  return (
    <div className="w-full flex flex-col mt-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="w-32 h-5 bg-slate-200 dark:bg-slate-700/50 rounded-md"></div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl self-start">
          <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700/50 rounded-lg"></div>
          <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700/50 rounded-lg"></div>
          <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700/50 rounded-lg"></div>
        </div>
      </div>
      <div className="h-[380px] bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-full"></div>
    </div>
  );
}

// ─── Main Stats Page ──────────────────────────────────────────────────────────

export default function StatsPage() {
  // Local Stats State
  const [localLoading, setLocalLoading] = useState(true);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [solvedProblems, setSolvedProblems] = useState<Set<string | number>>(new Set());
  const [totalProblemsCount, setTotalProblemsCount] = useState(0);

  // LeetCode Stats State
  const [lcUsername, setLcUsername] = useState("");
  const [inputUsername, setInputUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [lcLoading, setLcLoading] = useState(false);
  const [lcError, setLcError] = useState("");
  
  const [lcProfile, setLcProfile] = useState<LeetCodeProfile | null>(null);
  const [lcStats, setLcStats] = useState<LeetCodeStats | null>(null);
  const [lcSkills, setLcSkills] = useState<LeetCodeSkills | null>(null);
  
  const [activeTopicTab, setActiveTopicTab] = useState<"fundamental" | "intermediate" | "advanced">("fundamental");

  // Load Local Stats
  useEffect(() => {
    const loadLocalStats = async () => {
      try {
        const [progressRes, topics] = await Promise.all([
          fetchProgressSummary().catch(() => null),
          fetchTopics().catch(() => [])
        ]);

        if (progressRes) {
          setProgressSummary(progressRes.summary);
          setSolvedProblems(progressRes.solvedSet);
        }
        if (topics && topics.length > 0) {
          const total = topics.reduce((acc, t) => acc + Number(t.problem_count), 0);
          setTotalProblemsCount(total);
        }
      } catch (err) {
        console.error("Failed to load local stats", err);
      } finally {
        setLocalLoading(false);
      }
    };
    loadLocalStats();
  }, []);

  // Load LeetCode Username and Cached Data from Storage
  useEffect(() => {
    const savedUsername = localStorage.getItem("leetcode_username");
    if (savedUsername) {
      setLcUsername(savedUsername);
      setInputUsername(savedUsername);
      setIsEditingUsername(false);
      
      try {
        const cachedProfile = localStorage.getItem("leetcode_profile");
        const cachedStats = localStorage.getItem("leetcode_stats");
        const cachedSkills = localStorage.getItem("leetcode_skills");
        
        if (cachedProfile) setLcProfile(JSON.parse(cachedProfile));
        if (cachedStats) setLcStats(JSON.parse(cachedStats));
        if (cachedSkills) setLcSkills(JSON.parse(cachedSkills));
      } catch (err) {
        console.error("Failed to parse cached LeetCode data", err);
      }
    } else {
      setIsEditingUsername(true);
    }
  }, []);

  // Fetch LeetCode Data whenever username is set
  useEffect(() => {
    if (!lcUsername) return;

    const fetchLeetCodeData = async () => {
      setLcLoading(true);
      setLcError("");
      try {
        const res = await fetch(`/api/leetcode/stats?username=${lcUsername}`);
        const result = await res.json();
        
        const matchedUser = result?.data?.matchedUser;

        if (result.errors || !matchedUser) {
          setLcError(result.errors?.[0]?.message || "LeetCode user not found.");
          setLcProfile(null);
          setLcStats(null);
          setLcSkills(null);
        } else {
          const profileData = {
            username: matchedUser.username,
            name: matchedUser.profile.realName,
            avatar: matchedUser.profile.userAvatar,
            ranking: matchedUser.profile.ranking,
          };
          setLcProfile(profileData);
          localStorage.setItem("leetcode_profile", JSON.stringify(profileData));

          const ac = matchedUser.submitStats?.acSubmissionNum || [];
          const total = matchedUser.submitStats?.totalSubmissionNum || [];
          const allQs = result?.data?.allQuestionsCount || [];

          const statsData = {
            solvedProblem: ac.find((x: any) => x.difficulty === "All")?.count || 0,
            easySolved: ac.find((x: any) => x.difficulty === "Easy")?.count || 0,
            mediumSolved: ac.find((x: any) => x.difficulty === "Medium")?.count || 0,
            hardSolved: ac.find((x: any) => x.difficulty === "Hard")?.count || 0,
            totalQuestions: allQs.find((x: any) => x.difficulty === "All")?.count || 0,
            easyTotal: allQs.find((x: any) => x.difficulty === "Easy")?.count || 0,
            mediumTotal: allQs.find((x: any) => x.difficulty === "Medium")?.count || 0,
            hardTotal: allQs.find((x: any) => x.difficulty === "Hard")?.count || 0,
            totalSubmissionNum: total,
            acSubmissionNum: ac,
          };
          setLcStats(statsData);
          localStorage.setItem("leetcode_stats", JSON.stringify(statsData));

          const skillsData = {
            tagProblemCounts: matchedUser.tagProblemCounts
          };
          setLcSkills(skillsData);
          localStorage.setItem("leetcode_skills", JSON.stringify(skillsData));
        }
      } catch (err) {
        console.error("Error fetching LeetCode data", err);
        setLcError("Failed to fetch LeetCode data. Check your network or API status.");
      } finally {
        setLcLoading(false);
      }
    };

    fetchLeetCodeData();
  }, [lcUsername]);

  const handleSaveUsername = (e: FormEvent) => {
    e.preventDefault();
    if (!inputUsername.trim()) return;
    const cleanUsername = inputUsername.trim().toLowerCase();
    setLcUsername(cleanUsername);
    localStorage.setItem("leetcode_username", cleanUsername);
    setIsEditingUsername(false);
  };

  const handleDeleteUsername = () => {
    setLcUsername("");
    setInputUsername("");
    setIsEditingUsername(true);
    setLcProfile(null);
    setLcStats(null);
    setLcSkills(null);
    localStorage.removeItem("leetcode_username");
    localStorage.removeItem("leetcode_profile");
    localStorage.removeItem("leetcode_stats");
    localStorage.removeItem("leetcode_skills");
  };

  const renderTopicBar = (skill: SkillTag, maxCount: number, colorClass: string, bgClass: string) => {
    const pct = maxCount > 0 ? (skill.problemsSolved / maxCount) * 100 : 0;
    return (
      <div key={skill.tagSlug} className="mb-3">
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="font-semibold text-[#4a5568] dark:text-[#8b949e]">{skill.tagName}</span>
          <span className="font-bold text-[#1a202c] dark:text-[#f0f6fc]">{skill.problemsSolved}</span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${bgClass}`}>
          <div className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto relative bg-[#f4fcf7] dark:bg-[#161b22] m-0 sm:m-2 rounded-none sm:rounded-2xl border-0 sm:border border-[#d1e8d8] dark:border-[#30363d] shadow-sm transition-colors duration-300 [scrollbar-width:thin] [scrollbar-color:#a7c7b3_transparent] dark:[scrollbar-color:#334155_transparent]">
      <header className="sticky top-0 z-20 bg-[#f4fcf7]/80 dark:bg-[#161b22]/80 backdrop-blur-md border-b border-[#d1e8d8] dark:border-[#30363d] p-4 flex items-center justify-between transition-colors duration-300">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight flex items-center gap-2">
          <FiActivity className="text-emerald-600 dark:text-emerald-400" />
          My Stats
        </h1>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-8">
        
        {/* Local Progress Section */}
        <section className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-8">
          <div className="mb-6 border-b border-[#e2e8f0] dark:border-[#30363d] pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold tracking-tighter text-white shadow-md transition-transform duration-200 group-hover:scale-105 transform-gpu dark:bg-emerald-500">
            H
          </span>
              Heapify Progress
            </h2>
            <p className="text-sm text-[#4a5568] dark:text-[#8b949e] mt-1 ml-10">
              Your overall problem-solving journey on the Heapify platform.
            </p>
          </div>
          
          {localLoading ? (
            <div className="py-8 w-full flex justify-center"><StatsSkeleton /></div>
          ) : (
            <DifficultyArcChart 
              progressSummary={progressSummary} 
              totalProblemsCount={totalProblemsCount} 
              solvedProblems={solvedProblems} 
            />
          )}
        </section>

        {/* LeetCode Integration Section */}
        <section className="bg-white dark:bg-[#21262d] border border-amber-100 dark:border-amber-900/30 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden relative">
          
          {/* Glassmorphism Header */}
          <div className="px-5 py-6 sm:px-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-b border-amber-100 dark:border-amber-900/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <SiLeetcode className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
                    LeetCode Analytics
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4a5568] dark:text-[#8b949e]">
                    Sync your real-time LeetCode profile and topics.
                  </p>
                </div>
              </div>

              {/* Username Input/Edit */}
              {isEditingUsername ? (
                <form onSubmit={handleSaveUsername} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    placeholder="Enter LeetCode username"
                    className="px-3 py-2 text-sm rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-[#161b22] text-[#1a202c] dark:text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <button type="submit" className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-sm active:scale-95 flex items-center gap-1">
                    <FiCheck /> Save
                  </button>
                  {lcUsername && (
                    <button type="button" onClick={() => { setIsEditingUsername(false); setInputUsername(lcUsername); }} className="px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-bold">
                      Cancel
                    </button>
                  )}
                </form>
              ) : (
                <div className="flex items-center gap-3 bg-white/60 dark:bg-[#161b22]/60 px-4 py-2 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    {lcProfile?.avatar ? (
                      <img src={lcProfile.avatar} alt="avatar" className="w-6 h-6 rounded-full border border-amber-200 dark:border-amber-800" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                    <span className="text-sm font-bold text-[#1a202c] dark:text-[#f0f6fc]">{lcUsername}</span>
                  </div>
                  <div className="flex items-center gap-1 border-l border-amber-200 dark:border-amber-800/50 pl-3 ml-1">
                    <button onClick={() => setIsEditingUsername(true)} className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 transition-colors" title="Edit username">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={handleDeleteUsername} className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 dark:text-rose-400 transition-colors" title="Delete LeetCode profile">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {!lcUsername && !isEditingUsername ? (
              <div className="text-center py-10">
                <p className="text-[#4a5568] dark:text-[#8b949e] font-medium mb-4">You haven't linked a LeetCode account yet.</p>
                <button onClick={() => setIsEditingUsername(true)} className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-md active:scale-95 inline-flex items-center gap-2">
                  <SiLeetcode /> Link LeetCode Account
                </button>
              </div>
            ) : lcLoading && !lcStats ? (
              <div className="flex flex-col gap-6 w-full py-8">
                <StatsSkeleton />
                <TopicSkeleton />
              </div>
            ) : lcError && !lcStats ? (
              <div className="py-10 flex flex-col items-center justify-center text-rose-500">
                <FiAlertCircle size={36} className="mb-3" />
                <p className="font-bold">{lcError}</p>
                <button onClick={() => setIsEditingUsername(true)} className="mt-4 text-sm font-bold underline hover:text-rose-600">Change Username</button>
              </div>
            ) : lcStats ? (
              <div className="flex flex-col gap-8">
                
                {/* Solved Stats Section */}
                <div className="w-full mx-auto flex flex-col sm:flex-row items-center justify-evenly bg-slate-50 dark:bg-[#161b22] rounded-2xl p-6 border border-slate-100 dark:border-[#30363d] gap-8">
                  <LeetCodeDifficultyArcChart stats={lcStats} />
                </div>

                {/* Topics Graph Section */}
                <div className="w-full flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <h3 className="text-sm font-bold text-[#1a202c] dark:text-[#f0f6fc] uppercase tracking-wider flex items-center gap-2">
                      <FiTrendingUp className="text-amber-500" /> Topic Proficiency
                    </h3>
                    
                    {/* Tabs */}
                    {lcSkills && lcSkills.tagProblemCounts && (
                      <div className="flex bg-[#f1f5f9] dark:bg-[#0d1117] p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start">
                        {(["fundamental", "intermediate", "advanced"] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTopicTab(tab)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${activeTopicTab === tab ? "bg-white dark:bg-[#21262d] text-[#1a202c] dark:text-[#f0f6fc] shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {lcSkills && lcSkills.tagProblemCounts ? (
                    <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-4 sm:p-5 shadow-sm">
                      <div style={{ height: 380 }} className="w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={lcSkills.tagProblemCounts[activeTopicTab]}
                            layout="horizontal"
                            margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
                          >
                            <YAxis 
                              type="number"
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 600 }}
                              className="text-slate-400 dark:text-slate-500"
                            />
                            <XAxis 
                              dataKey="tagName" 
                              type="category" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }}
                              className="text-slate-600 dark:text-slate-300"
                              angle={-45}
                              textAnchor="end"
                              interval={0}
                            />
                            <Tooltip 
                              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-slate-800, #1e293b)', color: '#fff', fontWeight: 'bold' }}
                              itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="problemsSolved" radius={[4, 4, 0, 0]} barSize={30}>
                              {lcSkills.tagProblemCounts[activeTopicTab]?.map((entry, index) => {
                                const colors = {
                                  fundamental: ['#3b82f6', '#60a5fa'],
                                  intermediate: ['#14b8a6', '#2dd4bf'],
                                  advanced: ['#8b5cf6', '#a78bfa']
                                };
                                const fill = index % 2 === 0 ? colors[activeTopicTab][0] : colors[activeTopicTab][1];
                                return <Cell key={`cell-${index}`} fill={fill} />;
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-[#a0aec0] dark:text-[#64748b] text-sm font-medium italic">
                      No topic data available yet.
                    </div>
                  )}
                </div>

              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
