"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
} from "react-icons/fi";
import Link from "next/link";
import {
  fetchSubjects,
  fetchChaptersBySubject,
  fetchArticle,
  type TheoryChapter,
  type TheoryArticleStub,
  type TheoryArticle,
} from "@/services/theoryService";
import Spinner  from "@/components/loading/Spinner";


// The Git subject name as stored in theory_subjects table
const GIT_SUBJECT_NAME = "Git & Version Control";

// ─── Copy Button ─────────────────────────────────────────────────────────────
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
      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all shrink-0 ${
        copied
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-600"
          : "bg-[#e2e8f0] dark:bg-[#1e293b] text-[#64748b] dark:text-[#94a3b8] border border-[#cbd5e1] dark:border-[#334155] hover:bg-[#cbd5e1] dark:hover:bg-[#253348]"
      }`}
      title="Copy"
    >
      {copied ? <FiCheck size={9} /> : <FiCopy size={9} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Code block with copy button ─────────────────────────────────────────────
function CodeBlock({ children }: { children: string }) {
  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-[#1e293b] dark:bg-[#0f172a] border border-[#334155] rounded-t-lg px-4 py-2">
        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
          bash
        </span>
        <CopyButton text={children} />
      </div>
      <pre className="bg-[#0f172a] border border-[#334155] border-t-0 rounded-b-lg px-4 py-4 overflow-x-auto text-[13px] font-mono text-[#e2e8f0] leading-relaxed [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
        <code>{children}</code>
      </pre>
    </div>
  );
}

// ─── Markdown Article Renderer ────────────────────────────────────────────────
function ArticleContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-[#1e293b] dark:text-[#f8fafc] mt-8 mb-4 leading-tight tracking-tight border-b border-[#e2e8f0] dark:border-[#1e3a5f] pb-3">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-[#1e293b] dark:text-[#f1f5f9] mt-8 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-[#3b5998] dark:bg-[#7dd3fc] shrink-0 inline-block" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold text-[#334155] dark:text-[#e2e8f0] mt-6 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-[#475569] dark:text-[#cbd5e1] leading-7 mb-4">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 pl-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 pl-4 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-[#475569] dark:text-[#cbd5e1] leading-6 flex gap-2">
              <span className="text-[#3b5998] dark:text-[#7dd3fc] mt-1 shrink-0">•</span>
              <span>{children}</span>
            </li>
          ),
          code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) => {
            const text = String(children ?? "").replace(/\n$/, "");
            if (inline) {
              return (
                <code className="bg-[#e2e8f0] dark:bg-[#1e293b] text-[#3b5998] dark:text-[#7dd3fc] px-1.5 py-0.5 rounded text-[12px] font-mono border border-[#cbd5e1] dark:border-[#334155]">
                  {text}
                </code>
              );
            }
            return <CodeBlock>{text}</CodeBlock>;
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#3b5998] dark:border-[#7dd3fc] bg-blue-50 dark:bg-[#0f172a] px-5 py-4 rounded-r-xl my-5 text-sm text-[#334155] dark:text-[#cbd5e1] italic leading-7">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[#1e293b] dark:text-[#f1f5f9]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#3b5998] dark:text-[#7dd3fc]">{children}</em>
          ),
          hr: () => (
            <hr className="border-[#e2e8f0] dark:border-[#1e3a5f] my-8" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3b5998] dark:text-[#7dd3fc] underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-5">
              <table className="w-full text-sm border-collapse border border-[#e2e8f0] dark:border-[#334155]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-[#f8fafc] dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] px-4 py-2 text-left text-xs font-bold text-[#334155] dark:text-[#f1f5f9] uppercase tracking-wide">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[#e2e8f0] dark:border-[#334155] px-4 py-2 text-xs text-[#475569] dark:text-[#cbd5e1]">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
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
}: GitSidebarProps) {
  return (
    <div
      className={`transition-all duration-300 flex overflow-hidden shrink-0 ${
        isOpen ? "w-[18.5rem]" : "w-0"
      }`}
    >
      <aside className="w-72 flex flex-col bg-white dark:bg-[#0f172a] my-2 ml-2 rounded-lg border border-[#cbd5e1] dark:border-[#1e3a5f] shadow-sm dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] overflow-hidden transition-colors duration-300">
        {/* Sidebar header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#e2e8f0] dark:border-[#1e3a5f]">
          <FiGitBranch size={14} className="text-[#3b5998] dark:text-[#7dd3fc]" />
          <span className="text-xs font-bold text-[#334155] dark:text-[#f8fafc] tracking-tight">
            Git & Version Control
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Overview button */}
          <button
            onClick={onOverviewClick}
            className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-xs font-semibold transition-all ${
              view === "overview"
                ? "bg-blue-50 dark:bg-blue-900/30 text-[#3b5998] dark:text-[#7dd3fc] border-r-2 border-[#3b5998] dark:border-[#7dd3fc]"
                : "text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b]"
            }`}
          >
            <FiBookOpen size={13} />
            Overview
          </button>

          {/* Section label */}
          <div className="text-[9px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-[0.15em] px-5 py-2 mt-2">
            Chapters
          </div>

          {/* Chapters + Articles */}
          <div className="space-y-0.5 px-3">
            {chapters.map((chapter) => (
              <div key={chapter.id}>
                <button
                  onClick={() => onToggleChapter(chapter.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FiBook size={12} className="shrink-0" />
                    <span className="truncate text-left">{chapter.name}</span>
                  </div>
                  {expandedChapterIds.has(chapter.id) ? (
                    <FiChevronDown size={10} className="shrink-0" />
                  ) : (
                    <FiChevronRight size={10} className="shrink-0" />
                  )}
                </button>

                {expandedChapterIds.has(chapter.id) && (
                  <div className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l border-[#e2e8f0] dark:border-[#1e3a5f] pl-2">
                    {chapter.articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => onArticleClick(article)}
                        className={`block w-full text-left px-3 py-1.5 text-[11px] rounded-md transition-all ${
                          activeArticleId === article.id
                            ? "text-[#3b5998] dark:text-[#7dd3fc] bg-blue-50 dark:bg-blue-900/30 font-semibold"
                            : "text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b]"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
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

        {/* Bottom nav */}
        <div className="border-t border-[#e2e8f0] dark:border-[#1e3a5f] p-2 space-y-0.5">
          <div className="text-[9px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-[0.15em] px-3 py-1.5">
            Other Subjects
          </div>
          {[
            { label: "DSA Sheet", href: "/learning/dsa_sheet" },
            { label: "DBMS", href: "/learning/dbms" },
            { label: "Dashboard", href: "/dashboard" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b] transition-all"
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
  onArticleClick,
}: {
  chapters: TheoryChapter[];
  onArticleClick: (article: TheoryArticleStub) => void;
}) {
  const totalArticles = chapters.reduce((acc, c) => acc + c.articles.length, 0);

  return (
    <div>
      <div className="mb-8 border-b border-[#e2e8f0] dark:border-[#1e3a5f] pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-[#e2e8f0] dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] flex items-center justify-center text-[#3b5998] dark:text-[#7dd3fc]">
            <FiGitBranch size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1e293b] dark:text-[#f8fafc] tracking-tight">
              Git & Version Control
            </h1>
            <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">
              {chapters.length} chapters · {totalArticles} articles
            </p>
          </div>
        </div>
        <p className="text-sm text-[#64748b] dark:text-[#94a3b8] leading-relaxed max-w-xl">
          Master Git from the ground up — branching strategies, remote workflows, undoing mistakes,
          and advanced techniques used in real-world engineering teams.
        </p>
      </div>

      {/* Chapter list */}
      <div className="space-y-6">
        {chapters.map((chapter, chIdx) => (
          <div key={chapter.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-[#3b5998] dark:text-[#7dd3fc] bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 rounded-md">
                Chapter {chIdx + 1}
              </span>
              <h2 className="text-sm font-bold text-[#334155] dark:text-[#f1f5f9]">
                {chapter.name}
              </h2>
            </div>
            <div className="bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-xl overflow-hidden shadow-sm">
              {chapter.articles.map((article, artIdx) => (
                <button
                  key={article.id}
                  onClick={() => onArticleClick(article)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-[#f8fafc] dark:hover:bg-[#0f172a] transition-colors group ${
                    artIdx < chapter.articles.length - 1
                      ? "border-b border-[#f1f5f9] dark:border-[#1e3a5f]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[11px] font-bold text-[#94a3b8] dark:text-[#64748b] w-5 shrink-0">
                      {String(artIdx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-[#334155] dark:text-[#e2e8f0] font-medium truncate group-hover:text-[#3b5998] dark:group-hover:text-[#7dd3fc] transition-colors">
                      {article.title}
                    </span>
                    {article.isPremium && (
                      <FiLock size={11} className="text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="flex items-center gap-1 text-[11px] text-[#94a3b8] dark:text-[#64748b]">
                      <FiClock size={10} />
                      {article.readTimeMinutes}m
                    </span>
                    <FiChevronRight
                      size={12}
                      className="text-[#cbd5e1] dark:text-[#475569] group-hover:text-[#3b5998] dark:group-hover:text-[#7dd3fc] transition-colors"
                    />
                  </div>
                </button>
              ))}
            </div>
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
}: {
  article: TheoryArticle | null;
  isLoading: boolean;
  onBack: () => void;
}) {
  if (isLoading) {
    return (
    <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-slate-100 dark:bg-[#0a0f1a]">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white dark:bg-[#111827] px-10 py-8 shadow-lg border border-slate-200 dark:border-slate-700">
        <Spinner />

        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Loading Git Articles
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Fetching Articles...
          </p>
        </div>
      </div>
    </div>
    );
  }

  if (!article) return null;

  return (
    <div>
      {/* Article header */}
      <div className="mb-8 p-6 bg-[#f8fafc] dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] text-[#64748b] dark:text-[#94a3b8] hover:text-[#3b5998] dark:hover:text-[#7dd3fc] transition-colors mb-4 font-medium"
        >
          <FiArrowLeft size={11} />
          Back to overview
        </button>
        <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] uppercase font-bold tracking-[0.15em] mb-1">
          {article.chapterName}
        </p>
        <h1 className="text-2xl font-bold text-[#1e293b] dark:text-[#f8fafc] mb-3 leading-tight">
          {article.title}
        </h1>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-[#64748b] dark:text-[#94a3b8]">
            <FiClock size={12} />
            {article.readTimeMinutes} min read
          </span>
          {article.isPremium && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-md">
              <FiLock size={10} />
              Premium
            </span>
          )}
        </div>
      </div>

      {/* Article body */}
      <div className="bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl shadow-sm px-8 py-8">
        <ArticleContent content={article.content} />
      </div>
    </div>
  );
}

// ─── Main Git Page ────────────────────────────────────────────────────────────
export default function GitPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [chapters, setChapters] = useState<TheoryChapter[]>([]);
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<number>>(new Set());
  const [isChaptersLoading, setChaptersLoading] = useState(true);
  const [chaptersError, setChaptersError] = useState<string | null>(null);

  const [view, setView] = useState<"overview" | "article">("overview");
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);
  const [activeArticle, setActiveArticle] = useState<TheoryArticle | null>(null);
  const [isArticleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);

  // Load chapters on mount
  useEffect(() => {
    const load = async () => {
      try {
        setChaptersLoading(true);
        setChaptersError(null);

        // Dynamically find the Git subject ID by name
        const subjects = await fetchSubjects();
        const gitSubject = subjects.find(
          (s) =>
            s.name.toLowerCase().includes("git")
        );
        if (!gitSubject) {
          throw new Error(
            `Could not find a subject matching "${GIT_SUBJECT_NAME}" in the database. ` +
            `Please check theory_subjects table.`
          );
        }

        const data = await fetchChaptersBySubject(gitSubject.id);
        setChapters(data);
        // Auto-expand first chapter
        if (data.length > 0) {
          setExpandedChapterIds(new Set([data[0].id]));
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
      if (activeArticleId === article.id && view === "article") return;

      setView("article");
      setActiveArticleId(article.id);
      setActiveArticle(null);
      setArticleError(null);
      setArticleLoading(true);

      try {
        const data = await fetchArticle(article.id);
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

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isChaptersLoading) {
    return (
    <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-slate-100 dark:bg-[#0a0f1a]">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white dark:bg-[#111827] px-10 py-8 shadow-lg border border-slate-200 dark:border-slate-700">
        <Spinner />

        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Loading Git Articles
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Fetching Git Articles...
          </p>
        </div>
      </div>
    </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (chaptersError) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#e2e8f0] dark:bg-[#0a0f1a]">
        <div className="max-w-md text-center bg-white dark:bg-[#1e293b] border border-red-300 dark:border-red-500/30 rounded-xl p-8 shadow-sm">
          <FiAlertCircle size={32} className="text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="font-bold text-[#334155] dark:text-[#f1f5f9] mb-2">
            Could not load data
          </h2>
          <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mb-6">{chaptersError}</p>
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
      <GitSidebar
        isOpen={isSidebarOpen}
        chapters={chapters}
        activeArticleId={activeArticleId}
        expandedChapterIds={expandedChapterIds}
        onArticleClick={handleArticleClick}
        onToggleChapter={handleToggleChapter}
        onOverviewClick={handleOverviewClick}
        view={view}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-white dark:bg-[#0f172a] m-2 rounded-lg border border-[#cbd5e1] dark:border-[#1e3a5f] shadow-sm dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] transition-colors duration-300 [scrollbar-width:thin] [scrollbar-color:#94a3b8_transparent] dark:[scrollbar-color:#334155_transparent]">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-[#f8fafc]/90 dark:bg-[#0f172a]/90 backdrop-blur-sm border-b border-[#e2e8f0] dark:border-[#1e3a5f] px-4 py-3 flex items-center justify-between transition-colors duration-300">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-lg shadow-sm hover:bg-[#f1f5f9] dark:hover:bg-[#253348] active:scale-95 transition-all duration-200"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <FiX size={16} className="text-[#3b5998] dark:text-[#7dd3fc]" />
            ) : (
              <FiMenu size={16} className="text-[#475569] dark:text-[#cbd5e1]" />
            )}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748b] dark:text-[#94a3b8]">
            <Link href="/dashboard" className="hover:text-[#3b5998] dark:hover:text-[#7dd3fc] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <button
              onClick={handleOverviewClick}
              className="hover:text-[#3b5998] dark:hover:text-[#7dd3fc] transition-colors"
            >
              Git
            </button>
            {view === "article" && activeArticle && (
              <>
                <span>/</span>
                <span className="text-[#334155] dark:text-[#e2e8f0] font-medium truncate max-w-[200px]">
                  {activeArticle.title}
                </span>
              </>
            )}
          </div>

          {/* Chapter count */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-[#1e293b] border border-blue-200 dark:border-[#334155] rounded-full shadow-inner transition-colors duration-300">
            <FiGitBranch className="text-[#3b5998] dark:text-[#7dd3fc]" size={13} />
            <span className="text-xs font-bold text-[#334155] dark:text-[#94a3b8]">
              {chapters.length} Chapters
            </span>
          </div>
        </header>

        {/* Content area */}
        <div className="max-w-4xl mx-auto px-6 py-8 md:px-10 md:py-10">
          {view === "overview" ? (
            <OverviewPanel chapters={chapters} onArticleClick={handleArticleClick} />
          ) : articleError ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center bg-white dark:bg-[#1e293b] border border-red-300 dark:border-red-500/30 rounded-xl p-8 shadow-sm max-w-md">
                <FiAlertCircle size={28} className="text-red-500 dark:text-red-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-[#334155] dark:text-[#f1f5f9] mb-2">
                  Failed to load article
                </p>
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-4">{articleError}</p>
                <button
                  onClick={handleOverviewClick}
                  className="text-xs text-[#3b5998] dark:text-[#7dd3fc] hover:underline"
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
            />
          )}
        </div>
      </main>
    </div>
  );
}
