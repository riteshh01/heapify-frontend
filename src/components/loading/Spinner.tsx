"use client";

/**
 * Skeleton loading components with CSS shimmer animation.
 *
 * Exports:
 *   default        → Spinner          (small inline shimmer)
 *   named          → PageLoader       (full-page chapter-grid — Git / System Design)
 *   named          → ArticleLoader    (article reader panel)
 *   named          → DSAFullLoader    (full DSA page: sidebar + dashboard)
 *   named          → DSALoader        (pattern-detail content only)
 */

import React from "react";

// ─── Shimmer keyframe — injected once per mount ───────────────────────────────
const SHIMMER_STYLE = `
  @keyframes bone-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .bone {
    background: linear-gradient(90deg, #d1fae5 0%, #ecfdf5 40%, #d1fae5 80%);
    background-size: 1200px 100%;
    animation: bone-shimmer 1.6s ease-in-out infinite;
    border-radius: 6px;
  }
  .dark .bone {
    background: linear-gradient(90deg, #1b4332 0%, #24553f 40%, #1b4332 80%);
    background-size: 1200px 100%;
    animation: bone-shimmer 1.6s ease-in-out infinite;
  }
`;

function ShimmerStyles() {
  return <style dangerouslySetInnerHTML={{ __html: SHIMMER_STYLE }} />;
}

function Bone({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`bone ${className}`} style={style} />;
}

// ─── Small inline Spinner ─────────────────────────────────────────────────────
const Spinner: React.FC = () => (
  <>
    <ShimmerStyles />
    <div className="flex items-center justify-center p-4">
      <Bone className="h-12 w-12 rounded-2xl" />
    </div>
  </>
);
export default Spinner;

// ─── PageLoader — chapter-grid skeleton (Git / System Design) ─────────────────
export function PageLoader() {
  return (
    <>
      <ShimmerStyles />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="flex items-start gap-6 mb-10">
          <Bone className="h-16 w-16 rounded-3xl shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <Bone className="h-9 w-72 rounded-xl" />
            <Bone className="h-4 w-96 rounded-lg" />
            <Bone className="h-4 w-52 rounded-lg" />
            <div className="flex gap-3 pt-1">
              <Bone className="h-6 w-24 rounded-lg" />
              <Bone className="h-6 w-20 rounded-lg" />
            </div>
          </div>
        </div>
        {/* Search */}
        <Bone className="h-10 w-full rounded-xl mb-6" />
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-3xl border border-[#d1e8d8] dark:border-[#30363d] bg-white dark:bg-[#21262d] space-y-4">
              <div className="flex items-start justify-between">
                <Bone className="h-12 w-12 rounded-2xl" />
                <Bone className="h-6 w-24 rounded-lg" />
              </div>
              <Bone className="h-5 w-4/5 rounded-lg" />
              <div className="flex gap-3">
                <Bone className="h-3.5 w-24 rounded" />
                <Bone className="h-3.5 w-16 rounded" />
              </div>
              <div className="space-y-2">
                <Bone className="h-3 w-full rounded" />
                <Bone className="h-3 w-11/12 rounded" />
                <Bone className="h-3 w-4/5 rounded" />
              </div>
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <Bone className="h-9 w-24 rounded-xl" />
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => <Bone key={i} className="h-9 w-9 rounded-xl" />)}
          </div>
          <Bone className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </>
  );
}

// ─── ArticleLoader — article reader skeleton ──────────────────────────────────
export function ArticleLoader() {
  return (
    <>
      <ShimmerStyles />
      <div className="space-y-5 py-2">
        <Bone className="h-8 w-32 rounded-xl" />
        <div className="p-6 rounded-3xl border border-[#d1e8d8] dark:border-[#30363d] bg-white dark:bg-[#21262d] space-y-3">
          <Bone className="h-3 w-44 rounded" />
          <Bone className="h-8 w-3/4 rounded-xl" />
          <Bone className="h-6 w-1/2 rounded-lg" />
          <div className="flex gap-3 pt-1">
            <Bone className="h-5 w-20 rounded-md" />
            <Bone className="h-5 w-16 rounded-md" />
          </div>
        </div>
        <div className="px-8 py-8 rounded-3xl border border-[#d1e8d8] dark:border-[#30363d] bg-white dark:bg-[#21262d] space-y-7">
          <div className="border-l-4 border-emerald-200 dark:border-emerald-800/60 pl-6 space-y-2">
            <Bone className="h-4 w-full rounded" />
            <Bone className="h-4 w-11/12 rounded" />
            <Bone className="h-4 w-4/5 rounded" />
          </div>
          <div className="space-y-3">
            <Bone className="h-6 w-52 rounded-lg" />
            <Bone className="h-3.5 w-full rounded" />
            <Bone className="h-3.5 w-full rounded" />
            <Bone className="h-3.5 w-3/4 rounded" />
          </div>
          <div className="rounded-xl overflow-hidden border border-[#d1e8d8] dark:border-[#30363d]">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0fdf4] dark:bg-[#161b22] border-b border-[#d1e8d8] dark:border-[#30363d]">
              <Bone className="h-4 w-16 rounded" />
              <Bone className="h-6 w-14 rounded-md" />
            </div>
            <div className="bg-[#f9fefb] dark:bg-[#0d1117] px-5 py-4 space-y-2">
              <Bone className="h-3 w-3/4 rounded" />
              <Bone className="h-3 w-1/2 rounded" />
              <Bone className="h-3 w-2/3 rounded" />
            </div>
          </div>
          <div className="space-y-3">
            <Bone className="h-6 w-48 rounded-lg" />
            <Bone className="h-3.5 w-full rounded" />
            <Bone className="h-3.5 w-5/6 rounded" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Bone className="h-14 w-1/2 rounded-2xl" />
          <Bone className="h-14 w-1/2 rounded-2xl" />
        </div>
      </div>
    </>
  );
}

// ─── DSAFullLoader ─────────────────────────────────────────────────────────────
// Mirrors the FULL DSA page layout:
//   [Sidebar: w-[18.5rem]]  |  [Main: flex-1, m-2, rounded-2xl]
//     - header (icon+title) |    - sticky header (hamburger + solved pill)
//     - Overview button      |    - dashboard content:
//     - "Topic Library" lbl  |        h1 + subtitle
//     - 7 topic rows         |        white card with arc chart skeleton
//     - bottom subject links |
export function DSAFullLoader() {
  return (
    <>
      <ShimmerStyles />
      <div
        className="flex h-[calc(100vh-56px)] bg-[#e8f5ee] dark:bg-[#0d1117]
                   text-[#2d3748] dark:text-[#e2e8f0] overflow-hidden"
      >
        {/* ── Sidebar skeleton (matches w-[18.5rem] outer, w-72 inner aside) ── */}
        <div className="hidden lg:block w-[18.5rem] shrink-0">
          <aside
            className="w-72 flex flex-col bg-white dark:bg-[#161b22]
                       my-2 ml-2 rounded-2xl border border-[#d1e8d8] dark:border-[#30363d]
                       shadow-sm overflow-hidden h-[calc(100%-16px)]"
          >
            {/* Sidebar header: icon + title */}
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#d1e8d8] dark:border-[#30363d]">
              <Bone className="h-7 w-7 rounded-md shrink-0" />
              <Bone className="h-4 w-28 rounded" />
            </div>

            {/* Nav body */}
            <div className="flex-1 py-4 overflow-hidden">
              {/* Overview button */}
              <div className="px-4 mb-2">
                <Bone className="h-10 w-full rounded-xl" />
              </div>

              {/* "Topic Library" label */}
              <Bone className="h-3 w-24 rounded mx-6 mb-3 mt-4" />

              {/* Topic rows */}
              <div className="space-y-1 px-4">
                {[52, 44, 60, 48, 56, 40, 52].map((w, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <Bone className="h-3.5 w-3.5 rounded shrink-0" />
                      <Bone className={`h-3.5 w-${w === 52 ? '36' : w === 44 ? '32' : w === 60 ? '40' : w === 48 ? '28' : w === 56 ? '36' : w === 40 ? '24' : '32'} rounded`} />
                    </div>
                    <Bone className="h-3 w-3 rounded shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom "Other Subjects" section */}
            <div className="border-t border-[#d1e8d8] dark:border-[#30363d] p-3 space-y-1">
              <Bone className="h-3 w-24 rounded mx-3 mb-3" />
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Bone className="h-3.5 w-3.5 rounded shrink-0" />
                  <Bone className={`h-3.5 rounded ${i === 0 ? 'w-8' : i === 1 ? 'w-28' : i === 2 ? 'w-12' : i === 3 ? 'w-8' : 'w-24'}`} />
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* ── Main content skeleton ── */}
        <main
          className="flex-1 overflow-hidden flex flex-col bg-[#f4fcf7] dark:bg-[#161b22]
                     m-0 sm:m-2 rounded-none sm:rounded-2xl border-0 sm:border border-[#d1e8d8] dark:border-[#30363d] shadow-sm"
        >
          {/* Sticky header: hamburger left + solved pill right */}
          <div
            className="flex items-center justify-between p-4
                       border-b border-[#d1e8d8] dark:border-[#30363d]
                       bg-[#f4fcf7] dark:bg-[#161b22] shrink-0"
          >
            {/* Hamburger button */}
            <Bone className="h-9 w-9 rounded-xl" />
            {/* "X Problems Solved" pill */}
            <Bone className="h-7 w-40 rounded-full" />
          </div>

          {/* Dashboard content */}
          <div className="flex-1 overflow-hidden px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 max-w-5xl mx-auto w-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center h-[50vh] text-center w-full max-w-md">
              <Bone className="w-16 h-16 rounded-2xl mb-6" />
              <Bone className="h-8 w-48 rounded-xl mb-3" />
              <div className="flex flex-col items-center gap-2 w-full">
                <Bone className="h-4 w-full rounded" />
                <Bone className="h-4 w-3/4 rounded" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// ─── DSALoader — pattern-detail skeleton ──────────────────────────────────────
// Rendered INSIDE the max-w-5xl content area when a pattern is loading.
// Mirrors: pattern header card + sticky sub-header + problem rows table.
export function DSALoader() {
  return (
    <>
      <ShimmerStyles />
      <div className="space-y-6">
        {/* Pattern header card */}
        <div className="p-6 rounded-3xl border border-[#d1e8d8] dark:border-[#30363d] bg-white dark:bg-[#21262d] space-y-4">
          {/* "Pattern Breakdown" label */}
          <Bone className="h-3 w-36 rounded" />
          {/* Pattern name + solved badge */}
          <div className="flex items-start justify-between gap-4">
            <Bone className="h-8 w-2/3 rounded-xl" />
            <Bone className="h-7 w-32 rounded-xl shrink-0" />
          </div>
          {/* Pattern description lines */}
          <div className="space-y-2 pt-1">
            <Bone className="h-4 w-full rounded" />
            <Bone className="h-4 w-5/6 rounded" />
            <Bone className="h-4 w-3/4 rounded" />
          </div>
        </div>

        {/* Problem rows table */}
        <div className="rounded-3xl border border-[#d1e8d8] dark:border-[#30363d] bg-white dark:bg-[#21262d] overflow-hidden">
          {/* Table header-ish strip */}
          <div className="px-6 py-3 border-b border-[#d1e8d8] dark:border-[#30363d] hidden lg:flex items-center gap-3">
            <Bone className="h-3 w-4 rounded shrink-0" />
            <Bone className="h-3 w-5 rounded shrink-0" />
            <Bone className="h-3 w-32 rounded" />
            <div className="flex-1" />
            <Bone className="h-3 w-16 rounded shrink-0" />
            <Bone className="h-3 w-20 rounded shrink-0" />
          </div>

          {/* Problem rows — 8 rows */}
          {[100, 85, 95, 75, 90, 80, 65, 88].map((titleW, i) => (
            <div
              key={i}
              className="px-4 py-3 sm:px-6 sm:py-4 flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-3 group
                         border-b border-[#e8f5ee] dark:border-[#30363d] last:border-b-0"
            >
              {/* Left Side: Index, Checkbox, Title & Difficulty */}
              <div className="flex items-center gap-3 w-full lg:w-auto flex-1 min-w-0">
                {/* Index */}
                <Bone className="h-3.5 w-4 rounded shrink-0" />
                {/* Checkbox circle */}
                <Bone className="h-5 w-5 rounded-full shrink-0" />
                {/* Problem title — varying widths for realism */}
                <Bone className="h-4 rounded-lg flex-1" style={{ maxWidth: `${titleW}%` }} />
                {/* Difficulty badge */}
                <Bone className="h-5 w-14 rounded-md shrink-0" />
              </div>
              {/* Right Side: Action buttons: Notes, Companies, Topics, external link */}
              <div className="flex items-center gap-1.5 shrink-0 pl-10 sm:pl-12 lg:pl-0 flex-wrap">
                <Bone className="h-6 w-14 rounded-lg" />
                <Bone className="h-6 w-20 rounded-lg" />
                <Bone className="h-6 w-16 rounded-lg" />
                <Bone className="h-6 w-6 rounded-lg ml-auto lg:ml-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}