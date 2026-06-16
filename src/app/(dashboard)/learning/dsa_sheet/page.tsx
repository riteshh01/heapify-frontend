"use client";

import React, { useState, useMemo, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  fetchTopics,
  fetchPatterns,
  fetchProblems,
  fetchProgress,
  toggleProblem,
  KnowledgeTopic,
  KnowledgePattern,
  KnowledgeProblem,
} from "@/services/knowledgeService";
import {
  FiMenu,
  FiX,
  FiCheckCircle,
  FiCircle,
  FiExternalLink,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";
import DSASidebar from "@/components/layout/Sidebar";
import Spinner  from "@/components/loading/Spinner";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface DashboardViewProps {
  dsaTopics: KnowledgeTopic[];
  solvedProblems: Set<string | number>;
  totalProblemsCount: number;
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

// ─── Main Component ───────────────────────────────────────────────────────────

const DSASheet: React.FC = () => {
  const authContext = useContext(AuthContext);
  const userData = authContext?.user;

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
  const [dsaTopics, setDsaTopics] = useState<KnowledgeTopic[]>([]);
  const [patternsCache, setPatternsCache] = useState<Map<string | number, KnowledgePattern[]>>(new Map());
  const [problemsCache, setProblemsCache] = useState<Map<string | number, KnowledgeProblem[]>>(new Map());
  const [activePatternId, setActivePatternId] = useState<string | number | null>(null);
  const [loadingPatternIds, setLoadingPatternIds] = useState<Set<string | number>>(new Set());
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Fetch topics on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setIsDataLoading(true);
        setFetchError(null);
        const topics = await fetchTopics();
        setDsaTopics(topics);
      } catch (err: any) {
        console.error("Failed to load DSA topics:", err);
        setFetchError(err?.message || "Failed to load topics. Please check if the server is running.");
      } finally {
        setIsDataLoading(false);
      }
    };
    load();
  }, []);

  // ── Fetch user progress (JWT protected) ───────────────────────────────────
  useEffect(() => {
    if (!userData) return;
    const load = async () => {
      try {
        const solved = await fetchProgress();
        setSolvedProblems(solved);
        // Sync localStorage with latest server data
        try {
          localStorage.setItem("dsa_solved_problems", JSON.stringify(Array.from(solved)));
        } catch {}
      } catch (err) {
        console.error("Failed to load progress:", err);
        // Keep the localStorage-restored set as fallback
      }
    };
    load();
  }, [userData]);

  // ── Toggle problem solved status ──────────────────────────────────────────
  const updateSolvedProblems = async (problemId: string | number) => {
    // Optimistic update
    const prev = new Set(solvedProblems);
    const next = new Set(solvedProblems);
    next.has(problemId) ? next.delete(problemId) : next.add(problemId);
    setSolvedProblems(next);
    // Persist optimistically to localStorage
    try {
      localStorage.setItem("dsa_solved_problems", JSON.stringify(Array.from(next)));
    } catch {}

    try {
      await toggleProblem(problemId);
    } catch (err) {
      // Rollback on failure (both state and localStorage)
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
        // Set empty array so sidebar doesn't re-fetch
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
    <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-slate-100 dark:bg-[#0a0f1a]">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white dark:bg-[#111827] px-10 py-8 shadow-lg border border-slate-200 dark:border-slate-700">
        <Spinner />

        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Loading DSA Sheet
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#e2e8f0] dark:bg-[#0a0f1a]">
        <div className="max-w-md text-center bg-white dark:bg-[#1e293b] border border-red-300 dark:border-red-500/30 rounded-xl p-8 shadow-sm">
          <FiAlertCircle size={32} className="text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="font-bold text-[#334155] dark:text-[#f1f5f9] mb-2">Could not load data</h2>
          <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mb-6">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded bg-[#3b5998] dark:bg-[#2563eb] text-white font-bold text-sm hover:bg-[#2d4373] dark:hover:bg-[#1d4ed8] transition-all shadow-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#e2e8f0] dark:bg-[#0a0f1a] text-[#333] dark:text-[#e2e8f0] overflow-hidden font-sans transition-colors duration-300">

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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#fff] dark:bg-[#0f172a] m-2 rounded-lg border border-[#cbd5e1] dark:border-[#1e3a5f] shadow-sm dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] transition-colors duration-300 [scrollbar-width:thin] [scrollbar-color:#94a3b8_transparent] dark:[scrollbar-color:#334155_transparent]">

        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#f8fafc]/90 dark:bg-[#0f172a]/90 backdrop-blur-sm border-b border-[#e2e8f0] dark:border-[#1e3a5f] p-4 flex items-center justify-between transition-colors duration-300">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-lg shadow-sm hover:bg-[#f1f5f9] dark:hover:bg-[#253348] active:scale-95 transition-all duration-200"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen
              ? <FiX size={18} className="text-[#3b5998] dark:text-[#7dd3fc]" />
              : <FiMenu size={18} className="text-[#475569] dark:text-[#cbd5e1]" />}
          </button>

          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-[#1e293b] border border-blue-200 dark:border-[#334155] rounded-full shadow-inner transition-colors duration-300">
            <FiTrendingUp className="text-[#3b5998] dark:text-[#7dd3fc]" size={14} />
            <span className="text-xs font-bold text-[#334155] dark:text-[#94a3b8]">
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
  getTopicStats,
  handleTopicClick,
}) => (
  <div>
    <div className="mb-8 border-b border-[#e2e8f0] dark:border-[#1e3a5f] pb-6">
      <h1 className="text-3xl font-bold text-[#1e293b] dark:text-[#f8fafc] tracking-tight mb-2">
        DSA Progress Tracker
      </h1>
      <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">
        Track your problem-solving journey across all topics.
      </p>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <StatCard label="Total Problems" value={totalProblemsCount} borderColor="#3b82f6" />
      <StatCard label="Solved" value={solvedProblems.size} borderColor="#22c55e" />
      <StatCard
        label="Completion"
        value={`${totalProblemsCount > 0
          ? Math.round((solvedProblems.size / totalProblemsCount) * 100)
          : 0}%`}
        borderColor="#06b6d4"
      />
      <StatCard label="Topics" value={dsaTopics.length} borderColor="#64748b" />
    </div>

    {/* Topics grid */}
    {dsaTopics.length === 0 ? (
      <div className="text-center py-16">
        <p className="text-[#64748b] dark:text-[#94a3b8] text-sm font-semibold">
          No topics found. Make sure the backend is seeded with data.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {dsaTopics.map((topic) => {
          const stats = getTopicStats(topic);
          return (
            <div
              key={topic.id}
              onClick={() => handleTopicClick(topic.id)}
              className="group bg-[#f8fafc] dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] hover:border-[#cbd5e1] dark:hover:border-[#475569] p-5 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-[#334155] dark:text-[#f1f5f9] leading-snug">
                  {topic.name}
                </h3>
                <span className="text-xs font-bold text-[#2563eb] dark:text-[#7dd3fc] bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-500/30 shrink-0 ml-2">
                  {stats.percent}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#e2e8f0] dark:bg-[#0f172a] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#3b82f6] to-[#0ea5e9] dark:from-[#2563eb] dark:to-[#38bdf8] rounded-full transition-all duration-700"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
              <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-3 uppercase font-bold tracking-wider">
                {stats.solved}/{stats.total} Problems
              </p>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const PatternDetailView: React.FC<PatternDetailViewProps> = ({
  activePattern,
  problems,
  isLoading,
  solvedProblems,
  onToggle,
}) => {
  if (!activePattern) return null;

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <div className="w-5 h-5 border-3 border-[#3b5998] dark:border-[#7dd3fc] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#3b82f6] dark:text-[#7dd3fc] text-sm font-semibold">Loading problems...</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8 p-6 bg-[#f8fafc] dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl shadow-sm">
        <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] uppercase font-bold tracking-[0.15em] mb-2">
          Pattern
        </p>
        <h1 className="text-2xl font-bold text-[#1e293b] dark:text-[#f8fafc]">{activePattern.name}</h1>
        {activePattern.description && (
          <p className="text-sm text-[#475569] dark:text-[#cbd5e1] mt-2">{activePattern.description}</p>
        )}
      </div>

      <div className="bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl shadow-sm overflow-hidden">
        {problems.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#64748b] dark:text-[#94a3b8]">
            No problems found for this pattern.
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9] dark:divide-[#334155]">
            {problems.map((prob, idx) => (
              <div
                key={prob.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#f8fafc] dark:hover:bg-[#0f172a] group transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-[11px] font-medium text-[#94a3b8] dark:text-[#64748b] w-5 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <button
                    onClick={() => onToggle(prob.id)}
                    className="transition-all hover:scale-110 shrink-0"
                  >
                    {solvedProblems.has(prob.id) ? (
                      <FiCheckCircle className="text-[#10b981] dark:text-[#34d399]" size={18} />
                    ) : (
                      <FiCircle className="text-[#cbd5e1] dark:text-[#64748b] hover:text-[#94a3b8] dark:hover:text-[#94a3b8]" size={18} />
                    )}
                  </button>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
                    <a
                      href={prob.problemLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-medium transition-all truncate ${solvedProblems.has(prob.id)
                          ? "text-[#94a3b8] dark:text-[#64748b] opacity-50"
                          : "text-[#334155] dark:text-[#e2e8f0] hover:text-[#2563eb] dark:hover:text-[#7dd3fc]"
                        }`}
                    >
                      {prob.title}
                    </a>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide shrink-0 border ${prob.difficulty === "easy"
                          ? "bg-[#dcfce7] text-[#166534] border-[#bbf7d0] dark:bg-[#064e3b]/50 dark:text-[#34d399] dark:border-[#047857]"
                          : prob.difficulty === "medium"
                            ? "bg-[#fef9c3] text-[#854d0e] border-[#fef08a] dark:bg-[#78350f]/50 dark:text-[#fbbf24] dark:border-[#b45309]"
                            : "bg-[#fee2e2] text-[#991b1b] border-[#fecaca] dark:bg-[#7f1d1d]/50 dark:text-[#f87171] dark:border-[#b91c1c]"
                        }`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>
                </div>
                <FiExternalLink
                  className="text-[#cbd5e1] dark:text-[#475569] group-hover:text-[#2563eb] dark:group-hover:text-[#7dd3fc] transition-colors shrink-0 ml-3"
                  size={14}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ label, value, borderColor }) => (
  <div
    className="bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] p-5 rounded-xl shadow-sm border-t-4 transition-colors duration-300"
    style={{ borderTopColor: borderColor }}
  >
    <div className="text-[11px] text-[#64748b] dark:text-[#94a3b8] font-bold uppercase tracking-wider mb-2">
      {label}
    </div>
    <div className="text-2xl font-black text-[#1e293b] dark:text-[#f8fafc]">
      {value}
    </div>
  </div>
);

export default DSASheet;