"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  fetchTopics,
  fetchPatterns,
  fetchProblems,
  fetchProgressSummary,
  fetchProblemTags,
  fetchUserNote,
  saveUserNote,
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
  FiEdit3,
  FiSave,
  FiCheck,
} from "react-icons/fi";
import { HiOfficeBuilding } from "react-icons/hi";
import DSASidebar from "@/components/layout/Sidebar";
import { DSALoader, DSAFullLoader } from "@/components/loading/Spinner";

// ─── Interfaces ───────────────────────────────────────────────────────────────



interface PatternDetailViewProps {
  activePattern: KnowledgePattern | null;
  problems: KnowledgeProblem[];
  isLoading: boolean;
  solvedProblems: Set<string | number>;
  onToggle: (problemId: string | number) => void;
}

type ExpandSection = "companies" | "topic";

// ─── Notes Modal Component ───────────────────────────────────────────────────

interface NotesModalProps {
  prob: KnowledgeProblem | null;
  isOpen: boolean;
  onClose: () => void;
  noteValue: string;
  isNoteLoading: boolean;
  isSavingNote: boolean;
  noteSaved: boolean;
  onNoteChange: (probId: string | number, value: string) => void;
  onSaveNote: (probId: string | number) => void;
}

const NotesModal: React.FC<NotesModalProps> = ({
  prob,
  isOpen,
  onClose,
  noteValue,
  isNoteLoading,
  isSavingNote,
  noteSaved,
  onNoteChange,
  onSaveNote,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !prob) return;
      if (e.key === "Escape") {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSaveNote(prob.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, prob, onSaveNote, onClose]);

  if (!isOpen || !prob) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      {/* Backdrop click listener */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white dark:bg-[#161b22] border border-violet-200/80 dark:border-violet-900/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] z-10 transition-colors duration-300">
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#e8f5ee] dark:border-[#30363d] bg-[#fcfdfe] dark:bg-[#1c2228] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shrink-0 border border-violet-200 dark:border-violet-800/40">
              <FiEdit3 size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-violet-700 dark:text-violet-400">
                  Problem Notes
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border ${(prob.difficulty || "").toLowerCase() === "easy"
                    ? "bg-emerald-100/80 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"
                    : (prob.difficulty || "").toLowerCase() === "medium"
                    ? "bg-amber-100/80 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
                    : "bg-rose-100/80 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50"
                  }`}
                >
                  {prob.difficulty}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#1a202c] dark:text-[#f0f6fc] truncate mt-0.5">
                {prob.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={prob.problemLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Open problem link"
              className="p-2 rounded-xl text-[#6b7280] dark:text-[#8b949e] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/40"
            >
              <FiExternalLink size={16} />
            </a>
            {/* Cross Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6b7280] dark:text-[#8b949e] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/40 transition-all duration-200 active:scale-95"
              title="Close notes (Esc)"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Sub-bar: Status, Character Count & Keyboard Tips */}
        <div className="px-5 py-2.5 sm:px-6 bg-[#f4fcf7] dark:bg-[#161b22] border-b border-[#e8f5ee] dark:border-[#30363d] flex items-center justify-between text-[11px] font-medium text-[#6b7280] dark:text-[#8b949e]">
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-[#21262d] border border-gray-200 dark:border-gray-700 rounded shadow-xs">Ctrl+S</kbd> to save, <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-[#21262d] border border-gray-200 dark:border-gray-700 rounded shadow-xs">Esc</kbd> to close</span>
          </div>
          <span className={noteValue.length > 9000 ? "text-rose-500 font-bold" : "text-[#8b949e]"}>
            {noteValue.length.toLocaleString()} / 10,000 chars
          </span>
        </div>

        {/* Modal Body / Textarea */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col min-h-0 bg-white dark:bg-[#161b22]">
          {isNoteLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 flex-1">
              <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Loading your notes…</span>
            </div>
          ) : (
            <textarea
              value={noteValue}
              onChange={(e) => onNoteChange(prob.id, e.target.value)}
              maxLength={10000}
              autoFocus
              placeholder="Write your personal notes, approach, time & space complexity, or edge cases here..."
              className="w-full flex-1 min-h-[260px] sm:min-h-[340px] resize-y text-xs sm:text-sm font-mono text-[#2d3748] dark:text-[#e2e8f0] bg-[#fafbfc] dark:bg-[#0d1117] border border-violet-200 dark:border-violet-900/40 rounded-xl p-4 leading-relaxed placeholder-[#a0aec0] dark:placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-violet-400/50 dark:focus:ring-violet-500/50 focus:border-violet-400 dark:focus:border-violet-500 transition-all shadow-inner"
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 sm:px-6 bg-[#fcfdfe] dark:bg-[#1c2228] border-t border-[#e8f5ee] dark:border-[#30363d] flex items-center justify-between gap-3">
          <p className="text-[11px] text-[#6b7280] dark:text-[#8b949e] hidden sm:block italic">
            Notes are saved automatically to your account.
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#30363d] text-xs font-bold text-[#4a5568] dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d] transition-all duration-200 active:scale-95"
            >
              Close
            </button>
            <button
              onClick={() => onSaveNote(prob.id)}
              disabled={isSavingNote || isNoteLoading}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 shadow-sm active:scale-95 ${
                noteSaved
                  ? "bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700"
                  : isSavingNote
                  ? "bg-violet-400 dark:bg-violet-700 cursor-wait"
                  : "bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700"
              }`}
            >
              {noteSaved ? (
                <>
                  <FiCheck size={14} />
                  Saved!
                </>
              ) : isSavingNote ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <FiSave size={14} />
                  Save Note
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DSASheet: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
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

  // ── Helper to close sidebar on mobile screens ─────────────────────────────
  const closeSidebarOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handlePatternClick = async (patternId: string | number) => {
    setActivePatternId(patternId);
    closeSidebarOnMobile();

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
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#e8f5ee] dark:bg-[#0d1117] p-4">
        <div className="w-full max-w-md text-center bg-white dark:bg-[#161b22] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 sm:p-8 shadow-sm">
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

  // ── Main render ──────────────────────────────
  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#e8f5ee] dark:bg-[#0d1117] text-[#2d3748] dark:text-[#e2e8f0] overflow-hidden font-sans transition-colors duration-300 relative">

      {/* Sidebar Wrapper (Added h-full and overflow-y-auto to make it scrollable) */}
      <div className={`
        ${isSidebarOpen ? 'absolute inset-0 z-50 w-full bg-[#e8f5ee] dark:bg-[#0d1117] lg:relative lg:w-auto lg:z-auto lg:bg-transparent' : 'hidden lg:block'}
        transition-all duration-300 ease-in-out h-full overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#a7c7b3_transparent] dark:[scrollbar-color:#334155_transparent]
      `}>
        {/* Helper div to force inner components to take full width on mobile */}
        <div className="w-full min-h-full flex flex-col">
          <DSASidebar
            isSidebarOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
            handleTopicClick={handleTopicClick}
            handlePatternClick={handlePatternClick}
            activeTopicId={activeTopicId}
            activePatternId={activePatternId}
            expandedTopics={expandedTopics}
            dsaTopics={dsaTopics}
            patternsCache={patternsCache}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {/* Hidden on mobile if sidebar is open to keep layout clean */}
      <main className={`
        flex-1 overflow-y-auto relative bg-[#f4fcf7] dark:bg-[#161b22] m-0 sm:m-2 rounded-none sm:rounded-2xl border-0 sm:border border-[#d1e8d8] dark:border-[#30363d] shadow-sm transition-colors duration-300 [scrollbar-width:thin] [scrollbar-color:#a7c7b3_transparent] dark:[scrollbar-color:#334155_transparent]
        ${isSidebarOpen ? 'hidden lg:block' : 'block'}
      `}>
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#f4fcf7] dark:bg-[#161b22] border-b border-[#d1e8d8] dark:border-[#30363d] p-3 sm:p-4 flex items-center justify-between transition-colors duration-300">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-xl shadow-sm hover:bg-[#e8f5ee] dark:hover:bg-[#30363d] active:scale-95 transition-all duration-200"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen
              ? <FiX size={18} className="text-emerald-600 dark:text-emerald-400" />
              : <FiMenu size={18} className="text-[#4a5568] dark:text-[#8b949e]" />}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-1.5 bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-full shadow-sm transition-colors duration-300">
            <FiTrendingUp className="text-emerald-600 dark:text-emerald-400" size={14} />
            <span className="text-[10px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wide">
              {solvedProblems.size} Solved
            </span>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
          {!activePatternId ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-200 dark:border-emerald-800/50">
                <FiFileText className="text-emerald-600 dark:text-emerald-400" size={28} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight mb-3">
                Select a Pattern
              </h2>
              <p className="text-sm sm:text-base font-medium text-[#4a5568] dark:text-[#8b949e] max-w-md">
                Choose a pattern from the sidebar to start solving problems and track your progress.
              </p>
            </div>
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

// ─── Expandable Problem Row ───────────────────────────────────────────────────

interface ProblemRowProps {
  prob: KnowledgeProblem;
  idx: number;
  isSolved: boolean;
  onToggle: (id: string | number) => void;
  expandedRowId: string | number | null;
  expandedSection: ExpandSection | null;
  onExpand: (probId: string | number, section: ExpandSection) => void;
  onOpenNotesModal: (prob: KnowledgeProblem) => void;
  tagsCache: Map<string | number, ProblemTag[]>;
  loadingTagIds: Set<string | number>;
  hasNote?: boolean;
}

const ProblemRow: React.FC<ProblemRowProps> = ({
  prob,
  idx,
  isSolved,
  onToggle,
  expandedRowId,
  expandedSection,
  onExpand,
  onOpenNotesModal,
  tagsCache,
  loadingTagIds,
  hasNote,
}) => {
  const isExpanded = expandedRowId === prob.id;
  const tags = tagsCache.get(prob.id) ?? [];
  const companyTags = tags.filter((t) => t.tag_type === "company");
  const topicTags = tags.filter((t) => t.tag_type === "topic");
  const isLoadingTags = loadingTagIds.has(prob.id);

  return (
    <div className={`border-b border-[#e8f5ee] dark:border-[#30363d] last:border-b-0 transition-colors duration-200 ${isExpanded ? "bg-[#f0faf4] dark:bg-[#1c2630]" : "hover:bg-[#f4fcf7] dark:hover:bg-[#30363d]/50"}`}>
      {/* Main row */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-3 group">
        
        {/* Left Side: Index, Checkbox, Title & Difficulty */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-1 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#a0aec0] dark:text-[#8b949e] w-4 sm:w-5 text-right shrink-0">
            {idx + 1}
          </span>
          <button
            onClick={() => onToggle(prob.id)}
            className="transition-all hover:scale-110 shrink-0 outline-none"
            title={isSolved ? "Mark as unsolved" : "Mark as solved"}
          >
            {isSolved ? (
              <FiCheckCircle className="text-emerald-500 dark:text-emerald-400" size={18} />
            ) : (
              <FiCircle className="text-[#a7c7b3] dark:text-[#64748b] hover:text-emerald-500 dark:hover:text-emerald-500 transition-colors" size={18} />
            )}
          </button>

          <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 min-w-0">
            <a
              href={prob.problemLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-bold transition-all truncate ${isSolved
                  ? "text-[#a0aec0] dark:text-[#64748b] decoration-[#a7c7b3] dark:decoration-[#334155]"
                  : "text-[#1a202c] dark:text-[#f0f6fc] hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
            >
              {prob.title}
            </a>
            <span
              className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide shrink-0 border w-max ${(prob.difficulty || "").toLowerCase() === "easy"
                  ? "bg-emerald-100/80 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"
                  : (prob.difficulty || "").toLowerCase() === "medium"
                    ? "bg-amber-100/80 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
                    : "bg-rose-100/80 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50"
                }`}
            >
              {prob.difficulty}
            </span>
          </div>
        </div>

        {/* Right Side: Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0 pl-10 sm:pl-12 lg:pl-0 flex-wrap">
          {/* Notes button — opens Modal */}
          <button
            onClick={() => onOpenNotesModal(prob)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 bg-white text-[#6b7280] border-[#d1e8d8] hover:bg-violet-50 hover:text-violet-600 hover:border-violet-300 dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-violet-900/20 dark:hover:text-violet-400 active:scale-95 shadow-xs"
            title="Open problem notes modal"
          >
            <FiEdit3 size={10} className="text-violet-600 dark:text-violet-400" />
            Notes
            {hasNote && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" title="Has saved note" />
            )}
          </button>

          <button
            onClick={() => onExpand(prob.id, "companies")}
            className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-lg text-[10px] font-bold border transition-all duration-200 ${isExpanded && expandedSection === "companies"
                ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50"
                : "bg-white text-[#6b7280] border-[#d1e8d8] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              }`}
          >
            <HiOfficeBuilding size={10} />
            Companies
            <FiChevronDown size={9} className={`transition-transform duration-200 ${isExpanded && expandedSection === "companies" ? "rotate-180" : ""}`} />
          </button>

          <button
            onClick={() => onExpand(prob.id, "topic")}
            className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-lg text-[10px] font-bold border transition-all duration-200 ${isExpanded && expandedSection === "topic"
                ? "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700/50"
                : "bg-white text-[#6b7280] border-[#d1e8d8] hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
              }`}
          >
            <FiTag size={10} />
            Topics
            <FiChevronDown size={9} className={`transition-transform duration-200 ${isExpanded && expandedSection === "topic" ? "rotate-180" : ""}`} />
          </button>

          <a
            href={prob.problemLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Open problem"
            className="p-1.5 rounded-lg text-[#a7c7b3] dark:text-[#64748b] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all ml-auto lg:ml-0"
          >
            <FiExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Expandable detail panel */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-1">
          {expandedSection === "companies" && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <HiOfficeBuilding size={12} className="text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Asked By Companies</span>
              </div>
              {isLoadingTags ? (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-500 dark:text-blue-400">
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              ) : companyTags.length === 0 ? (
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] italic">No company tags for this problem yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {companyTags.map((tag) => (
                    <span key={tag.id} className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors">
                      {tag.logo_url && (
                        <img src={tag.logo_url} alt="" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain rounded-sm" />
                      )}
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {expandedSection === "topic" && (
            <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <FiTag size={12} className="text-orange-600 dark:text-orange-400" />
                <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">Topic Tags</span>
              </div>
              {isLoadingTags ? (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-500 dark:text-orange-400">
                  <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              ) : topicTags.length === 0 ? (
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] italic">No topic tags for this problem yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topicTags.map((tag) => (
                    <span key={tag.id} className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700/50 hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors">
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

  // ── Notes Modal state ───────────────────────────────────────────────────────
  const [noteModalProblem, setNoteModalProblem] = useState<KnowledgeProblem | null>(null);

  // ── Per-user notes state ───────────────────────────────────────────────────
  const [notesCache, setNotesCache] = useState<Map<string | number, string>>(new Map());
  const [loadingNoteIds, setLoadingNoteIds] = useState<Set<string | number>>(new Set());
  const [savingNoteIds, setSavingNoteIds] = useState<Set<string | number>>(new Set());
  const [savedNoteIds, setSavedNoteIds] = useState<Set<string | number>>(new Set());
  // Debounce timers for "Saved!" flash reset
  const savedTimers = React.useRef<Map<string | number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setExpandedRowId(null);
    setExpandedSection(null);
    setNoteModalProblem(null);
    // Clear note states when navigating away
    setNotesCache(new Map());
    setLoadingNoteIds(new Set());
    setSavingNoteIds(new Set());
    setSavedNoteIds(new Set());
  }, [activePattern?.id]);

  const handleOpenNotesModal = async (prob: KnowledgeProblem) => {
    setNoteModalProblem(prob);
    if (!notesCache.has(prob.id)) {
      setLoadingNoteIds((prev) => new Set(prev).add(prob.id));
      try {
        const note = await fetchUserNote(prob.id);
        setNotesCache((prev) => new Map(prev).set(prob.id, note));
      } catch (err) {
        console.error("Failed to fetch note:", err);
        setNotesCache((prev) => new Map(prev).set(prob.id, ""));
      } finally {
        setLoadingNoteIds((prev) => {
          const s = new Set(prev);
          s.delete(prob.id);
          return s;
        });
      }
    }
  };

  const handleExpand = async (probId: string | number, section: ExpandSection) => {
    if (expandedRowId === probId && expandedSection === section) {
      setExpandedRowId(null);
      setExpandedSection(null);
      return;
    }

    setExpandedRowId(probId);
    setExpandedSection(section);

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

  const handleNoteChange = (probId: string | number, value: string) => {
    setNotesCache((prev) => new Map(prev).set(probId, value));
    // Clear the "Saved!" flash if user starts editing again
    setSavedNoteIds((prev) => {
      const s = new Set(prev); s.delete(probId); return s;
    });
  };

  const handleSaveNote = async (probId: string | number) => {
    const note = notesCache.get(probId) ?? "";
    setSavingNoteIds((prev) => new Set(prev).add(probId));
    try {
      await saveUserNote(probId, note);
      setSavedNoteIds((prev) => new Set(prev).add(probId));
      // Clear "Saved!" flash after 2.5s
      const existing = savedTimers.current.get(probId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        setSavedNoteIds((prev) => { const s = new Set(prev); s.delete(probId); return s; });
      }, 2500);
      savedTimers.current.set(probId, timer);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSavingNoteIds((prev) => { const s = new Set(prev); s.delete(probId); return s; });
    }
  };

  if (!activePattern) return null;
  if (isLoading) return <DSALoader />;

  const solvedCount = problems.filter((p) => solvedProblems.has(p.id)).length;

  return (
    <div>
      {/* Pattern Header */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl sm:rounded-3xl shadow-sm">
        <p className="text-[10px] sm:text-[11px] text-[#4a5568] dark:text-[#8b949e] uppercase font-bold tracking-[0.15em] mb-2">
          Pattern Breakdown
        </p>
        <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">{activePattern.name}</h1>
          <span className="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50 shrink-0">
            {solvedCount} / {problems.length} solved
          </span>
        </div>
        {activePattern.description && (
          <p className="text-xs sm:text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mt-2 leading-relaxed">
            {activePattern.description}
          </p>
        )}
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
      <div className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
        {/* Column header - Hidden on mobile for cleaner card-like stacked view */}
        <div className="px-6 py-2.5 bg-[#f4fcf7] dark:bg-[#1c2228] border-b border-[#e8f5ee] dark:border-[#30363d] items-center gap-3 hidden lg:flex">
          <span className="w-5" />
          <span className="w-5" />
          <span className="flex-1 text-[10px] font-bold text-[#6b7280] dark:text-[#8b949e] uppercase tracking-wider">Problem</span>
          <span className="text-[10px] font-bold text-[#6b7280] dark:text-[#8b949e] uppercase tracking-wider mr-1">Actions</span>
        </div>

        {problems.length === 0 ? (
          <div className="p-8 sm:p-10 text-center text-sm font-medium text-[#4a5568] dark:text-[#8b949e]">
            No problems found for this pattern.
          </div>
        ) : (
          <div>
            {problems.map((prob, idx) => {
              const noteText = notesCache.get(prob.id);
              const hasNote = Boolean(noteText && noteText.trim().length > 0);

              return (
                <ProblemRow
                  key={prob.id}
                  prob={prob}
                  idx={idx}
                  isSolved={solvedProblems.has(prob.id)}
                  onToggle={onToggle}
                  expandedRowId={expandedRowId}
                  expandedSection={expandedSection}
                  onExpand={handleExpand}
                  onOpenNotesModal={handleOpenNotesModal}
                  tagsCache={tagsCache}
                  loadingTagIds={loadingTagIds}
                  hasNote={hasNote}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      <NotesModal
        prob={noteModalProblem}
        isOpen={noteModalProblem !== null}
        onClose={() => setNoteModalProblem(null)}
        noteValue={noteModalProblem ? notesCache.get(noteModalProblem.id) ?? "" : ""}
        isNoteLoading={noteModalProblem ? loadingNoteIds.has(noteModalProblem.id) : false}
        isSavingNote={noteModalProblem ? savingNoteIds.has(noteModalProblem.id) : false}
        noteSaved={noteModalProblem ? savedNoteIds.has(noteModalProblem.id) : false}
        onNoteChange={handleNoteChange}
        onSaveNote={handleSaveNote}
      />
    </div>
  );
};

export default DSASheet;