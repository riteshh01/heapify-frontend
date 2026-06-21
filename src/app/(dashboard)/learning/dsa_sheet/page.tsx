"use client";

import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
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
import Spinner from "@/components/loading/Spinner";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface DashboardViewProps {
  dsaTopics: KnowledgeTopic[];
  solvedProblems: Set<string | number>;
  totalProblemsCount: number;
  progressSummary: ProgressSummary | null;
  getTopicStats: (topic: KnowledgeTopic) => { total: number; solved: number; percent: number };
  handleTopicClick: (topicId: string | number) => void;
}

interface PatternDetailViewProps {
  activePattern: KnowledgePattern | null;
  problems: KnowledgeProblem[];
  isLoading: boolean;
  solvedProblems: Set<string | number>;
  onToggle: (problemId: string | number) => void;
}

interface StatCardProps {
  label: string;
  value: string | number;
  borderColor: string;
}

type ExpandSection = "notes" | "companies" | "topic";

// ─── Main Component ───────────────────────────────────────────────────────────

const DSASheet: React.FC = () => {
  const authContext = useContext(AuthContext);
  const userData = authContext?.user;
  const isAuthLoading = authContext?.isLoading ?? true;

  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [view, setView] = useState<"dashboard" | "pattern">("dashboard");
  const [activeTopicId, setActiveTopicId] = useState<string | number | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string | number>>(new Set());
  const [solvedProblems, setSolvedProblems] = useState<Set<string | number>>(() => {
    // Restore from localStorage for instant display before API loads
    try {
      const raw = localStorage.getItem("dsa_solved_problems");
      if (raw) {
        const arr = JSON.parse(raw) as (string | number)[];
        return new Set(arr);
      }
    } catch {}
    return new Set<string | number>();
  });
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [dsaTopics, setDsaTopics] = useState<KnowledgeTopic[]>([]);
  const [patternsCache, setPatternsCache] = useState<Map<string | number, KnowledgePattern[]>>(new Map());
  const [problemsCache, setProblemsCache] = useState<Map<string | number, KnowledgeProblem[]>>(new Map());
  const [activePatternId, setActivePatternId] = useState<string | number | null>(null);
  const [loadingPatternIds, setLoadingPatternIds] = useState<Set<string | number>>(new Set());
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Single-flight ref: prevents React 18 Strict Mode double-invocation ──────
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const controller = new AbortController();

    const load = async () => {
      try {
        setIsDataLoading(true);
        setFetchError(null);

        if (userData) {
          const [topics, progressResult] = await Promise.all([
            fetchTopics(),
            fetchProgressSummary(),
          ]);
          setDsaTopics(topics);
          setProgressSummary(progressResult.summary);
          setSolvedProblems(progressResult.solvedSet);
          try {
            localStorage.setItem(
              "dsa_solved_problems",
              JSON.stringify(Array.from(progressResult.solvedSet))
            );
          } catch {}
        } else {
          const topics = await fetchTopics();
          setDsaTopics(topics);
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Failed to load DSA data:", err);
        setFetchError(
          err?.message || "Failed to load topics. Please check if the server is running."
        );
      } finally {
        setIsDataLoading(false);
      }
    };

    load();

    return () => {
      controller.abort();
    };
  }, [isAuthLoading, userData]);

  // ── Toggle problem solved status ──────────────────────────────────────────
  const updateSolvedProblems = async (problemId: string | number) => {
    const prev = new Set(solvedProblems);
    const next = new Set(solvedProblems);
    next.has(problemId) ? next.delete(problemId) : next.add(problemId);
    setSolvedProblems(next);

    try {
      localStorage.setItem("dsa_solved_problems", JSON.stringify(Array.from(next)));
    } catch {}

    try {
      await toggleProblem(problemId);
    } catch (err) {
      setSolvedProblems(prev);
      try {
        localStorage.setItem("dsa_solved_problems", JSON.stringify(Array.from(prev)));
      } catch {}
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

  const getTopicStats = (topic: KnowledgeTopic) => {
    const total = Number(topic.problem_count);
    const patterns = patternsCache.get(topic.id);
    if (!patterns) return { total, solved: 0, percent: 0 };

    const solved = patterns.reduce((acc, p) => {
      const problems = problemsCache.get(p.id) ?? [];
      return acc + problems.filter((prob) => solvedProblems.has(prob.id)).length;
    }, 0);

    return {
      total,
      solved,
      percent: total === 0 ? 0 : Math.round((solved / total) * 100),
    };
  };

  const totalProblemsCount = useMemo(
    () => dsaTopics.reduce((acc, t) => acc + Number(t.problem_count), 0),
    [dsaTopics]
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isDataLoading) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#e8f5ee] dark:bg-[#0d1117]">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white dark:bg-[#161b22] px-10 py-8 shadow-sm border border-[#d1e8d8] dark:border-[#30363d]">
          <Spinner />
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#1a202c] dark:text-[#f0f6fc]">
              Loading DSA Sheet
            </h3>
            <p className="mt-1 text-sm font-medium text-[#4a5568] dark:text-[#8b949e]">
              Fetching problems, progress and statistics...
            </p>
          </div>
        </div>
      </div>
    );
  }

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

  // ── Main render ───────────────────────────────────────────────────────────
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
              {solvedProblems.size} Solved Problems
            </span>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-8 md:px-8 md:py-10">
          {view === "dashboard" ? (
            <DashboardView
              dsaTopics={dsaTopics}
              solvedProblems={solvedProblems}
              totalProblemsCount={totalProblemsCount}
              progressSummary={progressSummary}
              getTopicStats={getTopicStats}
              handleTopicClick={handleTopicClick}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

const DashboardView: React.FC<DashboardViewProps> = ({
  dsaTopics,
  solvedProblems,
  totalProblemsCount,
  progressSummary,
  getTopicStats,
  handleTopicClick,
}) => (
  <div>
    <div className="mb-8 border-b border-[#d1e8d8] dark:border-[#30363d] pb-6">
      <h1 className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight mb-2">
        DSA Progress Tracker
      </h1>
      <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e]">
        Track your problem-solving journey across all topics.
      </p>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <StatCard label="Total Problems" value={totalProblemsCount} borderColor="#10b981" />
      <StatCard label="Solved" value={solvedProblems.size} borderColor="#059669" />
      <StatCard
        label="Completion"
        value={`${progressSummary?.completionPercent ?? (totalProblemsCount > 0
          ? Math.round((solvedProblems.size / totalProblemsCount) * 100)
          : 0)}%`}
        borderColor="#0ea5e9"
      />
      <StatCard
        label="🔥 Streak"
        value={progressSummary ? `${progressSummary.streak.current}d` : `${dsaTopics.length} topics`}
        borderColor="#f59e0b"
      />
    </div>

    {/* Topics grid */}
    {dsaTopics.length === 0 ? (
      <div className="text-center py-16 bg-white dark:bg-[#21262d] rounded-3xl border border-[#d1e8d8] dark:border-[#30363d]">
        <p className="text-[#4a5568] dark:text-[#8b949e] text-sm font-semibold">
          No topics found. Make sure the backend is seeded with data.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {dsaTopics.map((topic) => {
          const serverStats = progressSummary?.byTopic.find(
            (t) => String(t.topicId) === String(topic.id)
          );
          const stats = serverStats
            ? { total: serverStats.total, solved: serverStats.solved, percent: serverStats.percent }
            : getTopicStats(topic);
          return (
            <div
              key={topic.id}
              onClick={() => handleTopicClick(topic.id)}
              className="group bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] hover:border-emerald-500 dark:hover:border-emerald-500 p-6 rounded-3xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-5">
                <h3 className="text-base font-bold text-[#1a202c] dark:text-[#f0f6fc] leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {topic.name}
                </h3>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50 shrink-0 ml-3">
                  {stats.percent}%
                </span>
              </div>

              <div className="w-full h-2 bg-[#e8f5ee] dark:bg-[#0d1117] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 dark:bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
              <p className="text-[11px] text-[#4a5568] dark:text-[#8b949e] mt-3 uppercase font-bold tracking-wider">
                {stats.solved} / {stats.total} Problems
              </p>
            </div>
          );
        })}
      </div>
    )}
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
      className={`border-b border-[#e8f5ee] dark:border-[#30363d] last:border-b-0 transition-colors duration-200 ${
        isExpanded ? "bg-[#f0faf4] dark:bg-[#1c2630]" : "hover:bg-[#f4fcf7] dark:hover:bg-[#30363d]/50"
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
            className={`text-sm font-bold transition-all truncate ${
              isSolved
                ? "text-[#a0aec0] dark:text-[#64748b] line-through decoration-[#a7c7b3] dark:decoration-[#334155]"
                : "text-[#1a202c] dark:text-[#f0f6fc] hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            {prob.title}
          </a>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide shrink-0 border ${
              prob.difficulty === "easy"
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
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 ${
                isExpanded && expandedSection === "notes"
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 ${
              isExpanded && expandedSection === "companies"
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 ${
              isExpanded && expandedSection === "topic"
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
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Loading problems...</p>
      </div>
    );

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

const StatCard: React.FC<StatCardProps> = ({ label, value, borderColor }) => (
  <div
    className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] p-5 rounded-2xl shadow-sm border-t-4 transition-colors duration-300"
    style={{ borderTopColor: borderColor }}
  >
    <div className="text-[11px] text-[#4a5568] dark:text-[#8b949e] font-bold uppercase tracking-wider mb-2">
      {label}
    </div>
    <div className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">
      {value}
    </div>
  </div>
);

export default DSASheet;