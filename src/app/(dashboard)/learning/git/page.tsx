"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiGitBranch,
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
  FiTerminal,
  FiInfo,
  FiX,
} from "react-icons/fi";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  fetchChaptersBySubjectName,
  fetchArticle,
  type TheoryChapter,
  type TheoryArticleStub,
  type TheoryArticle,
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
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all shrink-0 ${copied
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
interface ArticleCommand {
  cmd: string;
  description?: string;
}
interface ArticleSection {
  heading: string;
  body?: string;
  commands?: ArticleCommand[];
  example?: string;
}
interface ArticleJson {
  introduction?: string;
  sections?: ArticleSection[];
}

// ─── Command Row ──────────────────────────────────────────────────────────────
function CommandRow({ cmd, description }: ArticleCommand) {
  return (
    <div className="group relative rounded-2xl overflow-hidden border border-[#d1e8d8] dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm mb-4 hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300">
      
      {/* 🟢 Top Bar */}
      <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-[#21262d] border-b border-[#d1e8d8] dark:border-[#30363d] px-3 md:px-4 py-2 md:py-2.5 transition-colors">
         <div className="flex items-center gap-2">
            <FiTerminal size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 tracking-widest uppercase">
              Terminal
            </span>
         </div>
         <CopyButton text={cmd} />
      </div>

      {/* 💻 Terminal Body */}
      <div className="p-3 md:p-4 bg-[#061409] dark:bg-[#040a06] overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#10b981_transparent]">
         <div className="flex items-start font-mono text-[12px] md:text-[13px] leading-relaxed">
            <span className="text-emerald-500 mr-3 select-none flex-shrink-0 mt-[1px]">
              ➜
            </span>
            <code className="text-emerald-100 font-semibold whitespace-pre break-normal">
              {cmd}
            </code>
         </div>
      </div>

      {/* 📝 Description Footer */}
      {description && (
        <div className="flex items-start gap-2.5 bg-white dark:bg-[#161b22] border-t border-[#d1e8d8] dark:border-[#30363d] px-3 md:px-4 py-2.5 md:py-3 transition-colors">
           <FiInfo size={14} className="text-emerald-500 dark:text-emerald-600 mt-0.5 shrink-0" />
           <p className="text-[11px] md:text-[12px] text-[#4a5568] dark:text-[#8b949e] font-medium leading-5">
             {description}
           </p>
        </div>
      )}
    </div>
  );
}

// ─── Example Block ────────────────────────────────────────────────────────────
function ExampleBlock({ code }: { code: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d] shadow-sm my-4">
      <div className="flex items-center justify-between bg-[#161b22] border-b border-[#30363d] px-3 md:px-4 py-2 md:py-2.5">
        <span className="text-[10px] font-bold text-[#7d8590] uppercase tracking-widest">example</span>
        <CopyButton text={code} />
      </div>
      <pre className="bg-[#0d1117] px-4 py-3 md:px-5 md:py-4 overflow-x-auto text-[11.5px] md:text-[12.5px] font-mono text-[#e6edf3] leading-relaxed [scrollbar-width:thin] [scrollbar-color:#21262d_transparent] whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Article Content ──────────────────────────────────────────────────────────
function ArticleContent({ content }: { content: string }) {
  let parsed: ArticleJson | null = null;
  try {
    parsed = JSON.parse(content) as ArticleJson;
  } catch {
    // not JSON
  }

  if (!parsed) {
    return (
      <div className="text-sm text-[#4a5568] dark:text-[#a8b2c0] leading-7 whitespace-pre-wrap">
        {content}
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {parsed.introduction && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 dark:border-emerald-400 rounded-r-xl md:rounded-r-2xl px-4 py-4 md:px-6 md:py-5">
          <p className="text-sm text-[#2d4a3a] dark:text-[#a8c8b8] leading-7 font-medium">
            {parsed.introduction}
          </p>
        </div>
      )}
      {parsed.sections?.map((section, idx) => (
        <section key={idx} className="space-y-3">
          <div className="flex items-center gap-2.5 mb-2 md:mb-3">
            <span className="w-1 h-5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 inline-block" />
            <h2 className="text-base font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
              {section.heading}
            </h2>
          </div>
          {section.body && (
            <p className="text-sm text-[#4a5568] dark:text-[#a8b2c0] leading-7 pl-3.5">
              {section.body}
            </p>
          )}
          {section.commands && section.commands.length > 0 && (
            <div className="pl-3.5 space-y-0">
              {section.commands.map((command, cIdx) => (
                <CommandRow key={cIdx} cmd={command.cmd} description={command.description} />
              ))}
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

// ─── Highlight matching text ──────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-emerald-200 dark:bg-emerald-700/60 text-emerald-900 dark:text-emerald-100 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─── Chapter Cards Grid with Pagination ──────────────────────────────────────
const accentColors = [
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800/50", hoverBorder: "hover:border-emerald-500 dark:hover:border-emerald-500" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800/50", hoverBorder: "hover:border-emerald-500 dark:hover:border-emerald-500" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800/50", hoverBorder: "hover:border-emerald-500 dark:hover:border-emerald-500" },
];

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
  const accent = accentColors[globalIdx % accentColors.length];
  const chapterTotalTime = chapter.articles.reduce((a, art) => a + art.readTimeMinutes, 0);

  const displayArticles = searchQuery.trim()
    ? chapter.articles.filter((a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : chapter.articles.slice(0, 3);

  const hiddenCount = !searchQuery.trim() && chapter.articles.length > 3
    ? chapter.articles.length - 3
    : 0;

  return (
    <div
      className={`group bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] ${accent.hoverBorder} p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-4 md:mb-5">
        <div className={`p-3 md:p-3.5 ${accent.bg} rounded-xl md:rounded-2xl ${accent.text}`}>
          <FiGitBranch size={20} />
        </div>
        <span className={`text-[10px] font-bold ${accent.text} ${accent.bg} px-3 py-1 rounded-lg border ${accent.border}`}>
          Chapter {globalIdx + 1}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        <Highlight text={chapter.name} query={searchQuery} />
      </h3>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-4 md:mb-5">
        <span className="flex items-center gap-1 text-[11px] font-medium text-[#4a5568] dark:text-[#8b949e]">
          <FiBook size={11} />
          {chapter.articles.length} {chapter.articles.length === 1 ? "article" : "articles"}
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
        <div className="space-y-1.5 mb-4 md:mb-5">
          {displayArticles.map((article, artIdx) => (
            <button
              key={article.id}
              onClick={() => onArticleClick(article)}
              className="w-full flex items-center gap-2 text-left text-[12px] text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
            >
              <span className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] w-4 shrink-0 text-right">
                {String(artIdx + 1).padStart(2, "0")}
              </span>
              {article.isPremium && <FiLock size={9} className="shrink-0 text-amber-500" />}
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
        <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

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
      <div className="mb-8 md:mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl md:rounded-3xl bg-emerald-600 flex items-center justify-center shadow-md shrink-0">
            <FiGitBranch size={24} className="text-white md:w-7 md:h-7" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
              Git & Version Control
            </h1>
            <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mt-2 md:mt-3 leading-relaxed max-w-xl">
              Master Git from the ground up — branching strategies, remote workflows, undoing mistakes,
              and advanced techniques used in real-world engineering teams.
            </p>
            <div className="flex items-center flex-wrap gap-3 md:gap-4 mt-3">
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
          <FiSearch size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e]">
            {filteredChapters.length === 0 ? (
              <>No chapters matched <span className="font-bold text-[#1a202c] dark:text-[#f0f6fc]">&quot;{searchQuery}&quot;</span></>
            ) : (
              <>
                <span className="font-bold text-[#1a202c] dark:text-[#f0f6fc]">{filteredChapters.length}</span> chapter{filteredChapters.length !== 1 ? "s" : ""} ·{" "}
                <span className="font-bold text-[#1a202c] dark:text-[#f0f6fc]">{matchCount}</span> article{matchCount !== 1 ? "s" : ""} matched{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-400 break-all">&quot;{searchQuery}&quot;</span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Empty search state */}
      {isSearching && filteredChapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 md:py-20 gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#f0f3f6] dark:bg-[#21262d] flex items-center justify-center">
            <FiSearch size={24} className="text-[#a0aec0] dark:text-[#64748b]" />
          </div>
          <div className="text-center px-4">
            <p className="text-base font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-1">No results found</p>
            <p className="text-sm text-[#4a5568] dark:text-[#8b949e]">Try a different search term</p>
          </div>
        </div>
      ) : (
        <>
          {/* Chapter Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-8">
            {pageChapters.map((chapter, idx) => {
              const globalIdx = isSearching ? chapters.indexOf(chapter) : startIdx + idx;
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
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => onPageChange(safePage - 1)}
                  disabled={safePage === 1}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-[12px] font-bold border border-[#d1e8d8] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#4a5568] dark:text-[#8b949e] hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft size={14} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`w-8 h-8 md:w-9 md:h-9 rounded-xl text-[12px] font-bold transition-all ${page === safePage
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] text-[#4a5568] dark:text-[#8b949e] hover:border-emerald-400 hover:text-emerald-600"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onPageChange(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-[12px] font-bold border border-[#d1e8d8] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#4a5568] dark:text-[#8b949e] hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next</span>
                  <FiChevronRight size={14} />
                </button>
              </div>

              <p className="text-center text-[11px] text-[#a0aec0] dark:text-[#64748b] font-medium mt-3">
                Page {safePage} of {totalPages} · Showing chapters {startIdx + 1}–{Math.min(startIdx + CHAPTERS_PER_PAGE, chapters.length)} of {chapters.length}
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
  if (isLoading) {
    return <ArticleLoader />;
  }

  if (!article) return null;

  const allArticles: { stub: TheoryArticleStub; chapterName: string }[] = [];
  for (const chapter of allChapters) {
    for (const stub of chapter.articles) {
      allArticles.push({ stub, chapterName: chapter.name });
    }
  }
  const currentIdx = allArticles.findIndex((a) => a.stub.id === article.id);
  const prevItem = currentIdx > 0 ? allArticles[currentIdx - 1] : null;
  const nextItem = currentIdx < allArticles.length - 1 ? allArticles[currentIdx + 1] : null;

  return (
    <div>
      {/* Article header */}
      <div className="mb-5 md:mb-6 p-5 md:p-6 bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl md:rounded-3xl shadow-sm">
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
        <h1 className="text-xl md:text-2xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] mb-3 leading-tight tracking-tight">
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
      <div className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl md:rounded-3xl shadow-sm px-5 py-6 md:px-8 md:py-8 mb-6">
        <ArticleContent content={article.content} />
      </div>

      {/* Prev / Next */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
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
            <div className="text-[10px] text-[#a0aec0] dark:text-[#64748b] mt-0.5 truncate">{prevItem.chapterName}</div>
          </button>
        ) : <div className="hidden sm:block" />}
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
            <div className="text-[10px] text-[#a0aec0] dark:text-[#64748b] mt-0.5 truncate">{nextItem.chapterName}</div>
          </button>
        ) : <div className="hidden sm:block" />}
      </div>
    </div>
  );
}

// ─── Main Git Page ────────────────────────────────────────────────────────────
export default function GitPage() {
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Search — input (immediate) vs query (debounced, written to URL)
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get("page") ?? "1", 10);
    setCurrentPage(Math.max(1, isNaN(p) ? 1 : p));
    const q = params.get("q") ?? "";
    setSearchInput(q);
    setSearchQuery(q);
  }, []);

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

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const articleCacheRef = useRef<Map<number, TheoryArticle>>(new Map());
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    const load = async () => {
      try {
        setChaptersLoading(true);
        setChaptersError(null);
        const result = await fetchChaptersBySubjectName("git");
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
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#f4fcf7] dark:bg-[#0d1117] p-4">
        <div className="w-full max-w-md text-center bg-white dark:bg-[#161b22] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 md:p-8 shadow-sm">
          <FiAlertCircle size={36} className="text-rose-500 dark:text-rose-400 mx-auto mb-4" />
          <h2 className="font-bold text-xl text-[#1a202c] dark:text-[#f0f6fc] mb-2">Could not load data</h2>
          <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mb-6">{chaptersError}</p>
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
      <header className="sticky top-0 z-20 bg-[#f4fcf7]/90 dark:bg-[#0d1117]/90 backdrop-blur-sm border-b border-[#d1e8d8] dark:border-[#30363d] px-4 md:px-6 py-3 transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">

          {/* Top row on mobile: Breadcrumb + Stats */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-1.5 text-xs text-[#64748b] dark:text-[#8b949e] font-medium shrink-0">
              <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              {view === "article" ? (
                <button onClick={handleChaptersClick} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Git
                </button>
              ) : (
                <span className="text-[#1a202c] dark:text-[#f0f6fc] font-bold">Git</span>
              )}
              {view === "article" && activeArticle && (
                <>
                  <span>/</span>
                  <span className="text-[#1a202c] dark:text-[#f0f6fc] font-bold truncate max-w-[120px] md:max-w-[200px]">
                    {activeArticle.title}
                  </span>
                </>
              )}
            </div>

            {/* Stats badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-full shadow-sm shrink-0">
              <FiBook className="text-emerald-600 dark:text-emerald-400" size={13} />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wide">
                {totalArticles} <span className="hidden sm:inline">Articles</span>
              </span>
            </div>
          </div>

          {/* Search bar */}
          {view === "chapters" && (
            <div className="w-full md:w-full md:max-w-md relative">
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
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {view === "chapters" ? (
          <ChaptersGrid
            chapters={chapters}
            currentPage={currentPage}
            searchQuery={searchQuery}
            onArticleClick={handleArticleClick}
            onPageChange={handlePageChange}
          />
        ) : articleError ? (
          <div className="flex items-center justify-center py-16 md:py-20">
            <div className="text-center bg-white dark:bg-[#21262d] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 md:p-8 shadow-sm w-full max-w-md">
              <FiAlertCircle size={28} className="text-rose-500 dark:text-rose-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-2">Failed to load article</p>
              <p className="text-xs text-[#4a5568] dark:text-[#8b949e] mb-4">{articleError}</p>
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