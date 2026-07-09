"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import {
  fetchProgressSummary,
  fetchAllProblems,
  fetchCompaniesList,
  fetchTagsList,
  toggleProblem,
  BankProblem,
  CompanyItem,
  TagItem,
  BankFilters,
} from "@/services/knowledgeService";
import {
  FiSearch,
  FiChevronDown,
  FiExternalLink,
  FiCheckCircle,
  FiCircle,
  FiTrendingUp,
  FiX,
  FiArrowRight,
  FiFilter,
  FiTag,
  FiLoader,
} from "react-icons/fi";
import { HiOfficeBuilding } from "react-icons/hi";

// ─── Utility ──────────────────────────────────────────────────────────────────

const DIFFICULTY_OPTIONS = [
  { label: "All Difficulties", value: "" },
  { label: "Easy",   value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard",   value: "hard" },
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Solved",    value: "solved" },
  { label: "Unsolved",  value: "unsolved" },
];

const LIMIT = 15;

// ─── Difficulty badge helper ───────────────────────────────────────────────────

function DiffBadge({ d }: { d: string }) {
  const cls =
    d === "easy"
      ? "bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"
      : d === "medium"
      ? "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
      : "bg-rose-100/80 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50";
  return (
    <span
      className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border shrink-0 ${cls}`}
    >
      {d}
    </span>
  );
}

// ─── Searchable Select ────────────────────────────────────────────────────────

interface SearchableSelectProps {
  placeholder: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}

function SearchableSelect({
  placeholder,
  value,
  options,
  onChange,
  icon,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
    : options;

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); setQ(""); }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all min-w-[130px] ${
          value
            ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
            : "border-[#e2e8f0] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#4a5568] dark:text-[#8b949e] hover:border-emerald-400 dark:hover:border-emerald-600"
        }`}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="truncate max-w-[110px]">{selectedLabel || placeholder}</span>
        {value ? (
          <FiX
            size={12}
            className="shrink-0 ml-auto"
            onClick={(e) => { e.stopPropagation(); onChange(""); setOpen(false); }}
          />
        ) : (
          <FiChevronDown size={12} className={`shrink-0 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-56 bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-2xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-[#e2e8f0] dark:border-[#30363d]">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-full text-xs px-3 py-1.5 rounded-lg bg-[#f4f6f8] dark:bg-[#0d1117] border border-[#e2e8f0] dark:border-[#30363d] text-[#1a202c] dark:text-[#f0f6fc] placeholder-[#a0aec0] dark:placeholder-[#4b5563] outline-none"
            />
          </div>
          <div className="max-h-52 overflow-y-auto [scrollbar-width:thin]">
            {filtered.length === 0 ? (
              <p className="text-xs text-[#a0aec0] p-3 text-center">No results</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); setQ(""); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                    o.value === value
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "text-[#1a202c] dark:text-[#e2e8f0] hover:bg-[#f4f6f8] dark:hover:bg-[#0d1117]"
                  }`}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tag Pills (collapsible) ──────────────────────────────────────────────────

function TagPills({
  items,
  colorClass,
}: {
  items: string[];
  colorClass: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const SHOW = 3;
  const visible = expanded ? items : items.slice(0, SHOW);
  const extra = items.length - SHOW;

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visible.map((name) => (
        <span
          key={name}
          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}
        >
          {name}
        </span>
      ))}
      {!expanded && extra > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
          className="text-[9px] font-bold text-[#a0aec0] dark:text-[#64748b] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          +{extra} more
        </button>
      )}
    </div>
  );
}

// ─── Problem Row ──────────────────────────────────────────────────────────────

interface ProblemRowProps {
  prob: BankProblem;
  globalIndex: number;
  onToggle: (id: number) => void;
}

function ProblemRow({ prob, globalIndex, onToggle }: ProblemRowProps) {
  const [expanded, setExpanded] = useState<"companies" | "topics" | null>(null);

  const toggle = (section: "companies" | "topics") => {
    setExpanded((prev) => (prev === section ? null : section));
  };

  return (
    <div
      className={`border-b border-[#f0f4f8] dark:border-[#30363d] last:border-b-0 transition-colors duration-150 ${
        expanded ? "bg-[#f8fbff] dark:bg-[#1c2630]" : "hover:bg-[#f8fcfa] dark:hover:bg-[#1e252e]/60"
      }`}
    >
      {/* Main row */}
      <div className="px-4 sm:px-6 py-3 flex items-center gap-3 group">
        {/* Index */}
        <span className="text-[10px] font-bold text-[#c4cdd6] dark:text-[#4b5563] w-6 text-right shrink-0 tabular-nums">
          {globalIndex}
        </span>

        {/* Solved toggle */}
        <button
          onClick={() => onToggle(prob.id)}
          className="shrink-0 hover:scale-110 transition-transform outline-none"
          title={prob.solved ? "Mark unsolved" : "Mark solved"}
        >
          {prob.solved ? (
            <FiCheckCircle size={17} className="text-emerald-500 dark:text-emerald-400" />
          ) : (
            <FiCircle size={17} className="text-[#c4cdd6] dark:text-[#4b5563] hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors" />
          )}
        </button>

        {/* Title */}
        <a
          href={prob.problemLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 text-sm font-semibold truncate transition-colors ${
            prob.solved
              ? "text-[#a0aec0] dark:text-[#4b5563] line-through decoration-[#c4cdd6]"
              : "text-[#1a202c] dark:text-[#f0f6fc] hover:text-emerald-600 dark:hover:text-emerald-400"
          }`}
        >
          {prob.title}
        </a>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          <DiffBadge d={prob.difficulty} />

          {/* Topic tags btn */}
          {prob.topics.length > 0 && (
            <button
              onClick={() => toggle("topics")}
              title="Topic tags"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                expanded === "topics"
                  ? "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700/50"
                  : "bg-white text-[#6b7280] border-[#e2e8f0] hover:bg-orange-50 hover:text-orange-600 dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
              }`}
            >
              <FiTag size={9} />
              <span className="hidden sm:inline">Topics</span>
              <FiChevronDown
                size={9}
                className={`transition-transform duration-200 ${expanded === "topics" ? "rotate-180" : ""}`}
              />
            </button>
          )}

          {/* Company tags btn */}
          {prob.companies.length > 0 && (
            <button
              onClick={() => toggle("companies")}
              title="Companies"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                expanded === "companies"
                  ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50"
                  : "bg-white text-[#6b7280] border-[#e2e8f0] hover:bg-blue-50 hover:text-blue-600 dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              }`}
            >
              <HiOfficeBuilding size={9} />
              <span className="hidden sm:inline">Companies</span>
              <FiChevronDown
                size={9}
                className={`transition-transform duration-200 ${expanded === "companies" ? "rotate-180" : ""}`}
              />
            </button>
          )}

          <a
            href={prob.problemLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-[#c4cdd6] dark:text-[#4b5563] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
          >
            <FiExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Expanded panels */}
      {expanded && (
        <div className="px-4 sm:px-6 pb-3 pt-0">
          {expanded === "topics" && (
            <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <FiTag size={11} className="text-orange-600 dark:text-orange-400" />
                <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                  Topic Tags
                </span>
              </div>
              <TagPills
                items={prob.topics}
                colorClass="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700/50"
              />
            </div>
          )}

          {expanded === "companies" && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <HiOfficeBuilding size={11} className="text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  Asked By
                </span>
              </div>
              <TagPills
                items={prob.companies}
                colorClass="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton loader row ──────────────────────────────────────────────────────

function SkeletonRow({ i }: { i: number }) {
  return (
    <div className="px-4 sm:px-6 py-3 flex items-center gap-3 border-b border-[#f0f4f8] dark:border-[#30363d] last:border-0 animate-pulse">
      <div className="w-6 h-3 bg-[#e2e8f0] dark:bg-[#30363d] rounded" />
      <div className="w-4 h-4 bg-[#e2e8f0] dark:bg-[#30363d] rounded-full" />
      <div
        className="flex-1 h-3.5 bg-[#e2e8f0] dark:bg-[#30363d] rounded"
        style={{ width: `${55 + (i % 4) * 10}%` }}
      />
      <div className="w-12 h-4 bg-[#e2e8f0] dark:bg-[#30363d] rounded-md" />
      <div className="w-16 h-5 bg-[#e2e8f0] dark:bg-[#30363d] rounded-lg" />
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const firstName = user?.name?.split(" ")?.[0] || "there";

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [solvedCount, setSolvedCount]   = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [statsLoading, setStatsLoading]  = useState(true);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search,     setSearch]     = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [company,    setCompany]    = useState("");
  const [tag,        setTag]        = useState("");
  const [status,     setStatus]     = useState<"" | "solved" | "unsolved">("");

  // ── Dropdown data ─────────────────────────────────────────────────────────
  const [companies,    setCompanies]    = useState<CompanyItem[]>([]);
  const [tags,         setTags]         = useState<TagItem[]>([]);

  // ── Problem bank state ────────────────────────────────────────────────────
  const [problems,  setProblems]  = useState<BankProblem[]>([]);
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [hasMore,   setHasMore]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // ── Infinite scroll sentinel ──────────────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Load stats ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setStatsLoading(false); return; }
    fetchProgressSummary()
      .then(({ summary }) => {
        setSolvedCount(summary.totalSolved);
        setTotalProblems(summary.totalProblems);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [user]);

  // ── Load dropdown data ────────────────────────────────────────────────────
  useEffect(() => {
    fetchCompaniesList().then(setCompanies).catch(() => {});
    fetchTagsList().then(setTags).catch(() => {});
  }, []);

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
  }, [search]);

  // ── Fetch first page whenever filters change ──────────────────────────────
  const filtersKey = `${debouncedSearch}|${difficulty}|${company}|${tag}|${status}`;

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const result = await fetchAllProblems({
        page: 1,
        limit: LIMIT,
        difficulty,
        company,
        tag,
        search: debouncedSearch,
        status,
      });
      setProblems(result.problems);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load problems");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => { loadFirstPage(); }, [loadFirstPage]);

  // ── Infinite scroll: load next page ──────────────────────────────────────
  const loadNextPage = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const result = await fetchAllProblems({
        page: nextPage,
        limit: LIMIT,
        difficulty,
        company,
        tag,
        search: debouncedSearch,
        status,
      });
      setProblems((prev) => [...prev, ...result.problems]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch {
      // silently ignore pagination error
    } finally {
      setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMore, page, filtersKey]);

  // ── IntersectionObserver on sentinel ─────────────────────────────────────
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadNextPage(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadNextPage]);

  // ── Optimistic solved toggle ──────────────────────────────────────────────
  const handleToggle = async (id: number) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, solved: !p.solved } : p))
    );
    try {
      await toggleProblem(id);
      setSolvedCount((prev) => {
        const wasSolved = problems.find((p) => p.id === id)?.solved ?? false;
        return wasSolved ? prev - 1 : prev + 1;
      });
    } catch {
      // revert
      setProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, solved: !p.solved } : p))
      );
    }
  };

  // ── Active filter count ───────────────────────────────────────────────────
  const activeFilters = [difficulty, company, tag, status, debouncedSearch].filter(Boolean).length;

  const clearAll = () => {
    setSearch(""); setDifficulty(""); setCompany(""); setTag(""); setStatus("");
  };

  // ── Company + tag options ─────────────────────────────────────────────────
  const companyOptions = [
    { label: "All Companies", value: "" },
    ...companies.map((c) => ({ label: c.name, value: c.slug })),
  ];
  const tagOptions = [
    { label: "All Topics", value: "" },
    ...tags.map((t) => ({ label: t.name, value: t.slug })),
  ];

  const solvedPct = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f4fbf6] dark:bg-[#161b22] text-[#2d3748] dark:text-[#e2e8f0] font-sans transition-colors duration-300 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* ── Welcome header ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider">Active session</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
            Welcome back, {firstName} <span className="wave">👋</span>
          </h1>
          <p className="text-[#4a5568] dark:text-[#8b949e] mt-2 text-sm sm:text-base font-medium">
            Browse all problems — filter by company, topic & difficulty.
          </p>
        </div>

        {/* ── Stats bar ──────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-2xl shadow-sm mb-8 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] dark:divide-[#30363d]">
            {[
              {
                label: "Solved",
                value: statsLoading ? "…" : String(solvedCount),
                sub: `of ${totalProblems}`,
                color: "text-emerald-500",
              },
              {
                label: "Progress",
                value: statsLoading ? "…" : `${solvedPct}%`,
                sub: "completion",
                color: "text-amber-500",
              },
              {
                label: "Problems",
                value: statsLoading ? "…" : String(total || totalProblems),
                sub: "in bank",
                color: "text-blue-500",
              },
            ].map((s) => (
              <div key={s.label} className="p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:bg-[#f8fcfa] dark:hover:bg-[#0d1117]/40 transition-colors">
                <div className={`text-2xl sm:text-3xl font-black mb-0.5 ${s.color}`}>{s.value}</div>
                <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#a0aec0] dark:text-[#4b5563]">{s.label}</div>
                <div className="text-[9px] text-[#c4cdd6] dark:text-[#374151] hidden sm:block">{s.sub}</div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-[#f0f4f8] dark:bg-[#0d1117]">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
              style={{ width: `${solvedPct}%` }}
            />
          </div>
        </div>

        {/* ── Problem Bank ───────────────────────────────────────────────── */}
        <div>
          {/* Section header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1a202c] dark:text-[#f0f6fc]">
                Problem Bank
              </h2>
              <p className="text-xs text-[#a0aec0] dark:text-[#4b5563] mt-0.5">
                {loading ? "Loading…" : `${total.toLocaleString()} problems • showing ${problems.length}`}
              </p>
            </div>
            <Link
              href="/learning/dsa_sheet"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              DSA Sheet <FiArrowRight size={12} />
            </Link>
          </div>

          {/* Filter bar */}
          <div className="bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-2xl p-3 sm:p-4 mb-4 shadow-sm">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0aec0] dark:text-[#4b5563]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search problems…"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#e2e8f0] dark:border-[#30363d] bg-[#f8fafc] dark:bg-[#0d1117] text-xs font-medium text-[#1a202c] dark:text-[#f0f6fc] placeholder-[#a0aec0] dark:placeholder-[#4b5563] outline-none focus:border-emerald-400 dark:focus:border-emerald-600 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a0aec0] hover:text-[#4a5568] transition-colors"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </div>

              {/* Difficulty */}
              <SearchableSelect
                placeholder="Difficulty"
                value={difficulty}
                options={DIFFICULTY_OPTIONS}
                onChange={setDifficulty}
                icon={<FiFilter size={11} />}
              />

              {/* Status */}
              <SearchableSelect
                placeholder="Status"
                value={status}
                options={STATUS_OPTIONS}
                onChange={(v) => setStatus(v as "" | "solved" | "unsolved")}
                icon={<FiCheckCircle size={11} />}
              />

              {/* Company */}
              <SearchableSelect
                placeholder="Company"
                value={company}
                options={companyOptions}
                onChange={setCompany}
                icon={<HiOfficeBuilding size={11} />}
              />

              {/* Topic tag */}
              <SearchableSelect
                placeholder="Topic"
                value={tag}
                options={tagOptions}
                onChange={setTag}
                icon={<FiTag size={11} />}
              />

              {/* Clear all */}
              {activeFilters > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                >
                  <FiX size={11} /> Clear ({activeFilters})
                </button>
              )}
            </div>
          </div>

          {/* Active filter pills */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1a202c] text-white dark:bg-[#f0f6fc] dark:text-[#1a202c]">
                  &quot;{debouncedSearch}&quot; <FiX size={9} className="cursor-pointer" onClick={() => setSearch("")} />
                </span>
              )}
              {difficulty && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/50">
                  {difficulty} <FiX size={9} className="cursor-pointer" onClick={() => setDifficulty("")} />
                </span>
              )}
              {company && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50">
                  {companyOptions.find(c => c.value === company)?.label} <FiX size={9} className="cursor-pointer" onClick={() => setCompany("")} />
                </span>
              )}
              {tag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50">
                  {tagOptions.find(t => t.value === tag)?.label} <FiX size={9} className="cursor-pointer" onClick={() => setTag("")} />
                </span>
              )}
              {status && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50">
                  {status} <FiX size={9} className="cursor-pointer" onClick={() => setStatus("")} />
                </span>
              )}
            </div>
          )}

          {/* Problem table */}
          <div className="bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-2xl shadow-sm overflow-hidden">
            {/* Column header */}
            <div className="hidden sm:flex items-center gap-3 px-6 py-2.5 bg-[#f8fcfa] dark:bg-[#1c2228] border-b border-[#e8f5ee] dark:border-[#30363d]">
              <span className="w-6" />
              <span className="w-4" />
              <span className="flex-1 text-[10px] font-bold text-[#6b7280] dark:text-[#8b949e] uppercase tracking-wider">Problem</span>
              <span className="text-[10px] font-bold text-[#6b7280] dark:text-[#8b949e] uppercase tracking-wider pr-1">Tags & Actions</span>
            </div>

            {/* Loading state — first load */}
            {loading && (
              <div>
                {Array.from({ length: 15 }).map((_, i) => <SkeletonRow key={i} i={i} />)}
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-3">{error}</p>
                <button
                  onClick={loadFirstPage}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && problems.length === 0 && (
              <div className="p-12 text-center">
                <FiSearch size={32} className="text-[#c4cdd6] dark:text-[#374151] mx-auto mb-3" />
                <p className="text-sm font-medium text-[#6b7280] dark:text-[#8b949e]">No problems match your filters.</p>
                <button onClick={clearAll} className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Clear all filters</button>
              </div>
            )}

            {/* Problems */}
            {!loading && !error && problems.length > 0 && (
              <div>
                {problems.map((prob, idx) => (
                  <ProblemRow
                    key={prob.id}
                    prob={prob}
                    globalIndex={(page - 1) * LIMIT + idx + 1}
                    onToggle={handleToggle}
                  />
                ))}

                {/* Loading more skeleton */}
                {loadingMore && (
                  <div className="border-t border-[#f0f4f8] dark:border-[#30363d]">
                    {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} i={i} />)}
                  </div>
                )}

                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} className="h-4" />

                {/* End of results */}
                {!hasMore && problems.length > 0 && (
                  <div className="py-6 text-center border-t border-[#f0f4f8] dark:border-[#30363d]">
                    <p className="text-xs font-medium text-[#a0aec0] dark:text-[#4b5563]">
                      Showing all {problems.length.toLocaleString()} problems
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wave animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        .wave { display: inline-block; animation: wave 2.5s infinite; transform-origin: 70% 70%; }
        @keyframes wave {
          0%  { transform: rotate(0deg)   }
          10% { transform: rotate(14deg)  }
          20% { transform: rotate(-8deg)  }
          30% { transform: rotate(14deg)  }
          40% { transform: rotate(-4deg)  }
          50% { transform: rotate(10deg)  }
          60% { transform: rotate(0deg)   }
          100%{ transform: rotate(0deg)   }
        }
      `}} />
    </div>
  );
}