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
  FiMenu,
  FiChevronDown,
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

// ─── Inline Markdown renderer ────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    if (match[2] !== undefined) {
      nodes.push(
        <strong key={match.index} className="font-bold text-[#111827] dark:text-[#f0f6fc]">
          {match[2]}
        </strong>
      );
    } else if (match[3] !== undefined) {
      nodes.push(
        <em key={match.index} className="italic text-[#374151] dark:text-[#c9d1d9]">
          {match[3]}
        </em>
      );
    } else if (match[4] !== undefined) {
      nodes.push(
        <code
          key={match.index}
          className="bg-[#f3f4f6] dark:bg-[#161b22] text-[#0f766e] dark:text-[#34d399] text-[0.875em] font-mono px-[0.45em] py-[0.15em] rounded-md border border-[#e5e7eb] dark:border-[#30363d]"
        >
          {match[4]}
        </code>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length > 0 ? nodes : [text];
}

// ─── Block Markdown renderer ──────────────────────────────────────────────────
function MarkdownBody({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let keyCounter = 0;
  const nextKey = () => `md-${keyCounter++}`;

  while (i < lines.length) {
    const raw = lines[i];

    // ── Fenced code block ─────────────────────────────────────────────────────
    if (/^```/.test(raw)) {
      const lang = raw.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const codeStr = codeLines.join("\n");
      blocks.push(
        <div key={nextKey()} className="rounded-xl overflow-hidden border border-[#30363d] shadow-sm my-5">
          <div className="flex items-center justify-between bg-[#161b22] border-b border-[#30363d] px-4 py-2.5">
            <span className="text-[10px] font-bold text-[#7d8590] uppercase tracking-widest">
              {lang || "code"}
            </span>
            <CopyButton text={codeStr} />
          </div>
          <pre className="bg-[#0d1117] px-5 py-4 overflow-x-auto text-[12.5px] font-mono text-[#e6edf3] leading-relaxed whitespace-pre [scrollbar-width:thin] [scrollbar-color:#21262d_transparent]">
            <code>{codeStr}</code>
          </pre>
        </div>
      );
      continue;
    }

    // ── ATX Headings ──────────────────────────────────────────────────────────
    const h4 = raw.match(/^####\s+(.+)/);
    if (h4) {
      blocks.push(
        <h4 key={nextKey()} className="text-[14px] font-bold text-[#1a202c] dark:text-[#e2e8f0] mt-6 mb-2 tracking-tight">
          {renderInline(h4[1])}
        </h4>
      );
      i++; continue;
    }
    const h3 = raw.match(/^###\s+(.+)/);
    if (h3) {
      blocks.push(
        <h3 key={nextKey()} className="text-[16px] font-bold text-[#111827] dark:text-[#f0f6fc] mt-7 mb-2.5 tracking-tight border-b border-[#e5e7eb] dark:border-[#30363d] pb-1.5">
          {renderInline(h3[1])}
        </h3>
      );
      i++; continue;
    }
    const h2 = raw.match(/^##\s+(.+)/);
    if (h2) {
      blocks.push(
        <h2 key={nextKey()} className="text-[18px] font-extrabold text-[#111827] dark:text-[#f0f6fc] mt-8 mb-3 tracking-tight">
          {renderInline(h2[1])}
        </h2>
      );
      i++; continue;
    }
    const h1 = raw.match(/^#\s+(.+)/);
    if (h1) {
      blocks.push(
        <h1 key={nextKey()} className="text-[22px] font-extrabold text-[#111827] dark:text-[#f0f6fc] mt-8 mb-4 tracking-tight">
          {renderInline(h1[1])}
        </h1>
      );
      i++; continue;
    }

    // ── Horizontal rule ───────────────────────────────────────────────────────
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(raw)) {
      blocks.push(<hr key={nextKey()} className="border-0 border-t border-[#e5e7eb] dark:border-[#30363d] my-6" />);
      i++; continue;
    }

    // ── Blockquote ────────────────────────────────────────────────────────────
    if (/^>\s/.test(raw)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={nextKey()}
          className="border-l-4 border-emerald-500 dark:border-emerald-400 pl-5 pr-3 py-3 my-5 bg-emerald-50/60 dark:bg-emerald-900/10 rounded-r-xl"
        >
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="text-[15px] text-[#374151] dark:text-[#b0bec5] leading-[1.9] italic tracking-[0.013em]" style={{ wordSpacing: "0.05em" }}>
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // ── Unordered list ────────────────────────────────────────────────────────
    if (/^[-*•]\s+/.test(raw)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={nextKey()} className="my-4 space-y-2 pl-1">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-3">
              <span className="mt-[7px] shrink-0 w-[6px] h-[6px] rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span className="text-[15.5px] text-[#374151] dark:text-[#b0bec5] leading-[1.9] tracking-[0.013em]" style={{ wordSpacing: "0.05em" }}>
                {renderInline(item)}
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Ordered list ──────────────────────────────────────────────────────────
    if (/^\d+\.\s+/.test(raw)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={nextKey()} className="my-4 space-y-2 pl-1">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 min-w-[22px] h-[22px] rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50">
                {ii + 1}
              </span>
              <span className="text-[15.5px] text-[#374151] dark:text-[#b0bec5] leading-[1.9] tracking-[0.013em]" style={{ wordSpacing: "0.05em" }}>
                {renderInline(item)}
              </span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Blank line — skip ────────────────────────────────────────────────────
    if (raw.trim() === "") { i++; continue; }

    // ── Paragraph group ──────────────────────────────────────────────────────
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,4}\s|```|>\s|[-*•]\s|\d+\.\s|-{3,}|\*{3,}|_{3,})/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(
        <p
          key={nextKey()}
          className="text-[15.5px] text-[#374151] dark:text-[#b0bec5] leading-[1.95] tracking-[0.013em] mb-1"
          style={{ wordSpacing: "0.06em" }}
        >
          {paraLines.map((pl, pi) => (
            <React.Fragment key={pi}>
              {pi > 0 && " "}
              {renderInline(pl)}
            </React.Fragment>
          ))}
        </p>
      );
    }
  }

  return <div className={className}>{blocks}</div>;
}

// ─── SD Section ───────────────────────────────────────────────────────────────
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
      <div className={`flex items-center gap-3 mb-4 pl-4 border-l-[3.5px] ${border}`}>
        <h2 className="text-[19px] font-bold text-[#111827] dark:text-[#f0f6fc] leading-snug tracking-tight">
          {label}
        </h2>
        <span className={`text-[10.5px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md ${badge}`}>
          {label}
        </span>
      </div>
      <MarkdownBody text={body} />
    </div>
  );
}

// ─── SD Topic Content ─────────────────────────────────────────────────────────
function SdTopicContent({ topic, images }: { topic: SdTopicJson; images?: ArticleImage[] }) {
  const introText = topic.what_it_is_and_how_it_works ?? "";

  const firstDot = introText.search(/[.!?](?:\s|$)/);
  const callout  = firstDot !== -1 ? introText.slice(0, firstDot + 1).trim() : introText;
  const rest     = firstDot !== -1 ? introText.slice(firstDot + 1).trim()    : "";

  return (
    <div>
      {introText && (
        <div className="mb-9">
          {callout && (
            <div className="border-l-[3px] border-blue-500 dark:border-blue-400 pl-4 mb-5">
              <p
                className="text-[15.5px] font-medium text-[#374151] dark:text-[#b0bec5] leading-[1.95] tracking-[0.013em]"
                style={{ wordSpacing: "0.06em" }}
              >
                {renderInline(callout)}
              </p>
            </div>
          )}
          {rest && <MarkdownBody text={rest} />}
        </div>
      )}

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

// ─── Dynamic JSON Renderer (New Format) ───────────────────────────────────────
function formatKey(key: string) {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function DynamicJsonRenderer({ data, images }: { data: any; images?: ArticleImage[] }) {
  if (!data) return null;

  const renderContent = (content: any, level: number = 2): React.ReactNode => {
    if (!content) return null;

    if (typeof content === "string") {
      return <MarkdownBody text={content} />;
    }

    if (Array.isArray(content)) {
      if (typeof content[0] === "string") {
        return (
          <ul className="my-4 space-y-2 pl-1">
            {content.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-[7px] shrink-0 w-[6px] h-[6px] rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <span
                  className="text-[15.5px] text-[#374151] dark:text-[#b0bec5] leading-[1.9] tracking-[0.013em]"
                  style={{ wordSpacing: "0.05em" }}
                >
                  {renderInline(item)}
                </span>
              </li>
            ))}
          </ul>
        );
      }
      return (
        <div className="space-y-6 my-4">
          {content.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#21262d] border border-[#e2e8f0] dark:border-[#30363d] rounded-xl p-5 shadow-sm"
            >
              {Object.entries(item).map(([k, v]) => (
                <div key={k} className="mb-3 last:mb-0">
                  <h4 className="text-[13px] font-bold text-[#111827] dark:text-[#f0f6fc] uppercase tracking-wider mb-1">
                    {formatKey(k)}
                  </h4>
                  <div className="text-[14.5px] text-[#374151] dark:text-[#b0bec5]">
                    {renderContent(v, level + 1)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (typeof content === "object") {
      return (
        <div className="space-y-5 my-4">
          {Object.entries(content).map(([k, v]) => (
            <div
              key={k}
              className="border-l-[3px] border-emerald-500 dark:border-emerald-400 pl-4 py-1"
            >
              <h4 className="text-[15px] font-bold text-[#111827] dark:text-[#f0f6fc] mb-2">
                {formatKey(k)}
              </h4>
              <div>{renderContent(v, level + 1)}</div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8">
      {images && images.length > 0 && images.map((img) => <InlineImage img={img} key={img.id} />)}

      {data.tagline && (
        <div className="border-l-[3px] border-blue-500 dark:border-blue-400 pl-4 mb-5">
          <p className="text-[16px] font-bold text-blue-700 dark:text-blue-400 italic tracking-[0.013em]">
            {data.tagline}
          </p>
        </div>
      )}

      {Object.entries(data).map(([key, value]) => {
        if (["id", "name", "tagline"].includes(key)) return null;

        return (
          <section key={key} className="space-y-3">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-1.5 h-5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 inline-block" />
              <h2 className="text-[18px] font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
                {formatKey(key)}
              </h2>
            </div>
            {renderContent(value)}
          </section>
        );
      })}
    </div>
  );
}

// ─── Article Content ──────────────────────────────────────────────────────────
function ArticleContent({ content, images }: { content: string; images?: ArticleImage[] }) {
  // 1. SD Markdown (### headers)
  const sdTopic = parseSdMarkdown(content);
  if (sdTopic) return <SdTopicContent topic={sdTopic} images={images} />;

  // 2. JSON Parser
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    /* not JSON */
  }

  if (parsed) {
    if (Array.isArray(parsed) && parsed.length > 0) {
      return <DynamicJsonRenderer data={parsed[0]} images={images} />;
    }

    if (typeof parsed === "object" && !Array.isArray(parsed)) {
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
  }

  // 3. Rich markdown fallback — handles auth articles with bullets, headers, etc.
  return <MarkdownBody text={content} />;
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

// ─── Chapter Card (fully clickable) ──────────────────────────────────────────
function ChapterCard({
  chapter,
  globalIdx,
  searchQuery,
  onChapterClick,
}: {
  chapter: TheoryChapter;
  globalIdx: number;
  searchQuery: string;
  onChapterClick: (chapter: TheoryChapter) => void;
}) {
  const chapterTotalTime = chapter.articles.reduce(
    (a, art) => a + art.readTimeMinutes,
    0
  );
  const previewArticles = chapter.articles.slice(0, 3);
  const hiddenCount = chapter.articles.length > 3 ? chapter.articles.length - 3 : 0;

  return (
    <button
      onClick={() => onChapterClick(chapter)}
      className="group w-full text-left bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] hover:border-emerald-500 dark:hover:border-emerald-500 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-5">
        <div className="p-3.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
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

      {/* Article previews (non-interactive hints) */}
      {previewArticles.length > 0 && (
        <div className="space-y-1.5 mb-5">
          {previewArticles.map((article, artIdx) => (
            <div
              key={article.id}
              className="flex items-center gap-2 text-[12px] text-[#4a5568] dark:text-[#8b949e] py-0.5"
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
            </div>
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
    </button>
  );
}

// ─── Chapters Grid ────────────────────────────────────────────────────────────
function ChaptersGrid({
  chapters,
  currentPage,
  searchQuery,
  onChapterClick,
  onPageChange,
}: {
  chapters: TheoryChapter[];
  currentPage: number;
  searchQuery: string;
  onChapterClick: (chapter: TheoryChapter) => void;
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
                  onChapterClick={onChapterClick}
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

// ─── Chapter Sidebar ─────────────────────────────────────────────────────────
function ChapterSidebar({
  chapter,
  isSidebarOpen,
  activeArticleId,
  onArticleClick,
  onToggleSidebar,
}: {
  chapter: TheoryChapter;
  isSidebarOpen: boolean;
  activeArticleId: number | null;
  onArticleClick: (article: TheoryArticleStub) => void;
  onToggleSidebar: () => void;
}) {
  const chapterTotalTime = chapter.articles.reduce(
    (a, art) => a + art.readTimeMinutes,
    0
  );

  return (
    <div
      className={`transition-all duration-300 flex overflow-hidden shrink-0 ${
        isSidebarOpen ? "w-[18.5rem]" : "w-0"
      }`}
    >
      <aside className="w-72 flex flex-col bg-white dark:bg-[#161b22] my-2 ml-2 rounded-2xl border border-[#d1e8d8] dark:border-[#30363d] shadow-sm overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#d1e8d8] dark:border-[#30363d]">
          <div className="text-emerald-600 dark:text-emerald-400 p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md shrink-0">
            <FiLayers size={13} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-[#a0aec0] dark:text-[#4b5563] uppercase tracking-[0.12em] mb-0.5">
              Chapter
            </p>
            <span className="text-[13px] font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight truncate block">
              {chapter.name}
            </span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#f4fcf7] dark:bg-[#0d1117] border-b border-[#d1e8d8] dark:border-[#30363d]">
          <span className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400">
            <FiBook size={10} />
            {chapter.articles.length} articles
          </span>
          {chapterTotalTime > 0 && (
            <span className="flex items-center gap-1 text-[10.5px] font-bold text-[#4a5568] dark:text-[#8b949e]">
              <FiClock size={10} />
              {chapterTotalTime}m total
            </span>
          )}
        </div>

        {/* Articles list */}
        <nav className="flex-1 overflow-y-auto py-3 [scrollbar-width:thin] [scrollbar-color:#a7c7b3_transparent] dark:[scrollbar-color:#334155_transparent]">
          <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#4b5563] uppercase tracking-[0.15em] px-5 py-2 mb-1">
            Articles
          </div>
          <div className="space-y-0.5 px-3">
            {chapter.articles.map((article, idx) => {
              const isActive = activeArticleId === article.id;
              return (
                <button
                  key={article.id}
                  onClick={() => onArticleClick(article)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-r-[3px] border-emerald-500 dark:border-emerald-500"
                      : "text-[#4a5568] dark:text-[#8b949e] hover:text-[#1a202c] dark:hover:text-[#f0f6fc] hover:bg-[#f4fcf7] dark:hover:bg-[#21262d]"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold shrink-0 w-5 text-right ${
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-[#a0aec0] dark:text-[#64748b]"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {article.isPremium && (
                    <FiLock
                      size={9}
                      className={`shrink-0 ${
                        isActive ? "text-amber-500" : "text-amber-400 dark:text-amber-600"
                      }`}
                    />
                  )}
                  <span
                    className={`text-[12.5px] leading-snug truncate ${
                      isActive ? "font-bold" : "font-semibold"
                    }`}
                  >
                    {article.title}
                  </span>
                  {article.readTimeMinutes > 0 && (
                    <span className="text-[10px] font-medium text-[#a0aec0] dark:text-[#64748b] shrink-0 ml-auto">
                      {article.readTimeMinutes}m
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>
    </div>
  );
}

// ─── Chapter Welcome Screen ───────────────────────────────────────────────────
function ChapterWelcome({
  chapter,
  onArticleClick,
}: {
  chapter: TheoryChapter;
  onArticleClick: (article: TheoryArticleStub) => void;
}) {
  const chapterTotalTime = chapter.articles.reduce(
    (a, art) => a + art.readTimeMinutes,
    0
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center">
      <div className="w-20 h-20 rounded-3xl bg-emerald-600 flex items-center justify-center shadow-lg mb-6">
        <FiLayers size={36} className="text-white" />
      </div>
      <h2 className="text-3xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight mb-3">
        {chapter.name}
      </h2>
      <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mb-6 max-w-md leading-relaxed">
        This chapter has{" "}
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {chapter.articles.length} article{chapter.articles.length !== 1 ? "s" : ""}
        </span>
        {chapterTotalTime > 0 && (
          <>
            {" "}with an estimated read time of{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {chapterTotalTime} minutes
            </span>
          </>
        )}
        . Select an article from the sidebar to begin reading.
      </p>

      {/* Quick-start: first 5 articles */}
      <div className="w-full max-w-md bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[#e8f5ee] dark:border-[#30363d] text-left">
          <p className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] uppercase tracking-widest">
            Start with
          </p>
        </div>
        {chapter.articles.slice(0, 5).map((article, idx) => (
          <button
            key={article.id}
            onClick={() => onArticleClick(article)}
            className="w-full flex items-center gap-3 px-5 py-3 text-left border-b border-[#e8f5ee] dark:border-[#30363d] last:border-b-0 hover:bg-[#f4fcf7] dark:hover:bg-[#30363d]/50 transition-colors group"
          >
            <span className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] w-5 shrink-0 text-right">
              {String(idx + 1).padStart(2, "0")}
            </span>
            {article.isPremium && <FiLock size={9} className="shrink-0 text-amber-500" />}
            <span className="text-[13px] font-semibold text-[#1a202c] dark:text-[#f0f6fc] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-1 truncate">
              {article.title}
            </span>
            <FiChevronRight size={12} className="text-[#a0aec0] dark:text-[#64748b] group-hover:text-emerald-500 transition-colors shrink-0" />
          </button>
        ))}
      </div>

      {chapter.articles.length > 5 && (
        <p className="text-[11px] text-[#a0aec0] dark:text-[#64748b] font-medium mt-3">
          +{chapter.articles.length - 5} more in the sidebar
        </p>
      )}
    </div>
  );
}

// ─── Article Body Panel ───────────────────────────────────────────────────────
function ArticleBodyPanel({
  article,
  isLoading,
  chapter,
  onArticleClick,
}: {
  article: TheoryArticle | null;
  isLoading: boolean;
  chapter: TheoryChapter;
  onArticleClick: (article: TheoryArticleStub) => void;
}) {
  if (isLoading) return <ArticleLoader />;
  if (!article) return null;

  const articles = chapter.articles;
  const currentIdx = articles.findIndex((a) => a.id === article.id);
  const prevItem = currentIdx > 0 ? articles[currentIdx - 1] : null;
  const nextItem = currentIdx < articles.length - 1 ? articles[currentIdx + 1] : null;

  return (
    <div>
      {/* Article header */}
      <div className="mb-6 p-6 bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl shadow-sm">
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

      {/* Prev / Next — within chapter */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {prevItem ? (
          <button
            onClick={() => onArticleClick(prevItem)}
            className="group text-left bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:shadow-sm"
          >
            <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] uppercase tracking-wider mb-1 flex items-center gap-1">
              <FiArrowLeft size={9} />
              Previous
            </div>
            <div className="text-sm font-bold text-[#2d3748] dark:text-[#e2e8f0] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
              {prevItem.title}
            </div>
          </button>
        ) : (
          <div />
        )}
        {nextItem ? (
          <button
            onClick={() => onArticleClick(nextItem)}
            className="group text-right bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-2xl p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:shadow-sm"
          >
            <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#64748b] uppercase tracking-wider mb-1 flex items-center gap-1 justify-end">
              Next
              <FiChevronRight size={9} />
            </div>
            <div className="text-sm font-bold text-[#2d3748] dark:text-[#e2e8f0] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
              {nextItem.title}
            </div>
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// ─── Chapter Reader Layout ────────────────────────────────────────────────────
function ChapterReaderLayout({
  chapter,
  activeArticle,
  activeArticleId,
  isArticleLoading,
  articleError,
  onArticleClick,
  onBack,
}: {
  chapter: TheoryChapter;
  activeArticle: TheoryArticle | null;
  activeArticleId: number | null;
  isArticleLoading: boolean;
  articleError: string | null;
  onArticleClick: (article: TheoryArticleStub) => void;
  onBack: () => void;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Close sidebar on mobile when an article is selected
  useEffect(() => {
    if (activeArticleId && typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [activeArticleId]);

  return (
    <div className="flex h-[calc(100vh-56px-52px)] overflow-hidden -mx-6 -mb-8 md:-mx-8 md:-mb-10">
      {/* Sidebar overlay on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isSidebarOpen
            ? "absolute inset-y-0 left-0 z-50 lg:relative lg:z-auto"
            : "hidden lg:block"}
          transition-all duration-300 h-full overflow-y-auto [scrollbar-width:thin]
        `}
      >
        <ChapterSidebar
          chapter={chapter}
          isSidebarOpen={isSidebarOpen}
          activeArticleId={activeArticleId}
          onArticleClick={onArticleClick}
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Main Content */}
      <main
        className={`
          flex-1 overflow-y-auto bg-[#f4fcf7] dark:bg-[#161b22] m-0 sm:m-2 rounded-none sm:rounded-2xl border-0 sm:border border-[#d1e8d8] dark:border-[#30363d] shadow-sm transition-colors duration-300 [scrollbar-width:thin] [scrollbar-color:#a7c7b3_transparent] dark:[scrollbar-color:#334155_transparent]
          ${isSidebarOpen ? "hidden lg:block" : "block"}
        `}
      >
        {/* Inner header */}
        <div className="sticky top-0 z-20 bg-[#f4fcf7] dark:bg-[#161b22] border-b border-[#d1e8d8] dark:border-[#30363d] px-4 py-3 flex items-center gap-3 transition-colors duration-300">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] rounded-xl shadow-sm hover:bg-[#e8f5ee] dark:hover:bg-[#30363d] active:scale-95 transition-all duration-200"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen
              ? <FiX size={15} className="text-emerald-600 dark:text-emerald-400" />
              : <FiMenu size={15} className="text-[#4a5568] dark:text-[#8b949e]" />
            }
          </button>

          {/* Mini breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748b] dark:text-[#8b949e] min-w-0">
            <button
              onClick={onBack}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bold shrink-0"
            >
              ← All Chapters
            </button>
            <span className="shrink-0">/</span>
            <span className="truncate font-bold text-[#1a202c] dark:text-[#f0f6fc]">
              {chapter.name}
            </span>
            {activeArticle && (
              <>
                <span className="shrink-0">/</span>
                <span className="truncate text-[#4a5568] dark:text-[#8b949e] max-w-[180px]">
                  {activeArticle.title}
                </span>
              </>
            )}
          </div>

          {/* Article count badge */}
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-full shadow-sm shrink-0">
            <FiBook className="text-emerald-600 dark:text-emerald-400" size={11} />
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 tracking-wide">
              {chapter.articles.length} Articles
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-6 md:px-8 md:py-8 max-w-4xl mx-auto">
          {articleError ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center bg-white dark:bg-[#21262d] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-8 shadow-sm max-w-md">
                <FiAlertCircle size={28} className="text-rose-500 dark:text-rose-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-2">
                  Failed to load article
                </p>
                <p className="text-xs text-[#4a5568] dark:text-[#8b949e]">
                  {articleError}
                </p>
              </div>
            </div>
          ) : activeArticleId ? (
            <ArticleBodyPanel
              article={activeArticle}
              isLoading={isArticleLoading}
              chapter={chapter}
              onArticleClick={onArticleClick}
            />
          ) : (
            <ChapterWelcome chapter={chapter} onArticleClick={onArticleClick} />
          )}
        </div>
      </main>
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

  // Three possible views: chapters grid, chapter reader (with sidebar), or legacy article
  const [view, setView] = useState<"chapters" | "chapter">("chapters");
  const [activeChapter, setActiveChapter] = useState<TheoryChapter | null>(null);
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

  const handleChapterClick = useCallback((chapter: TheoryChapter) => {
    setView("chapter");
    setActiveChapter(chapter);
    setActiveArticleId(null);
    setActiveArticle(null);
    setArticleError(null);
  }, []);

  const handleArticleClick = useCallback(
    async (article: TheoryArticleStub) => {
      if (activeArticleId === article.id) return;
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
    [activeArticleId]
  );

  const handleBackToChapters = useCallback(() => {
    setView("chapters");
    setActiveChapter(null);
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
            {view === "chapter" ? (
              <button
                onClick={handleBackToChapters}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                System Design
              </button>
            ) : (
              <span className="text-[#1a202c] dark:text-[#f0f6fc] font-bold">
                System Design
              </span>
            )}
            {view === "chapter" && activeChapter && (
              <>
                <span>/</span>
                <span className="text-[#1a202c] dark:text-[#f0f6fc] font-bold truncate max-w-[160px]">
                  {activeChapter.name}
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
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-full shadow-sm shrink-0 ml-auto">
            <FiBook className="text-emerald-600 dark:text-emerald-400" size={13} />
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wide">
              {totalArticles} Articles
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      {view === "chapters" ? (
        <main className="max-w-5xl mx-auto px-6 py-8 md:px-8 md:py-10">
          <ChaptersGrid
            chapters={chapters}
            currentPage={currentPage}
            searchQuery={searchQuery}
            onChapterClick={handleChapterClick}
            onPageChange={handlePageChange}
          />
        </main>
      ) : view === "chapter" && activeChapter ? (
        <div className="px-6 py-8 md:px-8 md:py-10">
          <ChapterReaderLayout
            chapter={activeChapter}
            activeArticle={activeArticle}
            activeArticleId={activeArticleId}
            isArticleLoading={isArticleLoading}
            articleError={articleError}
            onArticleClick={handleArticleClick}
            onBack={handleBackToChapters}
          />
        </div>
      ) : null}
    </div>
  );
}