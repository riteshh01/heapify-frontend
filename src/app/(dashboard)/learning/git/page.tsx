"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiMenu,
  FiX,
  FiGitBranch,
  FiChevronRight,
  FiChevronDown,
  FiBook,
  FiClock,
  FiLock,
  FiAlertCircle,
  FiCopy,
  FiCheck,
  FiArrowLeft,
  FiBookOpen,
  FiTrendingUp,
  FiPlay,
} from "react-icons/fi";
import Link from "next/link";
import {
  fetchChaptersBySubjectName,
  fetchArticle,
  type TheoryChapter,
  type TheoryArticleStub,
  type TheoryArticle,
} from "@/services/theoryService";
import Spinner from "@/components/loading/Spinner";

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

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({ children, lang }: { children: string; lang?: string }) {
  return (
    <div className="relative my-5 rounded-xl overflow-hidden border border-[#30363d] shadow-sm">
      <div className="flex items-center justify-between bg-[#161b22] border-b border-[#30363d] px-4 py-2.5">
        <span className="text-[10px] font-bold text-[#7d8590] uppercase tracking-widest">
          {lang || "bash"}
        </span>
        <CopyButton text={children} />
      </div>
      <pre className="bg-[#0d1117] px-5 py-4 overflow-x-auto text-[13px] font-mono text-[#e6edf3] leading-relaxed [scrollbar-width:thin] [scrollbar-color:#21262d_transparent]">
        <code>{children}</code>
      </pre>
    </div>
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
    <div className="rounded-xl overflow-hidden border border-[#30363d] shadow-sm mb-3">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#161b22] border-b border-[#30363d] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[10px] font-bold text-[#7d8590] uppercase tracking-widest">bash</span>
        </div>
        <CopyButton text={cmd} />
      </div>
      {/* Command line */}
      <pre className="bg-[#0d1117] px-5 py-3.5 overflow-x-auto text-[13px] font-mono text-[#e6edf3] leading-relaxed [scrollbar-width:thin] [scrollbar-color:#21262d_transparent]">
        <span className="text-[#7d8590] select-none mr-2">$</span>
        <code className="text-[#79c0ff]">{cmd}</code>
      </pre>
      {/* Description */}
      {description && (
        <div className="bg-[#0d1117] border-t border-[#21262d] px-5 pb-3 pt-1">
          <p className="text-[12px] text-[#8b949e] leading-5">{description}</p>
        </div>
      )}
    </div>
  );
}

// ─── Example Block (multiline code) ──────────────────────────────────────────
function ExampleBlock({ code }: { code: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d] shadow-sm my-4">
      <div className="flex items-center justify-between bg-[#161b22] border-b border-[#30363d] px-4 py-2.5">
        <span className="text-[10px] font-bold text-[#7d8590] uppercase tracking-widest">example</span>
        <CopyButton text={code} />
      </div>
      <pre className="bg-[#0d1117] px-5 py-4 overflow-x-auto text-[12.5px] font-mono text-[#e6edf3] leading-relaxed [scrollbar-width:thin] [scrollbar-color:#21262d_transparent] whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Structured Article Renderer ─────────────────────────────────────────────
function ArticleContent({ content }: { content: string }) {
  // Try to parse as JSON; fallback to raw text if it fails
  let parsed: ArticleJson | null = null;
  try {
    parsed = JSON.parse(content) as ArticleJson;
  } catch {
    // not JSON — render as plain text
  }

  if (!parsed) {
    return (
      <div className="text-sm text-[#4a5568] dark:text-[#a8b2c0] leading-7 whitespace-pre-wrap">
        {content}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Introduction */}
      {parsed.introduction && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 dark:border-emerald-400 rounded-r-2xl px-6 py-5">
          <p className="text-sm text-[#2d4a3a] dark:text-[#a8c8b8] leading-7 font-medium">
            {parsed.introduction}
          </p>
        </div>
      )}

      {/* Sections */}
      {parsed.sections?.map((section, idx) => (
        <section key={idx} className="space-y-3">
          {/* Section heading */}
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-1 h-5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 inline-block" />
            <h2 className="text-base font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
              {section.heading}
            </h2>
          </div>

          {/* Body text */}
          {section.body && (
            <p className="text-sm text-[#4a5568] dark:text-[#a8b2c0] leading-7 pl-3.5">
              {section.body}
            </p>
          )}

          {/* Commands */}
          {section.commands && section.commands.length > 0 && (
            <div className="pl-3.5 space-y-0">
              {section.commands.map((command, cIdx) => (
                <CommandRow key={cIdx} cmd={command.cmd} description={command.description} />
              ))}
            </div>
          )}

          {/* Example block */}
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

// ─── Git Sidebar ──────────────────────────────────────────────────────────────
interface GitSidebarProps {
  isOpen: boolean;
  chapters: TheoryChapter[];
  activeArticleId: number | null;
  expandedChapterIds: Set<number>;
  onArticleClick: (article: TheoryArticleStub) => void;
  onToggleChapter: (chapterId: number) => void;
  onOverviewClick: () => void;
  view: "overview" | "article";
  totalArticles: number;
}

function GitSidebar({
  isOpen,
  chapters,
  activeArticleId,
  expandedChapterIds,
  onArticleClick,
  onToggleChapter,
  onOverviewClick,
  view,
  totalArticles,
}: GitSidebarProps) {
  return (
    <div
      className={`transition-all duration-300 flex overflow-hidden shrink-0 ${isOpen ? "w-[18.5rem]" : "w-0"
        }`}
    >
      <aside className="w-72 flex flex-col bg-white dark:bg-[#161b22] my-2 ml-2 rounded-2xl border border-[#d1e8d8] dark:border-[#30363d] shadow-sm overflow-hidden transition-colors duration-300">

        {/* Header */}
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#d1e8d8] dark:border-[#30363d]">
          <div className="text-emerald-600 dark:text-emerald-400 p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md">
            <FiGitBranch size={14} />
          </div>
          <span className="text-sm font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
            Git & Version Control
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Overview button */}
          <button
            onClick={onOverviewClick}
            className={`w-full flex items-center gap-3 px-6 py-3 text-[13px] font-bold transition-all ${view === "overview"
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-r-4 border-emerald-500 dark:border-emerald-500"
                : "text-[#4a5568] dark:text-[#8b949e] hover:text-[#1a202c] dark:hover:text-[#f0f6fc] hover:bg-[#f4fcf7] dark:hover:bg-[#21262d]"
              }`}
          >
            <FiBookOpen size={14} />
            <span>Overview</span>
          </button>

          {/* Section label */}
          <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#4b5563] uppercase tracking-[0.15em] px-6 py-3 mt-2">
            Chapters · {chapters.length}
          </div>

          {/* Chapters + Articles */}
          <div className="space-y-1 px-4">
            {chapters.map((chapter) => (
              <div key={chapter.id}>
                <button
                  onClick={() => onToggleChapter(chapter.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${expandedChapterIds.has(chapter.id)
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                      : "text-[#4a5568] dark:text-[#8b949e] hover:text-[#1a202c] dark:hover:text-[#f0f6fc] hover:bg-[#f4fcf7] dark:hover:bg-[#21262d]"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FiBook
                      size={13}
                      className={expandedChapterIds.has(chapter.id) ? "text-emerald-600 dark:text-emerald-400 shrink-0" : "text-[#a0aec0] dark:text-[#64748b] shrink-0"}
                    />
                    <span className="truncate text-left">{chapter.name}</span>
                  </div>
                  {expandedChapterIds.has(chapter.id) ? (
                    <FiChevronDown size={11} className="shrink-0" />
                  ) : (
                    <FiChevronRight size={11} className="shrink-0" />
                  )}
                </button>

                {expandedChapterIds.has(chapter.id) && (
                  <div className="ml-5 mt-1 mb-2 space-y-0.5 border-l-2 border-[#e8f5ee] dark:border-[#30363d] pl-2.5">
                    {chapter.articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => onArticleClick(article)}
                        className={`block w-full text-left px-3 py-2 text-[12px] rounded-lg transition-all ${activeArticleId === article.id
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 font-bold"
                            : "text-[#4a5568] dark:text-[#8b949e] font-semibold hover:text-[#1a202c] dark:hover:text-[#f0f6fc] hover:bg-[#f4fcf7] dark:hover:bg-[#21262d]"
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          {article.isPremium && (
                            <FiLock size={9} className="shrink-0 text-amber-500" />
                          )}
                          <span className="truncate">{article.title}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom: other subjects */}
        <div className="border-t border-[#d1e8d8] dark:border-[#30363d] p-3 space-y-1 bg-[#fcfdfd] dark:bg-[#161b22]">
          <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#4b5563] uppercase tracking-[0.15em] px-3 py-2">
            Other Subjects
          </div>
          {[
            { label: "DSA Sheet", href: "/learning/dsa_sheet" },
            { label: "DBMS", href: "/learning/dbms" },
            { label: "OS", href: "/learning/os" },
            { label: "Networks (CN)", href: "/learning/networks" },
            { label: "Dashboard", href: "/dashboard" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-[#f4fcf7] dark:hover:bg-[#21262d] transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

// ─── Overview Panel ───────────────────────────────────────────────────────────
function OverviewPanel({
  chapters,
  subjectName,
  onArticleClick,
}: {
  chapters: TheoryChapter[];
  subjectName: string;
  onArticleClick: (article: TheoryArticleStub) => void;
}) {
  const totalArticles = chapters.reduce((acc, c) => acc + c.articles.length, 0);

  return (
    <div>
      {/* Hero header */}
      <div className="mb-8 border-b border-[#d1e8d8] dark:border-[#30363d] pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FiGitBranch size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
              {subjectName}
            </h1>
            <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e]">
              {chapters.length} chapters · {totalArticles} articles
            </p>
          </div>
        </div>
        <p className="text-sm text-[#4a5568] dark:text-[#8b949e] leading-relaxed max-w-xl mt-2">
          Master Git from the ground up — branching strategies, remote workflows, undoing mistakes,
          and advanced techniques used in real-world engineering teams.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] p-5 rounded-2xl shadow-sm border-t-4" style={{ borderTopColor: "#10b981" }}>
          <div className="text-[11px] text-[#4a5568] dark:text-[#8b949e] font-bold uppercase tracking-wider mb-2">Chapters</div>
          <div className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">{chapters.length}</div>
        </div>
        <div className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] p-5 rounded-2xl shadow-sm border-t-4" style={{ borderTopColor: "#059669" }}>
          <div className="text-[11px] text-[#4a5568] dark:text-[#8b949e] font-bold uppercase tracking-wider mb-2">Articles</div>
          <div className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">{totalArticles}</div>
        </div>
        <div className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] p-5 rounded-2xl shadow-sm border-t-4 col-span-2 sm:col-span-1" style={{ borderTopColor: "#0ea5e9" }}>
          <div className="text-[11px] text-[#4a5568] dark:text-[#8b949e] font-bold uppercase tracking-wider mb-2">Est. Read Time</div>
          <div className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc]">
            {chapters.reduce((acc, c) => acc + c.articles.reduce((a, art) => a + art.readTimeMinutes, 0), 0)}m
          </div>
        </div>
      </div>

      {/* Chapter cards */}
      <div className="space-y-6">
        {chapters.map((chapter, chIdx) => (
          <div
            key={chapter.id}
            className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl shadow-sm overflow-hidden"
          >
            {/* Chapter header */}
            <div className="px-6 py-4 bg-[#f4fcf7] dark:bg-[#1c2228] border-b border-[#e8f5ee] dark:border-[#30363d] flex items-center gap-3">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-lg">
                Chapter {chIdx + 1}
              </span>
              <h2 className="text-sm font-bold text-[#1a202c] dark:text-[#f0f6fc]">
                {chapter.name}
              </h2>
              <span className="ml-auto text-[11px] text-[#4a5568] dark:text-[#8b949e] font-medium">
                {chapter.articles.length} articles
              </span>
            </div>

            {/* Articles list */}
            {chapter.articles.length === 0 ? (
              <div className="px-6 py-4 text-sm text-[#a0aec0] dark:text-[#64748b] italic">
                No articles yet in this chapter.
              </div>
            ) : (
              <div className="divide-y divide-[#e8f5ee] dark:divide-[#30363d]">
                {chapter.articles.map((article, artIdx) => (
                  <button
                    key={article.id}
                    onClick={() => onArticleClick(article)}
                    className="w-full flex items-center justify-between px-6 py-3.5 text-left hover:bg-[#f4fcf7] dark:hover:bg-[#30363d]/50 group transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[11px] font-bold text-[#a0aec0] dark:text-[#8b949e] w-5 text-right shrink-0">
                        {String(artIdx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-semibold text-[#2d3748] dark:text-[#e2e8f0] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {article.title}
                      </span>
                      {article.isPremium && (
                        <FiLock size={11} className="text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="flex items-center gap-1 text-[11px] text-[#a0aec0] dark:text-[#64748b] font-medium">
                        <FiClock size={10} />
                        {article.readTimeMinutes}m
                      </span>
                      <FiChevronRight
                        size={13}
                        className="text-[#a0aec0] dark:text-[#64748b] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
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
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-sm font-semibold text-[#4a5568] dark:text-[#8b949e]">
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  if (!article) return null;

  // Find prev/next article for navigation
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
      {/* Article header card */}
      <div className="mb-6 p-6 bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-4 font-bold"
        >
          <FiArrowLeft size={11} />
          Back to overview
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
      <div className="bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl shadow-sm px-8 py-8 mb-6">
        <ArticleContent content={article.content} />
      </div>

      {/* Prev / Next navigation */}
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
            <div className="text-[10px] text-[#a0aec0] dark:text-[#64748b] mt-0.5">{prevItem.chapterName}</div>
          </button>
        ) : <div />}
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
            <div className="text-[10px] text-[#a0aec0] dark:text-[#64748b] mt-0.5">{nextItem.chapterName}</div>
          </button>
        ) : <div />}
      </div>
    </div>
  );
}

// ─── Main Git Page ────────────────────────────────────────────────────────────
export default function GitPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [subjectName, setSubjectName] = useState("Git & Version Control");
  const [chapters, setChapters] = useState<TheoryChapter[]>([]);
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<number>>(new Set());
  const [isChaptersLoading, setChaptersLoading] = useState(true);
  const [chaptersError, setChaptersError] = useState<string | null>(null);

  const [view, setView] = useState<"overview" | "article">("overview");
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);
  const [activeArticle, setActiveArticle] = useState<TheoryArticle | null>(null);
  const [isArticleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);

  // Article cache to avoid re-fetching on nav back
  const articleCacheRef = useRef<Map<number, TheoryArticle>>(new Map());

  // Strict Mode guard
  const hasFetchedRef = useRef(false);

  // ── Load chapters on mount — ONE API call via fetchChaptersBySubjectName ──
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const load = async () => {
      try {
        setChaptersLoading(true);
        setChaptersError(null);

        // Single call resolves subject+chapters in one DB round-trip
        const result = await fetchChaptersBySubjectName("git");
        setSubjectName(result.subjectName);
        setChapters(result.chapters);

        // Auto-expand first chapter
        if (result.chapters.length > 0) {
          setExpandedChapterIds(new Set([result.chapters[0].id]));
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load chapters";
        setChaptersError(msg);
      } finally {
        setChaptersLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleChapter = useCallback((chapterId: number) => {
    setExpandedChapterIds((prev) => {
      const next = new Set(prev);
      next.has(chapterId) ? next.delete(chapterId) : next.add(chapterId);
      return next;
    });
  }, []);

  const handleArticleClick = useCallback(
    async (article: TheoryArticleStub) => {
      // Already on this article
      if (activeArticleId === article.id && view === "article") return;

      setView("article");
      setActiveArticleId(article.id);
      setArticleError(null);

      // Serve from cache if available
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

  const handleOverviewClick = useCallback(() => {
    setView("overview");
    setActiveArticleId(null);
    setActiveArticle(null);
    setArticleError(null);
  }, []);

  const totalArticles = chapters.reduce((acc, c) => acc + c.articles.length, 0);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isChaptersLoading) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#e8f5ee] dark:bg-[#0d1117]">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white dark:bg-[#161b22] px-10 py-8 shadow-sm border border-[#d1e8d8] dark:border-[#30363d]">
          <Spinner />
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#1a202c] dark:text-[#f0f6fc]">
              Loading Git Content
            </h3>
            <p className="mt-1 text-sm font-medium text-[#4a5568] dark:text-[#8b949e]">
              Fetching chapters and articles...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (chaptersError) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#e8f5ee] dark:bg-[#0d1117]">
        <div className="max-w-md text-center bg-white dark:bg-[#161b22] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-8 shadow-sm">
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

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#e8f5ee] dark:bg-[#0d1117] text-[#2d3748] dark:text-[#e2e8f0] overflow-hidden font-sans transition-colors duration-300">

      {/* Sidebar */}
      <GitSidebar
        isOpen={isSidebarOpen}
        chapters={chapters}
        activeArticleId={activeArticleId}
        expandedChapterIds={expandedChapterIds}
        onArticleClick={handleArticleClick}
        onToggleChapter={handleToggleChapter}
        onOverviewClick={handleOverviewClick}
        view={view}
        totalArticles={totalArticles}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#f4fcf7] dark:bg-[#161b22] m-2 rounded-2xl border border-[#d1e8d8] dark:border-[#30363d] shadow-sm transition-colors duration-300 [scrollbar-width:thin] [scrollbar-color:#a7c7b3_transparent] dark:[scrollbar-color:#334155_transparent]">

        {/* Sticky Header */}
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

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748b] dark:text-[#8b949e] font-medium">
            <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <button onClick={handleOverviewClick} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Git
            </button>
            {view === "article" && activeArticle && (
              <>
                <span>/</span>
                <span className="text-[#1a202c] dark:text-[#f0f6fc] font-bold truncate max-w-[180px]">
                  {activeArticle.title}
                </span>
              </>
            )}
          </div>

          {/* Stats badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-full shadow-sm transition-colors duration-300">
            <FiTrendingUp className="text-emerald-600 dark:text-emerald-400" size={14} />
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wide">
              {totalArticles} Articles
            </span>
          </div>
        </header>

        {/* Content area */}
        <div className="max-w-5xl mx-auto px-6 py-8 md:px-8 md:py-10">
          {view === "overview" ? (
            <OverviewPanel
              chapters={chapters}
              subjectName={subjectName}
              onArticleClick={handleArticleClick}
            />
          ) : articleError ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center bg-white dark:bg-[#21262d] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-8 shadow-sm max-w-md">
                <FiAlertCircle size={28} className="text-rose-500 dark:text-rose-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-2">Failed to load article</p>
                <p className="text-xs text-[#4a5568] dark:text-[#8b949e] mb-4">{articleError}</p>
                <button
                  onClick={handleOverviewClick}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  ← Back to overview
                </button>
              </div>
            </div>
          ) : (
            <ArticlePanel
              article={activeArticle}
              isLoading={isArticleLoading}
              onBack={handleOverviewClick}
              allChapters={chapters}
              onArticleClick={handleArticleClick}
            />
          )}
        </div>
      </main>
    </div>
  );
}
