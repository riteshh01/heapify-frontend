"use client";

/**
 * Progress Dashboard — wired to real API data from /api/knowledge/progress/summary
 * Features:
 *   - Animated hero stats (solved, %, streak, longest streak)
 *   - Circular SVG progress gauge
 *   - Difficulty breakdown (Easy / Medium / Hard) with mini radial rings
 *   - Per-topic progress grid sorted by % completion
 *   - Recent activity feed
 *   - Skeleton loader while fetching
 */

import React, { useEffect, useRef, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { fetchProgressSummary, ProgressSummary } from "@/services/knowledgeService";
import {
  FiZap,
  FiAward,
  FiTarget,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiCalendar,
  FiBarChart2,
} from "react-icons/fi";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Animated counter ────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

// ─── Circular progress SVG ───────────────────────────────────────────────────

function CircularProgress({
  percent,
  size = 160,
  stroke = 12,
  color = "#10b981",
}: {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-[#e8f5ee] dark:text-[#21262d]"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

// ─── Mini radial ring ─────────────────────────────────────────────────────────

function MiniRing({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="relative w-12 h-12 shrink-0">
      <CircularProgress percent={percent} size={48} stroke={5} color={color} />
      <span
        className="absolute inset-0 flex items-center justify-center text-[9px] font-black"
        style={{ color }}
      >
        {percent}%
      </span>
    </div>
  );
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#e8f5ee] dark:bg-[#21262d] ${className}`}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 lg:col-span-1 rounded-3xl" />
        <Skeleton className="h-64 lg:col-span-2 rounded-3xl" />
      </div>
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const authContext = useContext(AuthContext);
  const isAuthLoading = authContext?.isLoading ?? true;
  const userData = authContext?.user;

  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    if (!userData) {
      setIsLoading(false);
      return;
    }

    fetchProgressSummary()
      .then(({ summary: s }) => setSummary(s))
      .catch((err) => setError(err?.message || "Failed to load progress"))
      .finally(() => setIsLoading(false));
  }, [isAuthLoading, userData]);

  // Animated counters (0 when no data)
  const animSolved     = useCountUp(summary?.totalSolved ?? 0);
  const animPercent    = useCountUp(summary?.completionPercent ?? 0);
  const animStreak     = useCountUp(summary?.streak?.current ?? 0);
  const animLongest    = useCountUp(summary?.streak?.longest ?? 0);
  const animTotal      = useCountUp(summary?.totalProblems ?? 0);

  if (isLoading || isAuthLoading) return <DashboardSkeleton />;

  if (!userData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <FiBarChart2 size={48} className="text-emerald-400 dark:text-emerald-500" />
        <h2 className="text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">
          Sign in to view your progress
        </h2>
        <p className="text-sm text-[#64748b] dark:text-[#8b949e] max-w-xs">
          Your DSA solving history, streaks and detailed stats appear here once you log in.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-rose-500 font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const d = summary!;
  const byTopic = [...(d.byTopic ?? [])].sort((a, b) => b.percent - a.percent);
  const recentActivity = d.recentActivity ?? [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
          Your Progress
        </h1>
        <p className="text-[#64748b] dark:text-[#8b949e] mt-1 text-sm">
          Member since {formatDate(d.memberSince ?? null)} · last solved {timeAgo(d.lastSolvedAt ?? null)}
        </p>
      </div>

      {/* ── Hero stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Solved */}
        <div className="relative overflow-hidden bg-white dark:bg-[#161b22] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl p-5 shadow-sm border-t-4 border-t-emerald-500 group hover:shadow-md transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
          <FiCheckCircle className="text-emerald-500 mb-3" size={20} />
          <div className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tabular-nums">
            {animSolved}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#8b949e] mt-1">
            Problems Solved
          </div>
        </div>

        {/* Completion % */}
        <div className="relative overflow-hidden bg-white dark:bg-[#161b22] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl p-5 shadow-sm border-t-4 border-t-sky-500 group hover:shadow-md transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-sky-500/5 group-hover:bg-sky-500/10 transition-colors" />
          <FiTarget className="text-sky-500 mb-3" size={20} />
          <div className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tabular-nums">
            {animPercent}%
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#8b949e] mt-1">
            Completion
          </div>
        </div>

        {/* Current streak */}
        <div className="relative overflow-hidden bg-white dark:bg-[#161b22] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl p-5 shadow-sm border-t-4 border-t-amber-500 group hover:shadow-md transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
          <FiZap className="text-amber-500 mb-3" size={20} />
          <div className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tabular-nums">
            {animStreak}
            <span className="text-base font-bold text-[#94a3b8] ml-1">days</span>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#8b949e] mt-1">
            Current Streak 🔥
          </div>
        </div>

        {/* Longest streak */}
        <div className="relative overflow-hidden bg-white dark:bg-[#161b22] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl p-5 shadow-sm border-t-4 border-t-violet-500 group hover:shadow-md transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-violet-500/5 group-hover:bg-violet-500/10 transition-colors" />
          <FiAward className="text-violet-500 mb-3" size={20} />
          <div className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tabular-nums">
            {animLongest}
            <span className="text-base font-bold text-[#94a3b8] ml-1">days</span>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#8b949e] mt-1">
            Best Streak 🏆
          </div>
        </div>
      </div>

      {/* ── Overall ring + Difficulty breakdown ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Circular gauge */}
        <div className="bg-white dark:bg-[#161b22] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center gap-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] dark:text-[#8b949e]">
            Overall Progress
          </p>
          <div className="relative">
            <CircularProgress percent={d.completionPercent ?? 0} size={160} stroke={14} color="#10b981" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tabular-nums">
                {animPercent}%
              </span>
              <span className="text-xs font-semibold text-[#64748b] dark:text-[#8b949e]">
                complete
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[#1a202c] dark:text-[#f0f6fc]">
              {animSolved} <span className="text-[#64748b] font-semibold">/ {animTotal}</span>
            </p>
            <p className="text-[11px] text-[#94a3b8] mt-0.5">problems solved</p>
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161b22] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] dark:text-[#8b949e] mb-5">
            Difficulty Breakdown
          </p>
          <div className="flex flex-col gap-5">
            {/* Easy */}
            <DifficultyRow
              label="Easy"
              stats={d.byDifficulty.easy}
              color="#10b981"
              barBg="bg-emerald-500"
              textColor="text-emerald-600 dark:text-emerald-400"
              ringColor="#10b981"
            />
            {/* Medium */}
            <DifficultyRow
              label="Medium"
              stats={d.byDifficulty.medium}
              color="#f59e0b"
              barBg="bg-amber-500"
              textColor="text-amber-600 dark:text-amber-400"
              ringColor="#f59e0b"
            />
            {/* Hard */}
            <DifficultyRow
              label="Hard"
              stats={d.byDifficulty.hard}
              color="#ef4444"
              barBg="bg-rose-500"
              textColor="text-rose-600 dark:text-rose-400"
              ringColor="#ef4444"
            />
          </div>
        </div>
      </div>

      {/* ── Topic progress grid ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#161b22] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <FiTrendingUp className="text-emerald-500" size={18} />
          <h2 className="text-base font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">
            Topic Breakdown
          </h2>
          <span className="ml-auto text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
            sorted by completion
          </span>
        </div>

        {byTopic.length === 0 ? (
          <p className="text-sm text-[#94a3b8] text-center py-8">No progress recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {byTopic.map((t) => (
              <div
                key={t.topicId}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#f8fffe] dark:bg-[#21262d] border border-[#e8f5ee] dark:border-[#30363d] hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-200 group"
              >
                <MiniRing
                  percent={t.percent}
                  color={t.percent === 100 ? "#10b981" : t.percent > 50 ? "#f59e0b" : "#6366f1"}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1a202c] dark:text-[#f0f6fc] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {t.topicName}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-[#e8f5ee] dark:bg-[#0d1117] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${t.percent}%`,
                          background: t.percent === 100
                            ? "#10b981"
                            : t.percent > 50
                            ? "#f59e0b"
                            : "#6366f1",
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#94a3b8] shrink-0 tabular-nums">
                      {t.solved}/{t.total}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recent activity ───────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#161b22] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <FiClock className="text-sky-500" size={18} />
          <h2 className="text-base font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">
            Recent Activity
          </h2>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <FiCalendar className="mx-auto text-[#d1e8d8] dark:text-[#30363d] mb-3" size={32} />
            <p className="text-sm text-[#94a3b8]">No problems solved yet. Start solving!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e8f5ee] dark:divide-[#30363d]">
            {recentActivity.map((item, i) => (
              <div
                key={item.problemId}
                className="flex items-center justify-between py-3 gap-4 group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center shrink-0">
                    <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1a202c] dark:text-[#f0f6fc] truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#94a3b8]">{item.topicName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      item.difficulty === "easy"
                        ? "bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                        : item.difficulty === "medium"
                        ? "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                        : "bg-rose-100/80 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"
                    }`}
                  >
                    {item.difficulty}
                  </span>
                  <span className="text-[11px] text-[#94a3b8] font-semibold hidden sm:block">
                    {timeAgo(item.solvedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Difficulty row sub-component ─────────────────────────────────────────────

function DifficultyRow({
  label,
  stats,
  color,
  barBg,
  textColor,
  ringColor,
}: {
  label: string;
  stats: { solved: number; total: number };
  color: string;
  barBg: string;
  textColor: string;
  ringColor: string;
}) {
  const pct = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;

  return (
    <div className="flex items-center gap-4">
      <MiniRing percent={pct} color={ringColor} />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1.5">
          <span className={`text-sm font-extrabold ${textColor}`}>{label}</span>
          <span className="text-xs font-bold text-[#94a3b8] tabular-nums">
            {stats.solved}
            <span className="text-[#cbd5e1]">/{stats.total}</span>
          </span>
        </div>
        <div className="w-full h-2 bg-[#f1f5f9] dark:bg-[#0d1117] rounded-full overflow-hidden">
          <div
            className={`h-full ${barBg} rounded-full transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
