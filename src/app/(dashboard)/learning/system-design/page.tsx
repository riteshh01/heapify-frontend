"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiLayers,
  FiChevronRight,
  FiBook,
  FiClock,
  FiLock,
  FiAlertCircle,
  FiCopy,
  FiCheck,
  FiArrowLeft,
  FiArrowRight,
  FiPlay,
  FiChevronLeft,
  FiSearch,
  FiX,
  FiCode,
  FiMaximize2,
} from "react-icons/fi";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  fetchChaptersBySubjectName,
  fetchArticle,
  type TheoryChapter,
  type TheoryArticleStub,
  type TheoryArticle,
  type ArticleImage,
} from "@/services/theoryService";
import { PageLoader, ArticleLoader } from "@/components/loading/Spinner";

const CHAPTERS_PER_PAGE = 4;
const DEBOUNCE_MS = 350;

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all shrink-0 ${
        copied
          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700"
          : "bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:bg-[#30363d] hover:text-[#c9d1d9]"
      }`}
      title="Copy to clipboard"
    >
      {copied ? <FiCheck size={9} /> : <FiCopy size={9} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Structured JSON Types ────────────────────────────────────────────────────

/** Old format (sections-based) */
interface ArticleSection {
  heading: string;
  body?: string;
  code?: string;
  example?: string;
}
interface LegacyArticleJson {
  introduction?: string;
  sections?: ArticleSection[];
}

/** New system-design format — one topic per article */
interface SdTopicJson {
  name?: string;
  what_it_is_and_how_it_works?: string;
  real_world_analogy?: string;
  placement_in_architecture?: string;
  tradeoffs?: string;
  use_cases?: string;
  alternatives?: string;
  failure_modes?: string;
}

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({ code }: { code: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d] shadow-sm my-4">
      <div className="flex items-center justify-between bg-[#161b22] border-b border-[#30363d] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FiCode size={13} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-[#7d8590] uppercase tracking-widest">
            code
          </span>
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="bg-[#0d1117] px-5 py-4 overflow-x-auto text-[12.5px] font-mono text-[#e6edf3] leading-relaxed [scrollbar-width:thin] [scrollbar-color:#21262d_transparent] whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Example Block ────────────────────────────────────────────────────────────
function ExampleBlock({ code }: { code: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d] shadow-sm my-4">
      <div className="flex items-center justify-between bg-[#161b22] border-b border-[#30363d] px-4 py-2.5">
        <span className="text-[10px] font-bold text-[#7d8590] uppercase tracking-widest">
          example
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="bg-[#0d1117] px-5 py-4 overflow-x-auto text-[12.5px] font-mono text-[#e6edf3] leading-relaxed [scrollbar-width:thin] [scrollbar-color:#21262d_transparent] whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Inline Image (with hover expand + lightbox) ─────────────────────────────
function InlineImage({ img }: { img: ArticleImage }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <div
        className="relative group my-6 w-full md:w-[70%] lg:w-[60%] mx-auto rounded-xl overflow-hidden border border-[#e2e8f0] dark:border-[#30363d] cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.imageUrl}
          alt={img.caption ?? "Diagram"}
          className="w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg backdrop-blur-sm"
        >
          <FiMaximize2 size={11} />
          Full size
        </button>
      </div>
      {img.caption && (
        <p className="text-center text-[12px] text-[#9ca3af] dark:text-[#6b7280] italic -mt-4 mb-6">
          {img.caption}
        </p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all z-10"
            aria-label="Close"
          >
            <FiX size={14} />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={img.caption ?? "Diagram"}
              className="w-[70%] mx-auto object-contain rounded-xl"
              loading="lazy"
            />
            {img.caption && (
              <p className="text-center text-[13px] text-white/60 mt-4 italic">
                {img.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── SD Section ───────────────────────────────────────────────────────────────
/**
 * Each section has a unique accent color + badge label.
 * The left border + pill badge make each heading instantly recognisable.
 */
type SdSectionVariant =
  | "analogy"
  | "architecture"
  | "tradeoff"
  | "usecases"
  | "alternatives"
  | "failure";

const SD_SECTION_STYLES: Record<
  SdSectionVariant,
  { border: string; badge: string; label: string }
> = {
  analogy: {
    border: "border-amber-400 dark:border-amber-500",
    badge:
      "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60",
    label: "Analogy",
  },
  architecture: {
    border: "border-violet-400 dark:border-violet-500",
    badge:
      "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700/60",
    label: "Architecture",
  },
  tradeoff: {
    border: "border-rose-400 dark:border-rose-500",
    badge:
      "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/60",
    label: "Tradeoff",
  },
  usecases: {
    border: "border-sky-400 dark:border-sky-500",
    badge:
      "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700/60",
    label: "Use Cases",
  },
  alternatives: {
    border: "border-teal-400 dark:border-teal-500",
    badge:
      "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/60",
    label: "Alternatives",
  },
  failure: {
    border: "border-red-500 dark:border-red-600",
    badge:
      "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/60",
    label: "Failure Modes",
  },
};

function SdSection({
  variant,
  body,
}: {
  variant: SdSectionVariant;
  body: string;
}) {
  const { border, badge, label } = SD_SECTION_STYLES[variant];
  return (
    <div className="mb-9">
      {/* Heading row */}
      <div className={`flex items-center gap-3 mb-4 pl-4 border-l-[3.5px] ${border}`}>
        <h2 className="text-[19px] font-bold text-[#111827] dark:text-[#f0f6fc] leading-snug tracking-tight">
          {label}
        </h2>
        <span className={`text-[10.5px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md ${badge}`}>
          {label}
        </span>
      </div>
      {/* Body */}
      <p
        className="text-[16px] text-[#374151] dark:text-[#b0bec5] leading-[1.95] tracking-[0.012em]"
        style={{ wordSpacing: "0.06em" }}
      >
        {body}
      </p>
    </div>
  );
}

// ─── SD Topic Content ─────────────────────────────────────────────────────────
function SdTopicContent({ topic, images }: { topic: SdTopicJson; images?: ArticleImage[] }) {
  const introText = topic.what_it_is_and_how_it_works ?? "";
  const firstDot = introText.search(/[.!?](?:\s|$)/);
  const callout = firstDot !== -1 ? introText.slice(0, firstDot + 1).trim() : introText;
  const rest = firstDot !== -1 ? introText.slice(firstDot + 1).trim() : "";

  return (
    <div>
      {/* Intro: blue callout + remaining paragraph */}
      {introText && (
        <div className="mb-9">
          {callout && (
            <div className="border-l-[3px] border-blue-500 dark:border-blue-400 pl-4 mb-5">
              <p
                className="text-[16px] text-[#374151] dark:text-[#b0bec5] leading-[1.95] tracking-[0.012em]"
                style={{ wordSpacing: "0.06em" }}
              >
                {callout}
              </p>
            </div>
          )}
          {rest && (
            <p
              className="text-[16px] text-[#374151] dark:text-[#b0bec5] leading-[1.95] tracking-[0.012em]"
              style={{ wordSpacing: "0.06em" }}
            >
              {rest}
            </p>
          )}
        </div>
      )}

      {/* Images — after intro, before sections */}
      {images && images.length > 0 && images.map((img) => (
        <InlineImage key={img.id} img={img} />
      ))}

      {topic.real_world_analogy && (
        <SdSection variant="analogy" body={topic.real_world_analogy} />
      )}
      {topic.placement_in_architecture && (
        <SdSection variant="architecture" body={topic.placement_in_architecture} />
      )}
      {topic.tradeoffs && (
        <SdSection variant="tradeoff" body={topic.tradeoffs} />
      )}
      {topic.use_cases && (
        <SdSection variant="usecases" body={topic.use_cases} />
      )}
      {topic.alternatives && (
        <SdSection variant="alternatives" body={topic.alternatives} />
      )}
      {topic.failure_modes && (
        <SdSection variant="failure" body={topic.failure_modes} />
      )}
    </div>
  );
}

// ─── Markdown → SD Topic parser ───────────────────────────────────────────────
const SD_HEADER_MAP: Record<string, keyof SdTopicJson> = {
  "what it is and how it works": "what_it_is_and_how_it_works",
  "what it is & how it works": "what_it_is_and_how_it_works",
  "real world analogy": "real_world_analogy",
  "real-world analogy": "real_world_analogy",
  "placement in architecture": "placement_in_architecture",
  "placement in the architecture": "placement_in_architecture",
  tradeoffs: "tradeoffs",
  "trade-offs": "tradeoffs",
  "trade offs": "tradeoffs",
  "use cases": "use_cases",
  "use-cases": "use_cases",
  alternatives: "alternatives",
  "failure modes": "failure_modes",
  "failure-modes": "failure_modes",
};

function parseSdMarkdown(text: string): SdTopicJson | null {
  if (!text.includes("###")) return null;
  const topic: SdTopicJson = {};
  const blocks = text.split(/^###\s+/m).filter(Boolean);
  for (const block of blocks) {
    const newlineIdx = block.indexOf("\n");
    if (newlineIdx === -1) continue;
    const rawHeader = block.slice(0, newlineIdx).trim();
    const body = block.slice(newlineIdx + 1).trim();
    const key = SD_HEADER_MAP[rawHeader.toLowerCase()];
    if (key && body) topic[key] = body;
  }
  return Object.keys(topic).length > 0 ? topic : null;
}

// ─── Article Content ──────────────────────────────────────────────────────────
function ArticleContent({ content, images }: { content: string; images?: ArticleImage[] }) {
  // 1. SD Markdown (### headers)
  const sdTopic = parseSdMarkdown(content);
  if (sdTopic) return <SdTopicContent topic={sdTopic} images={images} />;

  // 2. Legacy JSON
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any = null;
  try { parsed = JSON.parse(content); } catch { /* not JSON */ }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const isSdJson =
      "what_it_is_and_how_it_works" in parsed ||
      "placement_in_architecture" in parsed ||
      "failure_modes" in parsed;
    if (isSdJson) return <SdTopicContent topic={parsed as SdTopicJson} images={images} />;

    const legacy = parsed as LegacyArticleJson;
    return (
      <div className="space-y-8">
        {legacy.introduction && (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 dark:border-emerald-400 rounded-r-2xl px-6 py-5">
            <p className="text-[13.5px] text-[#1a202c] dark:text-[#c8d3e0] leading-[1.85] font-medium">
              {legacy.introduction}
            </p>
          </div>
        )}
        {legacy.sections?.map((section, idx) => (
          <section key={idx} className="space-y-3">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-1 h-5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 inline-block" />
              <h2 className="text-base font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
                {section.heading}
              </h2>
            </div>
            {section.body && (
              <p className="text-[13.5px] text-[#374151] dark:text-[#c9d1d9] leading-[1.85] pl-3.5">
                {section.body}
              </p>
            )}
            {section.code && (
              <div className="pl-3.5">
                <CodeBlock code={section.code} />
              </div>
            )}
            {section.example && (
              <div className="pl-3.5">
                <ExampleBlock code={section.example} />
              </div>
            )}
          </section>
        ))}
      </div>
    );
  }

  // 3. Plain text fallback
  return (
    <div className="text-[16px] text-[#374151] dark:text-[#c9d1d9] leading-[1.95] whitespace-pre-wrap">
      {content}
    </div>
  );
}

// ─── Highlight matching text ──────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-emerald-200 dark:bg-emerald-700/60 text-emerald-900 dark:text-emerald-100 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─── Chapter Card ─────────────────────────────────────────────────────────────
function ChapterCard({
  chapter,
  globalIdx,
  searchQuery,
  onArticleClick,
}: {
  chapter: TheoryChapter;
  globalIdx: number;
  searchQuery: string;
  onArticleClick: (article: TheoryArticleStub) => void;
}) {
  const chapterTotalTime = chapter.articles.reduce(
    (a, art) => a + art.readTimeMinutes,
    0
  );
  const displayArticles = searchQuery.trim()
    ? chapter.articles.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chapter.articles.slice(0, 3);
  const hiddenCount =
    !searchQuery.trim() && chapter.articles.length > 3
      ? chapter.articles.length - 3
      : 0;

  return (
    <div className="group bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] hover:border-emerald-500 dark:hover:border-emerald-500 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Card header */}
      <div className="flex items-start justify-between mb-5">
        <div className="p-3.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
          <FiLayers size={20} />
        </div>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
          Chapter {globalIdx + 1}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        <Highlight text={chapter.name} query={searchQuery} />
      </h3>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-5">
        <span className="flex items-center gap-1 text-[11px] font-medium text-[#4a5568] dark:text-[#8b949e]">
          <FiBook size={11} />
          {chapter.articles.length}{" "}
          {chapter.articles.length === 1 ? "article" : "articles"}
        </span>
        {chapterTotalTime > 0 && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-[#4a5568] dark:text-[#8b949e]">
            <FiClock size={11} />
            {chapterTotalTime}m read
          </span>
        )}
      </div>

      {/* Article list */}
      {displayArticles.length > 0 && (
        <div className="space-y-1.5 mb-5">
          {displayArticles.map((article, artIdx) => (
            <button
              key={article.id}
              onClick={() => onArticleClick(article)}
              className="w-full flex items-center gap-2 text-left text-[12px] text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
            >
              <span className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] w-4 shrink-0 text-right">
                {String(artIdx + 1).padStart(2, "0")}
              </span>
              {article.isPremium && (
                <FiLock size={9} className="shrink-0 text-amber-500" />
              )}
              <span className="truncate font-medium">
                <Highlight text={article.title} query={searchQuery} />
              </span>
            </button>
          ))}
          {hiddenCount > 0 && (
            <p className="text-[11px] text-[#a0aec0] dark:text-[#64748b] pl-6 font-medium">
              +{hiddenCount} more articles
            </p>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
        Start studying
        <FiArrowRight
          size={14}
          className="group-hover:translate-x-1 transition-transform"
        />
      </div>
    </div>
  );
}

// ─── Chapters Grid ────────────────────────────────────────────────────────────
function ChaptersGrid({
  chapters,
  currentPage,
  searchQuery,
  onArticleClick,
  onPageChange,
}: {
  chapters: TheoryChapter[];
  currentPage: number;
  searchQuery: string;
  onArticleClick: (article: TheoryArticleStub) => void;
  onPageChange: (page: number) => void;
}) {
  const totalArticles = chapters.reduce((acc, c) => acc + c.articles.length, 0);
  const isSearching = searchQuery.trim().length > 0;

  const filteredChapters = isSearching
    ? chapters.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.articles.some((a) =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : chapters;

  const totalPages = Math.ceil(filteredChapters.length / CHAPTERS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIdx = (safePage - 1) * CHAPTERS_PER_PAGE;
  const pageChapters = isSearching
    ? filteredChapters
    : filteredChapters.slice(startIdx, startIdx + CHAPTERS_PER_PAGE);

  const matchCount = isSearching
    ? filteredChapters.reduce(
        (acc, c) =>
          acc +
          c.articles.filter((a) =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase())
          ).length,
        0
      )
    : 0;

  return (
    <div>
      {/* Hero Header */}
      <div className="mb-10">
        <div className="flex items-start gap-6">
          <div className="h-16 w-16 rounded-3xl bg-emerald-600 flex items-center justify-center shadow-md shrink-0">
            <FiLayers size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
              System Design
            </h1>
            <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mt-3 leading-relaxed max-w-xl">
              Master scalability, distributed systems, databases, and
              microservices — essential concepts for cracking High Level Design
              (HLD) interviews at top product companies.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 rounded-lg">
                {chapters.length} Chapters
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 rounded-lg">
                {totalArticles} Articles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search result info */}
      {isSearching && (
        <div className="mb-5 flex items-center gap-2">
          <FiSearch size={13} className="text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e]">
            {filteredChapters.length === 0 ? (
              <>
                No chapters matched{" "}
                <span className="font-bold text-[#1a202c] dark:text-[#f0f6fc]">
                  &quot;{searchQuery}&quot;
                </span>
              </>
            ) : (
              <>
                <span className="font-bold text-[#1a202c] dark:text-[#f0f6fc]">
                  {filteredChapters.length}
                </span>{" "}
                chapter{filteredChapters.length !== 1 ? "s" : ""} ·{" "}
                <span className="font-bold text-[#1a202c] dark:text-[#f0f6fc]">
                  {matchCount}
                </span>{" "}
                article{matchCount !== 1 ? "s" : ""} matched{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  &quot;{searchQuery}&quot;
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Empty search state */}
      {isSearching && filteredChapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#f0f3f6] dark:bg-[#21262d] flex items-center justify-center">
            <FiSearch size={24} className="text-[#a0aec0] dark:text-[#64748b]" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-1">
              No results found
            </p>
            <p className="text-sm text-[#4a5568] dark:text-[#8b949e]">
              Try a different search term
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Chapter Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {pageChapters.map((chapter, idx) => {
              const globalIdx = isSearching
                ? chapters.indexOf(chapter)
                : startIdx + idx;
              return (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  globalIdx={globalIdx}
                  searchQuery={searchQuery}
                  onArticleClick={onArticleClick}
                />
              );
            })}
          </div>

          {/* Pagination */}
          {!isSearching && totalPages > 1 && (
            <>
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => onPageChange(safePage - 1)}
                  disabled={safePage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold border border-[#d1e8d8] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#4a5568] dark:text-[#8b949e] hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft size={14} />
                  Previous
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 rounded-xl text-[12px] font-bold transition-all ${
                          page === safePage
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] text-[#4a5568] dark:text-[#8b949e] hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => onPageChange(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold border border-[#d1e8d8] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#4a5568] dark:text-[#8b949e] hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <FiChevronRight size={14} />
                </button>
              </div>
              <p className="text-center text-[11px] text-[#a0aec0] dark:text-[#64748b] font-medium mt-3">
                Page {safePage} of {totalPages} · Showing chapters{" "}
                {startIdx + 1}–
                {Math.min(startIdx + CHAPTERS_PER_PAGE, chapters.length)} of{" "}
                {chapters.length}
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Article Reader Panel ─────────────────────────────────────────────────────
function ArticlePanel({
  article,
  isLoading,
  onBack,
  allChapters,
  onArticleClick,
}: {
  article: TheoryArticle | null;
  isLoading: boolean;
  onBack: () => void;
  allChapters: TheoryChapter[];
  onArticleClick: (article: TheoryArticleStub) => void;
}) {
  if (isLoading) return <ArticleLoader />;
  if (!article) return null;

  const allArticles: { stub: TheoryArticleStub; chapterName: string }[] = [];
  for (const chapter of allChapters) {
    for (const stub of chapter.articles) {
      allArticles.push({ stub, chapterName: chapter.name });
    }
  }
  const currentIdx = allArticles.findIndex((a) => a.stub.id === article.id);
  const prevItem = currentIdx > 0 ? allArticles[currentIdx - 1] : null;
  const nextItem =
    currentIdx < allArticles.length - 1 ? allArticles[currentIdx + 1] : null;

  return (
    <div>
      {/* Article header */}
      <div className="mb-6 p-6 bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-4 font-bold"
        >
          <FiArrowLeft size={11} />
          Back to chapters
        </button>

        <p className="text-[10px] text-[#a0aec0] dark:text-[#64748b] uppercase font-bold tracking-[0.15em] mb-1">
          {article.chapterName}
        </p>
        <h1 className="text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] mb-3 leading-tight tracking-tight">
          {article.title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#4a5568] dark:text-[#8b949e]">
            <FiClock size={12} />
            {article.readTimeMinutes} min read
          </span>
          {article.isPremium && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-md">
              <FiLock size={10} />
              Premium
            </span>
          )}
          {article.videoLink && (
            <a
              href={article.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 px-2 py-0.5 rounded-md hover:opacity-80 transition-opacity"
            >
              <FiPlay size={10} />
              Watch Video
            </a>
          )}
        </div>
      </div>

      {/* Article body */}
      <div className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl shadow-sm px-7 py-8 mb-6">
        <ArticleContent content={article.content} images={article.images ?? []} />
      </div>

      {/* Prev / Next */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {prevItem ? (
          <button
            onClick={() => onArticleClick(prevItem.stub)}
            className="group text-left bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:shadow-sm"
          >
            <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] uppercase tracking-wider mb-1 flex items-center gap-1">
              <FiArrowLeft size={9} />
              Previous
            </div>
            <div className="text-sm font-bold text-[#2d3748] dark:text-[#e2e8f0] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
              {prevItem.stub.title}
            </div>
            <div className="text-[10px] text-[#a0aec0] dark:text-[#64748b] mt-0.5">
              {prevItem.chapterName}
            </div>
          </button>
        ) : (
          <div />
        )}
        {nextItem ? (
          <button
            onClick={() => onArticleClick(nextItem.stub)}
            className="group text-right bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:shadow-sm"
          >
            <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] uppercase tracking-wider mb-1 flex items-center gap-1 justify-end">
              Next
              <FiChevronRight size={9} />
            </div>
            <div className="text-sm font-bold text-[#2d3748] dark:text-[#e2e8f0] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
              {nextItem.stub.title}
            </div>
            <div className="text-[10px] text-[#a0aec0] dark:text-[#64748b] mt-0.5">
              {nextItem.chapterName}
            </div>
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// ─── Main System Design Page ──────────────────────────────────────────────────
export default function SystemDesignPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [chapters, setChapters] = useState<TheoryChapter[]>([]);
  const [isChaptersLoading, setChaptersLoading] = useState(true);
  const [chaptersError, setChaptersError] = useState<string | null>(null);

  const [view, setView] = useState<"chapters" | "article">("chapters");
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);
  const [activeArticle, setActiveArticle] = useState<TheoryArticle | null>(null);
  const [isArticleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync page + search from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get("page") ?? "1", 10);
    setCurrentPage(Math.max(1, isNaN(p) ? 1 : p));
    const q = params.get("q") ?? "";
    setSearchInput(q);
    setSearchQuery(q);
  }, []);

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchQuery(value);
        setCurrentPage(1);
        const params = new URLSearchParams(
          typeof window !== "undefined" ? window.location.search : ""
        );
        if (value.trim()) {
          params.set("q", value.trim());
          params.delete("page");
        } else {
          params.delete("q");
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }, DEBOUNCE_MS);
    },
    [router, pathname]
  );

  const clearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setSearchQuery("");
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    params.delete("q");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname]);

  // Cleanup debounce on unmount
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const articleCacheRef = useRef<Map<number, TheoryArticle>>(new Map());
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    const load = async () => {
      try {
        setChaptersLoading(true);
        setChaptersError(null);
        const result = await fetchChaptersBySubjectName("system design");
        setChapters(result.chapters);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load chapters";
        setChaptersError(msg);
      } finally {
        setChaptersLoading(false);
      }
    };
    load();
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      params.set("page", String(page));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname]
  );

  const handleArticleClick = useCallback(
    async (article: TheoryArticleStub) => {
      if (activeArticleId === article.id && view === "article") return;
      setView("article");
      setActiveArticleId(article.id);
      setArticleError(null);
      if (articleCacheRef.current.has(article.id)) {
        setActiveArticle(articleCacheRef.current.get(article.id)!);
        return;
      }
      setActiveArticle(null);
      setArticleLoading(true);
      try {
        const data = await fetchArticle(article.id);
        articleCacheRef.current.set(article.id, data);
        setActiveArticle(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load article";
        setArticleError(msg);
      } finally {
        setArticleLoading(false);
      }
    },
    [activeArticleId, view]
  );

  const handleChaptersClick = useCallback(() => {
    setView("chapters");
    setActiveArticleId(null);
    setActiveArticle(null);
    setArticleError(null);
  }, []);

  const totalArticles = chapters.reduce((acc, c) => acc + c.articles.length, 0);

  if (isChaptersLoading) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-[#f4fcf7] dark:bg-[#0d1117]">
        <PageLoader />
      </div>
    );
  }

  if (chaptersError) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#f4fcf7] dark:bg-[#0d1117]">
        <div className="max-w-md text-center bg-white dark:bg-[#161b22] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-8 shadow-sm">
          <FiAlertCircle size={36} className="text-rose-500 dark:text-rose-400 mx-auto mb-4" />
          <h2 className="font-bold text-xl text-[#1a202c] dark:text-[#f0f6fc] mb-2">
            Could not load data
          </h2>
          <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mb-6">
            {chaptersError}
          </p>
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

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f4fcf7] dark:bg-[#0d1117] text-[#2d3748] dark:text-[#e2e8f0] font-sans transition-colors duration-300">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 bg-[#f4fcf7]/90 dark:bg-[#0d1117]/90 backdrop-blur-sm border-b border-[#d1e8d8] dark:border-[#30363d] px-6 py-3 transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748b] dark:text-[#8b949e] font-medium shrink-0">
            <Link
              href="/dashboard"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            {view === "article" ? (
              <button
                onClick={handleChaptersClick}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                System Design
              </button>
            ) : (
              <span className="text-[#1a202c] dark:text-[#f0f6fc] font-bold">
                System Design
              </span>
            )}
            {view === "article" && activeArticle && (
              <>
                <span>/</span>
                <span className="text-[#1a202c] dark:text-[#f0f6fc] font-bold truncate max-w-[200px]">
                  {activeArticle.title}
                </span>
              </>
            )}
          </div>

          {/* Search bar — only shown on chapters view */}
          {view === "chapters" && (
            <div className="flex-1 relative max-w-md ml-auto">
              <FiSearch
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0aec0] dark:text-[#64748b] pointer-events-none"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search chapters or articles..."
                className="w-full pl-9 pr-9 py-2 text-[13px] font-medium rounded-xl border border-[#d1e8d8] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#1a202c] dark:text-[#f0f6fc] placeholder-[#a0aec0] dark:placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-600 focus:border-transparent transition-all"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0] dark:text-[#64748b] hover:text-[#4a5568] dark:hover:text-[#8b949e] transition-colors"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          )}

          {/* Stats badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-full shadow-sm shrink-0">
            <FiBook className="text-emerald-600 dark:text-emerald-400" size={13} />
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wide">
              {totalArticles} Articles
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 md:px-8 md:py-10">
        {view === "chapters" ? (
          <ChaptersGrid
            chapters={chapters}
            currentPage={currentPage}
            searchQuery={searchQuery}
            onArticleClick={handleArticleClick}
            onPageChange={handlePageChange}
          />
        ) : articleError ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center bg-white dark:bg-[#21262d] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-8 shadow-sm max-w-md">
              <FiAlertCircle
                size={28}
                className="text-rose-500 dark:text-rose-400 mx-auto mb-3"
              />
              <p className="text-sm font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-2">
                Failed to load article
              </p>
              <p className="text-xs text-[#4a5568] dark:text-[#8b949e] mb-4">
                {articleError}
              </p>
              <button
                onClick={handleChaptersClick}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                ← Back to chapters
              </button>
            </div>
          </div>
        ) : (
          <ArticlePanel
            article={activeArticle}
            isLoading={isArticleLoading}
            onBack={handleChaptersClick}
            allChapters={chapters}
            onArticleClick={handleArticleClick}
          />
        )}
      </main>
    </div>
  );
}