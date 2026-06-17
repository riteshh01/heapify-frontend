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
import Spinner from "@/components/loading/Spinner";

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
      }
    };
    load();
  }, [userData]);

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

      {/* Main Content Area (Light: Mild Green / Dark: Neutral #161b22 exactly like sidebar) */}
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
        value={`${totalProblemsCount > 0
          ? Math.round((solvedProblems.size / totalProblemsCount) * 100)
          : 0}%`}
        borderColor="#0ea5e9"
      />
      <StatCard label="Topics" value={dsaTopics.length} borderColor="#f59e0b" />
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
          const stats = getTopicStats(topic);
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
        <div className="w-5 h-5 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Loading problems...</p>
      </div>
    );

  return (
    <div>
      {/* Pattern Header */}
      <div className="mb-8 p-6 bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl shadow-sm">
        <p className="text-[11px] text-[#4a5568] dark:text-[#8b949e] uppercase font-bold tracking-[0.15em] mb-2">
          Pattern Breakdown
        </p>
        <h1 className="text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">{activePattern.name}</h1>
        {activePattern.description && (
          <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mt-2 leading-relaxed">
            {activePattern.description}
          </p>
        )}
      </div>

      {/* Problems List */}
      <div className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl shadow-sm overflow-hidden">
        {problems.length === 0 ? (
          <div className="p-10 text-center text-sm font-medium text-[#4a5568] dark:text-[#8b949e]">
            No problems found for this pattern.
          </div>
        ) : (
          <div className="divide-y divide-[#e8f5ee] dark:divide-[#30363d]">
            {problems.map((prob, idx) => (
              <div
                key={prob.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#f4fcf7] dark:hover:bg-[#30363d]/50 group transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-[11px] font-bold text-[#a0aec0] dark:text-[#8b949e] w-5 text-right shrink-0">
                    {idx + 1}
                  </span>
                  
                  <button
                    onClick={() => onToggle(prob.id)}
                    className="transition-all hover:scale-110 shrink-0 outline-none"
                  >
                    {solvedProblems.has(prob.id) ? (
                      <FiCheckCircle className="text-emerald-500 dark:text-emerald-400" size={20} />
                    ) : (
                      <FiCircle className="text-[#a7c7b3] dark:text-[#64748b] hover:text-emerald-500 dark:hover:text-emerald-500 transition-colors" size={20} />
                    )}
                  </button>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
                    <a
                      href={prob.problemLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-bold transition-all truncate ${solvedProblems.has(prob.id)
                          ? "text-[#a0aec0] dark:text-[#64748b] line-through decoration-[#a7c7b3] dark:decoration-[#334155]"
                          : "text-[#1a202c] dark:text-[#f0f6fc] hover:text-emerald-600 dark:hover:text-emerald-400"
                        }`}
                    >
                      {prob.title}
                    </a>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide shrink-0 border ${prob.difficulty === "easy"
                          ? "bg-emerald-100/80 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"
                          : prob.difficulty === "medium"
                            ? "bg-amber-100/80 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
                            : "bg-rose-100/80 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50"
                        }`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>
                </div>
                
                <a 
                  href={prob.problemLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiExternalLink
                    className="text-[#a7c7b3] dark:text-[#64748b] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0 ml-3"
                    size={16}
                  />
                </a>
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