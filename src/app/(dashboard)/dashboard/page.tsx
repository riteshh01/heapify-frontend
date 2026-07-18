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
import quotesData from "@/data/quote.json";

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

// ─── Searchable Select (For Difficulty, Status) ──────────────────────────────

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

// ─── Company Specific Select (Capsule UI) ──────────────────────────────────

function CompanySelect({
  value,
  companies,
  onChange,
}: {
  value: string;
  companies: CompanyItem[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = q
    ? companies.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    : companies;

  const selectedCompany = companies.find((c) => c.slug === value);

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
            ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
            : "border-[#e2e8f0] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#4a5568] dark:text-[#8b949e] hover:border-blue-400 dark:hover:border-blue-600"
        }`}
      >
        <HiOfficeBuilding size={11} className="shrink-0" />
        <span className="truncate max-w-[110px]">
          {selectedCompany ? selectedCompany.name : "Company"}
        </span>
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
        <div className="absolute -left-16 sm:-left-32 top-full mt-1.5 z-50 w-[300px] sm:w-[450px] bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-2xl shadow-xl p-4 overflow-hidden">
          <div className="relative mb-4">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0aec0] dark:text-[#4b5563]" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search companies..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#f4f6f8] dark:bg-[#0d1117] border border-[#e2e8f0] dark:border-[#30363d] text-xs font-medium text-[#1a202c] dark:text-[#f0f6fc] placeholder-[#a0aec0] dark:placeholder-[#4b5563] outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="max-h-64 overflow-y-auto [scrollbar-width:thin] pr-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-[#a0aec0] text-center py-4">No companies found.</p>
            ) : (
              <div className="flex flex-wrap gap-2 p-1">
                <button
                  onClick={() => { onChange(""); setOpen(false); setQ(""); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                    value === ""
                      ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50"
                      : "bg-white text-[#4a5568] border-[#e2e8f0] hover:bg-[#f4f6f8] dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-[#30363d]"
                  }`}
                >
                  All Companies
                </button>

                {filtered.map((c) => {
                  const isActive = value === c.slug;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => { onChange(c.slug); setOpen(false); setQ(""); }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all hover:scale-105 active:scale-95 ${
                        isActive
                          ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50 shadow-sm"
                          : "bg-white text-[#4a5568] border-[#e2e8f0] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-blue-900/20 dark:hover:border-blue-700/50 dark:hover:text-blue-400"
                      }`}
                    >
                      {c.logo_url ? (
                        <img src={c.logo_url} alt="" className="w-4 h-4 object-contain rounded-sm bg-white" />
                      ) : (
                        <HiOfficeBuilding size={12} className="opacity-50" />
                      )}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Topic Specific Select (Capsule UI) ────────────────────────────────────

function TopicSelect({
  value,
  tags,
  onChange,
}: {
  value: string;
  tags: TagItem[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = q
    ? tags.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()))
    : tags;

  const selectedTag = tags.find((t) => t.slug === value);

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
            ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
            : "border-[#e2e8f0] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#4a5568] dark:text-[#8b949e] hover:border-orange-400 dark:hover:border-orange-600"
        }`}
      >
        <FiTag size={11} className="shrink-0" />
        <span className="truncate max-w-[110px]">
          {selectedTag ? selectedTag.name : "Topic"}
        </span>
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
        <div className="absolute -left-16 sm:-left-32 top-full mt-1.5 z-50 w-[300px] sm:w-[450px] bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-2xl shadow-xl p-4 overflow-hidden">
          <div className="relative mb-4">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0aec0] dark:text-[#4b5563]" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search topics..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#f4f6f8] dark:bg-[#0d1117] border border-[#e2e8f0] dark:border-[#30363d] text-xs font-medium text-[#1a202c] dark:text-[#f0f6fc] placeholder-[#a0aec0] dark:placeholder-[#4b5563] outline-none focus:border-orange-400 dark:focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="max-h-64 overflow-y-auto [scrollbar-width:thin] pr-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-[#a0aec0] text-center py-4">No topics found.</p>
            ) : (
              <div className="flex flex-wrap gap-2 p-1">
                <button
                  onClick={() => { onChange(""); setOpen(false); setQ(""); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                    value === ""
                      ? "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700/50"
                      : "bg-white text-[#4a5568] border-[#e2e8f0] hover:bg-[#f4f6f8] dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-[#30363d]"
                  }`}
                >
                  All Topics
                </button>

                {filtered.map((t) => {
                  const isActive = value === t.slug;
                  return (
                    <button
                      key={t.slug}
                      onClick={() => { onChange(t.slug); setOpen(false); setQ(""); }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all hover:scale-105 active:scale-95 ${
                        isActive
                          ? "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700/50 shadow-sm"
                          : "bg-white text-[#4a5568] border-[#e2e8f0] hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d] dark:hover:bg-orange-900/20 dark:hover:border-orange-700/50 dark:hover:text-orange-400"
                      }`}
                    >
                      <FiTag size={10} className="opacity-70" />
                      {t.name}
                    </button>
                  );
                })}
              </div>
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
  items: { label: string; logoUrl?: string | null }[];
  colorClass: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const SHOW = 3;
  const visible = expanded ? items : items.slice(0, SHOW);
  const extra = items.length - SHOW;

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visible.map((item) => (
        <span
          key={item.label}
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}
        >
          {item.logoUrl && (
            <img src={item.logoUrl} alt="" className="w-4 h-4 object-contain rounded-sm" />
          )}
          {item.label}
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
              ? "text-[#a0aec0] dark:text-[#4b5563] decoration-[#c4cdd6]"
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
                items={prob.topics.map(t => ({ label: t }))}
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
                items={prob.companies.map(c => ({ label: c.name, logoUrl: c.logo_url }))}
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

  // ── Random Quote ──────────────────────────────────────────────────────────
  const [randomQuote, setRandomQuote] = useState<{ quote: string; author: string } | null>(null);

  useEffect(() => {
    if (quotesData && quotesData.quotes && quotesData.quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotesData.quotes.length);
      setRandomQuote(quotesData.quotes[randomIndex]);
    }
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [solvedCount, setSolvedCount]   = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [isStatsLoading, setIsStatsLoading]  = useState(true);

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
    if (!user) { setIsStatsLoading(false); return; }
    fetchProgressSummary()
      .then(({ summary }) => {
        setSolvedCount(summary.totalSolved);
        setTotalProblems(summary.totalProblems);
      })
      .catch(() => {})
      .finally(() => setIsStatsLoading(false));
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

        {/* ── Quote ──────────────────────────────────────────────────────── */}
        {randomQuote && (
          <div className="mb-6 flex items-center justify-center px-6 py-3 bg-white dark:bg-[#21262d] rounded-full shadow-sm border border-[#e2e8f0] dark:border-[#30363d] w-fit mx-auto transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
              <span className="text-[#4a5568] dark:text-[#c9d1d9] italic text-sm sm:text-base font-medium">
                "{randomQuote.quote}"
              </span>
              
              {/* Divider - sirf badi screens par dikhega */}
              <span className="hidden sm:inline text-gray-300 dark:text-gray-600">
                |
              </span>
              
              <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold tracking-wide uppercase whitespace-nowrap">
                {randomQuote.author}
              </span>
            </div>
          </div>
        )}

        {/* ── Stats bar ──────────────────────────────────────────────────── */}
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
                  {solvedCount > 0
                    ? `${totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0}% completed. You're doing great, keep up the momentum!`
                    : "You haven't solved any problems yet. Check out the DSA Sheet to get started!"}
                </p>
              </div>
              <Link 
                href="/learning/dsa_sheet" 
                className="shrink-0 inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-[#eaf5ed] hover:scale-105 transition-all shadow-sm active:scale-95"
              >
                {solvedCount > 0 ? "Continue Learning" : "Start Learning"} <FiArrowRight size={18} />
              </Link>
            </div>
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

              {/* Company Capsule UI */}
              <CompanySelect
                value={company}
                companies={companies}
                onChange={setCompany}
              />

              {/* Topic Capsule UI */}
              <TopicSelect
                value={tag}
                tags={tags}
                onChange={setTag}
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
                  {companies.find(c => c.slug === company)?.name} <FiX size={9} className="cursor-pointer" onClick={() => setCompany("")} />
                </span>
              )}
              {tag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50">
                  {tags.find(t => t.slug === tag)?.name} <FiX size={9} className="cursor-pointer" onClick={() => setTag("")} />
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