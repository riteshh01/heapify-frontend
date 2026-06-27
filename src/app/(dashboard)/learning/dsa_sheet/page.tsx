"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  fetchTopics,
  fetchPatterns,
  fetchProblems,
  fetchProgressSummary,
  fetchProblemTags,
  toggleProblem,
  KnowledgeTopic,
  KnowledgePattern,
  KnowledgeProblem,
  ProblemTag,
  ProgressSummary,
} from "@/services/knowledgeService";
import {
  FiMenu,
  FiX,
  FiCheckCircle,
  FiCircle,
  FiExternalLink,
  FiTrendingUp,
  FiAlertCircle,
  FiFileText,
  FiTag,
  FiChevronDown,
} from "react-icons/fi";
import { HiOfficeBuilding } from "react-icons/hi";
import DSASidebar from "@/components/layout/Sidebar";
import { DSALoader, DSAFullLoader } from "@/components/loading/Spinner";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface DashboardViewProps {
  progressSummary: ProgressSummary | null;
  totalProblemsCount: number;
  solvedProblems: Set<string | number>;
}

interface PatternDetailViewProps {
  activePattern: KnowledgePattern | null;
  problems: KnowledgeProblem[];
  isLoading: boolean;
  solvedProblems: Set<string | number>;
  onToggle: (problemId: string | number) => void;
}

type ExpandSection = "notes" | "companies" | "topic";

// ─── Main Component ───────────────────────────────────────────────────────────

const DSASheet: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [view, setView] = useState<"dashboard" | "pattern">("dashboard");
  const [activeTopicId, setActiveTopicId] = useState<string | number | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string | number>>(new Set());

  // ── Solved problems — hydrate from localStorage instantly for zero-delay display ──
  const [solvedProblems, setSolvedProblems] = useState<Set<string | number>>(() => {
    try {
      const raw = localStorage.getItem("dsa_solved_problems");
      if (raw) return new Set(JSON.parse(raw) as (string | number)[]);
    } catch { }
    return new Set<string | number>();
  });

  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [dsaTopics, setDsaTopics] = useState<KnowledgeTopic[]>([]);
  const [patternsCache, setPatternsCache] = useState<Map<string | number, KnowledgePattern[]>>(new Map());
  const [problemsCache, setProblemsCache] = useState<Map<string | number, KnowledgeProblem[]>>(new Map());
  const [activePatternId, setActivePatternId] = useState<string | number | null>(null);
  const [loadingPatternIds, setLoadingPatternIds] = useState<Set<string | number>>(new Set());

  // ── Single loading flag: true until BOTH topics and progress have resolved ──
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Single-flight ref: prevents React 18 Strict Mode double-invocation ──────
  const hasFetchedRef = useRef(false);

  // ── Background pattern prefetch — fires after topics arrive ─────────────────
  const prefetchAllPatterns = (topics: KnowledgeTopic[]) => {
    topics.forEach(async (topic) => {
      try {
        const patterns = await fetchPatterns(topic.id);
        setPatternsCache((prev) => {
          if (prev.has(topic.id)) return prev;
          return new Map(prev).set(topic.id, patterns);
        });
      } catch { }
    });
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    // ── Fire topics and progress IN PARALLEL immediately on mount — no auth gate ──
    // Cookies are in the browser; api.ts interceptor handles 401→refresh.
    // Both run concurrently; the page spinner drops only after both resolve.
    let topicsDone = false;
    let progressDone = false;

    const checkDone = () => {
      if (topicsDone && progressDone) setIsDataLoading(false);
    };

    fetchTopics()
      .then((topics) => {
        setDsaTopics(topics);
        topicsDone = true;
        checkDone();
        // Background pattern prefetch — patterns are cached before user clicks
        prefetchAllPatterns(topics);
      })
      .catch((err) => {
        console.error("Failed to load topics:", err);
        setFetchError(err?.message || "Failed to load topics. Please check if the server is running.");
        topicsDone = true;
        checkDone();
      });

    fetchProgressSummary()
      .then((result) => {
        setProgressSummary(result.summary);
        setSolvedProblems(result.solvedSet);
        try {
          localStorage.setItem("dsa_solved_problems", JSON.stringify(Array.from(result.solvedSet)));
        } catch { }
        progressDone = true;
        checkDone();
      })
      .catch((err) => {
        console.error("Failed to load progress:", err);
        progressDone = true;
        checkDone();
      });

  }, []);

  // ── Toggle problem solved status (optimistic UI) ──────────────────────────
  const updateSolvedProblems = async (problemId: string | number) => {
    const prev = new Set(solvedProblems);
    const next = new Set(solvedProblems);
    next.has(problemId) ? next.delete(problemId) : next.add(problemId);
    setSolvedProblems(next);

    try {
      localStorage.setItem("dsa_solved_problems", JSON.stringify(Array.from(next)));
    } catch { }

    try {
      await toggleProblem(problemId);
    } catch (err) {
      setSolvedProblems(prev);
      try {
        localStorage.setItem("dsa_solved_problems", JSON.stringify(Array.from(prev)));
      } catch { }
      console.error("Failed to save progress:", err);
    }
  };

  // ── Navigation helpers ────────────────────────────────────────────────────
  const handleDashboardClick = () => {
    setView("dashboard");
    setActiveTopicId(null);
    setActivePatternId(null);
  };

  const handleTopicClick = async (topicId: string | number) => {
    setActiveTopicId(topicId);
    const newExpanded = new Set(expandedTopics);
    newExpanded.has(topicId) ? newExpanded.delete(topicId) : newExpanded.add(topicId);
    setExpandedTopics(newExpanded);

    if (!patternsCache.has(topicId)) {
      try {
        const patterns = await fetchPatterns(topicId);
        setPatternsCache((prev) => new Map(prev).set(topicId, patterns));
      } catch (err) {
        console.error("Failed to load patterns:", err);
        setPatternsCache((prev) => new Map(prev).set(topicId, []));
      }
    }
  };

  const handlePatternClick = async (patternId: string | number) => {
    setView("pattern");
    setActivePatternId(patternId);

    if (!problemsCache.has(patternId)) {
      setLoadingPatternIds((prev) => new Set(prev).add(patternId));
      try {
        const problems = await fetchProblems(patternId);
        setProblemsCache((prev) => new Map(prev).set(patternId, problems));
      } catch (err) {
        console.error("Failed to load problems:", err);
        setProblemsCache((prev) => new Map(prev).set(patternId, []));
      } finally {
        setLoadingPatternIds((prev) => {
          const s = new Set(prev);
          s.delete(patternId);
          return s;
        });
      }
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const currentPattern = useMemo(() => {
    if (!activePatternId) return null;
    for (const patterns of Array.from(patternsCache.values())) {
      const found = patterns.find((p) => p.id === activePatternId);
      if (found) return found;
    }
    return null;
  }, [activePatternId, patternsCache]);

  const totalProblemsCount = useMemo(
    () => dsaTopics.reduce((acc, t) => acc + Number(t.problem_count), 0),
    [dsaTopics]
  );

  // ── Full-page skeleton while initial data loads ──
  if (isDataLoading) return <DSAFullLoader />;

  // ── Error state ───────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#e8f5ee] dark:bg-[#0d1117]">
        <div className="max-w-md text-center bg-white dark:bg-[#161b22] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-8 shadow-sm">
          <FiAlertCircle size={36} className="text-rose-500 dark:text-rose-400 mx-auto mb-4" />
          <h2 className="font-bold text-xl text-[#1a202c] dark:text-[#f0f6fc] mb-2">Could not load data</h2>
          <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mb-6">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // ── Main render — layout is shown immediately ──────────────────────────────
  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#e8f5ee] dark:bg-[#0d1117] text-[#2d3748] dark:text-[#e2e8f0] overflow-hidden font-sans transition-colors duration-300">

      {/* Sidebar */}
      <DSASidebar
        isSidebarOpen={isSidebarOpen}
        view={view}
        handleDashboardClick={handleDashboardClick}
        handleTopicClick={handleTopicClick}
        handlePatternClick={handlePatternClick}
        activeTopicId={activeTopicId}
        activePatternId={activePatternId}
        expandedTopics={expandedTopics}
        dsaTopics={dsaTopics}
        patternsCache={patternsCache}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-[#f4fcf7] dark:bg-[#161b22] m-2 rounded-2xl border border-[#d1e8d8] dark:border-[#30363d] shadow-sm transition-colors duration-300 [scrollbar-width:thin] [scrollbar-color:#a7c7b3_transparent] dark:[scrollbar-color:#334155_transparent]">

        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#f4fcf7] dark:bg-[#161b22] border-b border-[#d1e8d8] dark:border-[#30363d] p-4 flex items-center justify-between transition-colors duration-300">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-xl shadow-sm hover:bg-[#e8f5ee] dark:hover:bg-[#30363d] active:scale-95 transition-all duration-200"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen
              ? <FiX size={18} className="text-emerald-600 dark:text-emerald-400" />
              : <FiMenu size={18} className="text-[#4a5568] dark:text-[#8b949e]" />}
          </button>

          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-full shadow-sm transition-colors duration-300">
            <FiTrendingUp className="text-emerald-600 dark:text-emerald-400" size={14} />
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wide">
              {solvedProblems.size} Problems Solved
            </span>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-8 md:px-8 md:py-10">
          {view === "dashboard" ? (
            <DashboardView
              progressSummary={progressSummary}
              totalProblemsCount={totalProblemsCount}
              solvedProblems={solvedProblems}
            />
          ) : (
            <PatternDetailView
              activePattern={currentPattern}
              problems={problemsCache.get(activePatternId!) ?? []}
              isLoading={activePatternId !== null ? loadingPatternIds.has(activePatternId) : false}
              solvedProblems={solvedProblems}
              onToggle={updateSolvedProblems}
            />
          )}
        </div>
      </main>
    </div>
  );
};

// ─── Difficulty Arc Chart ─────────────────────────────────────────────────────
// A unique segmented-arc chart styled differently from LeetCode:
// three concentric arcs (easy / medium / hard) fill up based on solved ratio.

function DifficultyArcChart({ progressSummary, totalProblemsCount, solvedProblems }: DashboardViewProps) {
  const summary = progressSummary;
  const totalSolved = summary?.totalSolved ?? solvedProblems.size;
  const totalProblems = summary?.totalProblems ?? totalProblemsCount;

  const easy = summary?.byDifficulty.easy ?? { solved: 0, total: 0 };
  const medium = summary?.byDifficulty.medium ?? { solved: 0, total: 0 };
  const hard = summary?.byDifficulty.hard ?? { solved: 0, total: 0 };

  const overallPct = totalProblems > 0 ? (totalSolved / totalProblems) : 0;

  // SVG arc helper — draws a partial circle arc
  // cx, cy = center; r = radius; pct = 0..1 fill ratio; startAngle in degrees
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

  // Track arc (gray background)
  function trackArc(cx: number, cy: number, r: number, startAngle = -210, sweepAngle = 240) {
    return describeArc(cx, cy, r, 1, startAngle, sweepAngle);
  }

  const cx = 110;
  const cy = 110;

  return (
    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
      {/* SVG Arc chart */}
      <div className="relative shrink-0">
        <svg width={220} height={220} viewBox="0 0 220 220">
          {/* Easy — outermost arc */}
          <path d={trackArc(cx, cy, 90)} fill="none" stroke="#d1fae5" strokeWidth={10} strokeLinecap="round"
            className="dark:stroke-emerald-900/40" />
          <path d={describeArc(cx, cy, 90, easy.total > 0 ? easy.solved / easy.total : 0)}
            fill="none" stroke="#10b981" strokeWidth={10} strokeLinecap="round"
            className="transition-all duration-700" />

          {/* Medium — middle arc */}
          <path d={trackArc(cx, cy, 73)} fill="none" stroke="#fef3c7" strokeWidth={10} strokeLinecap="round"
            className="dark:stroke-amber-900/40" />
          <path d={describeArc(cx, cy, 73, medium.total > 0 ? medium.solved / medium.total : 0)}
            fill="none" stroke="#f59e0b" strokeWidth={10} strokeLinecap="round"
            className="transition-all duration-700" />

          {/* Hard — innermost arc */}
          <path d={trackArc(cx, cy, 56)} fill="none" stroke="#fee2e2" strokeWidth={10} strokeLinecap="round"
            className="dark:stroke-rose-900/40" />
          <path d={describeArc(cx, cy, 56, hard.total > 0 ? hard.solved / hard.total : 0)}
            fill="none" stroke="#ef4444" strokeWidth={10} strokeLinecap="round"
            className="transition-all duration-700" />

          {/* Centre: total solved */}
          <text x={cx} y={cy - 10} textAnchor="middle" className="fill-[#1a202c] dark:fill-[#f0f6fc]"
            fontSize={32} fontWeight={800} fontFamily="inherit">
            {totalSolved}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-[#4a5568] dark:fill-[#8b949e]"
            fontSize={11} fontWeight={600} fontFamily="inherit">
            / {totalProblems}
          </text>
          <text x={cx} y={cy + 28} textAnchor="middle" className="fill-[#a0aec0] dark:fill-[#64748b]"
            fontSize={10} fontFamily="inherit" fontWeight={500}>
            solved
          </text>

          {/* Overall % badge at bottom of arc */}
          <text x={cx} y={200} textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400"
            fontSize={12} fontWeight={700} fontFamily="inherit">
            {Math.round(overallPct * 100)}% complete
          </text>
        </svg>
      </div>

      {/* Difficulty legend + bars */}
      <div className="flex-1 space-y-5 w-full max-w-sm">
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
                <div
                  className={`h-full ${color} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Overall stats row */}
        <div className="pt-4 border-t border-[#d1e8d8] dark:border-[#30363d] grid grid-cols-2 gap-3">
          <div className="bg-[#f4fcf7] dark:bg-[#0d1117] rounded-2xl p-4 border border-[#d1e8d8] dark:border-[#30363d]">
            <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] uppercase tracking-wider mb-1">Total Solved</div>
            <div className="text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">{totalSolved}</div>
          </div>
          <div className="bg-[#f4fcf7] dark:bg-[#0d1117] rounded-2xl p-4 border border-[#d1e8d8] dark:border-[#30363d]">
            <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] uppercase tracking-wider mb-1">Total Problems</div>
            <div className="text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">{totalProblems}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

const DashboardView: React.FC<DashboardViewProps> = (props) => (
  <div>
    <div className="mb-8 border-b border-[#d1e8d8] dark:border-[#30363d] pb-6">
      <h1 className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight mb-2">
        DSA Progress Tracker
      </h1>
      <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e]">
        Track your problem-solving journey across all difficulty levels.
      </p>
    </div>

    {/* Difficulty progress chart */}
    <div className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl shadow-sm p-8">
      <DifficultyArcChart {...props} />
    </div>
  </div>
);

// ─── Expandable Problem Row ───────────────────────────────────────────────────

interface ProblemRowProps {
  prob: KnowledgeProblem;
  idx: number;
  isSolved: boolean;
  onToggle: (id: string | number) => void;
  expandedRowId: string | number | null;
  expandedSection: ExpandSection | null;
  onExpand: (probId: string | number, section: ExpandSection) => void;
  tagsCache: Map<string | number, ProblemTag[]>;
  loadingTagIds: Set<string | number>;
}

const ProblemRow: React.FC<ProblemRowProps> = ({
  prob,
  idx,
  isSolved,
  onToggle,
  expandedRowId,
  expandedSection,
  onExpand,
  tagsCache,
  loadingTagIds,
}) => {
  const isExpanded = expandedRowId === prob.id;
  const hasNotes = Boolean(prob.notes?.trim());
  const tags = tagsCache.get(prob.id) ?? [];
  const companyTags = tags.filter((t) => t.tag_type === "company");
  const topicTags = tags.filter((t) => t.tag_type === "topic");
  const isLoadingTags = loadingTagIds.has(prob.id);

  return (
    <div
      className={`border-b border-[#e8f5ee] dark:border-[#30363d] last:border-b-0 transition-colors duration-200 ${isExpanded ? "bg-[#f0faf4] dark:bg-[#1c2630]" : "hover:bg-[#f4fcf7] dark:hover:bg-[#30363d]/50"
        }`}
    >
      {/* Main row */}
      <div className="px-6 py-4 flex items-center gap-3 group">
        {/* Index */}
        <span className="text-[11px] font-bold text-[#a0aec0] dark:text-[#8b949e] w-5 text-right shrink-0">
          {idx + 1}
        </span>

        {/* Checkbox */}
        <button
          onClick={() => onToggle(prob.id)}
          className="transition-all hover:scale-110 shrink-0 outline-none"
          title={isSolved ? "Mark as unsolved" : "Mark as solved"}
        >
          {isSolved ? (
            <FiCheckCircle className="text-emerald-500 dark:text-emerald-400" size={20} />
          ) : (
            <FiCircle className="text-[#a7c7b3] dark:text-[#64748b] hover:text-emerald-500 dark:hover:text-emerald-500 transition-colors" size={20} />
          )}
        </button>

        {/* Title + Difficulty */}
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2 min-w-0">
          <a
            href={prob.problemLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-bold transition-all truncate ${isSolved
                ? "text-[#a0aec0] dark:text-[#64748b] line-through decoration-[#a7c7b3] dark:decoration-[#334155]"
                : "text-[#1a202c] dark:text-[#f0f6fc] hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
          >
            {prob.title}
          </a>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide shrink-0 border ${prob.difficulty === "easy"
                ? "bg-emerald-100/80 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"
                : prob.difficulty === "medium"
                  ? "bg-amber-100/80 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
                  : "bg-rose-100/80 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50"
              }`}
          >
            {prob.difficulty}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {/* Notes button — only show if notes exist */}
          {hasNotes && (
            <button
              onClick={() => onExpand(prob.id, "notes")}
              title="View notes"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 ${isExpanded && expandedSection === "notes"
                  ? "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700/50"
                  : "bg-white text-[#6b7280] border-[#d1e8d8] hover:bg-violet-50 hover:text-violet-600 hover:border-violet-300 dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-violet-900/20 dark:hover:text-violet-400"
                }`}
            >
              <FiFileText size={10} />
              Notes
              <FiChevronDown
                size={9}
                className={`transition-transform duration-200 ${isExpanded && expandedSection === "notes" ? "rotate-180" : ""}`}
              />
            </button>
          )}

          {/* Companies button */}
          <button
            onClick={() => onExpand(prob.id, "companies")}
            title="View company tags"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 ${isExpanded && expandedSection === "companies"
                ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50"
                : "bg-white text-[#6b7280] border-[#d1e8d8] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              }`}
          >
            <HiOfficeBuilding size={10} />
            Companies
            <FiChevronDown
              size={9}
              className={`transition-transform duration-200 ${isExpanded && expandedSection === "companies" ? "rotate-180" : ""}`}
            />
          </button>

          {/* Topic tags button */}
          <button
            onClick={() => onExpand(prob.id, "topic")}
            title="View topic tags"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 ${isExpanded && expandedSection === "topic"
                ? "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700/50"
                : "bg-white text-[#6b7280] border-[#d1e8d8] hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
              }`}
          >
            <FiTag size={10} />
            Topics
            <FiChevronDown
              size={9}
              className={`transition-transform duration-200 ${isExpanded && expandedSection === "topic" ? "rotate-180" : ""}`}
            />
          </button>

          {/* External link */}
          <a
            href={prob.problemLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Open problem"
            className="p-1.5 rounded-lg text-[#a7c7b3] dark:text-[#64748b] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
          >
            <FiExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Expandable detail panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-6 pb-5 pt-1">
          {/* Notes section */}
          {expandedSection === "notes" && (
            <div className="rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiFileText size={12} className="text-violet-600 dark:text-violet-400" />
                <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                  Notes
                </span>
              </div>
              <p className="text-sm text-[#374151] dark:text-[#d1d5db] leading-relaxed whitespace-pre-wrap">
                {prob.notes || "No notes available."}
              </p>
            </div>
          )}

          {/* Companies section */}
          {expandedSection === "companies" && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <HiOfficeBuilding size={12} className="text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  Asked By Companies
                </span>
              </div>
              {isLoadingTags ? (
                <div className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400">
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              ) : companyTags.length === 0 ? (
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] italic">
                  No company tags for this problem yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {companyTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Topic tags section */}
          {expandedSection === "topic" && (
            <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiTag size={12} className="text-orange-600 dark:text-orange-400" />
                <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                  Topic Tags
                </span>
              </div>
              {isLoadingTags ? (
                <div className="flex items-center gap-2 text-sm text-orange-500 dark:text-orange-400">
                  <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              ) : topicTags.length === 0 ? (
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] italic">
                  No topic tags for this problem yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topicTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700/50 hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Pattern Detail View ──────────────────────────────────────────────────────

const PatternDetailView: React.FC<PatternDetailViewProps> = ({
  activePattern,
  problems,
  isLoading,
  solvedProblems,
  onToggle,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(null);
  const [expandedSection, setExpandedSection] = useState<ExpandSection | null>(null);
  const [tagsCache, setTagsCache] = useState<Map<string | number, ProblemTag[]>>(new Map());
  const [loadingTagIds, setLoadingTagIds] = useState<Set<string | number>>(new Set());

  // Reset expansion when pattern changes
  useEffect(() => {
    setExpandedRowId(null);
    setExpandedSection(null);
  }, [activePattern?.id]);

  const handleExpand = async (probId: string | number, section: ExpandSection) => {
    // Toggle off if same row + same section
    if (expandedRowId === probId && expandedSection === section) {
      setExpandedRowId(null);
      setExpandedSection(null);
      return;
    }

    // Switch row or section
    setExpandedRowId(probId);
    setExpandedSection(section);

    // Fetch tags lazily for companies / topic sections
    if ((section === "companies" || section === "topic") && !tagsCache.has(probId)) {
      setLoadingTagIds((prev) => new Set(prev).add(probId));
      try {
        const tags = await fetchProblemTags(probId);
        setTagsCache((prev) => new Map(prev).set(probId, tags));
      } catch (err) {
        console.error("Failed to fetch tags:", err);
        setTagsCache((prev) => new Map(prev).set(probId, []));
      } finally {
        setLoadingTagIds((prev) => {
          const s = new Set(prev);
          s.delete(probId);
          return s;
        });
      }
    }
  };

  if (!activePattern) return null;

  if (isLoading) return <DSALoader />;

  const solvedCount = problems.filter((p) => solvedProblems.has(p.id)).length;

  return (
    <div>
      {/* Pattern Header */}
      <div className="mb-8 p-6 bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl shadow-sm">
        <p className="text-[11px] text-[#4a5568] dark:text-[#8b949e] uppercase font-bold tracking-[0.15em] mb-2">
          Pattern Breakdown
        </p>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">{activePattern.name}</h1>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50 shrink-0">
            {solvedCount} / {problems.length} solved
          </span>
        </div>
        {activePattern.description && (
          <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mt-2 leading-relaxed">
            {activePattern.description}
          </p>
        )}
        {/* Mini progress bar */}
        {problems.length > 0 && (
          <div className="mt-4 w-full h-1.5 bg-[#e8f5ee] dark:bg-[#0d1117] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.round((solvedCount / problems.length) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Problems List */}
      <div className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl shadow-sm overflow-hidden">
        {/* Column header */}
        <div className="px-6 py-2.5 bg-[#f4fcf7] dark:bg-[#1c2228] border-b border-[#e8f5ee] dark:border-[#30363d] flex items-center gap-3">
          <span className="w-5" />
          <span className="w-5" />
          <span className="flex-1 text-[10px] font-bold text-[#6b7280] dark:text-[#8b949e] uppercase tracking-wider">Problem</span>
          <span className="text-[10px] font-bold text-[#6b7280] dark:text-[#8b949e] uppercase tracking-wider mr-1">Actions</span>
        </div>

        {problems.length === 0 ? (
          <div className="p-10 text-center text-sm font-medium text-[#4a5568] dark:text-[#8b949e]">
            No problems found for this pattern.
          </div>
        ) : (
          <div>
            {problems.map((prob, idx) => (
              <ProblemRow
                key={prob.id}
                prob={prob}
                idx={idx}
                isSolved={solvedProblems.has(prob.id)}
                onToggle={onToggle}
                expandedRowId={expandedRowId}
                expandedSection={expandedSection}
                onExpand={handleExpand}
                tagsCache={tagsCache}
                loadingTagIds={loadingTagIds}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DSASheet;