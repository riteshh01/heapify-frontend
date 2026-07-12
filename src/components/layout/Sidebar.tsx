"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiLayers,
  FiPieChart,
  FiChevronRight,
  FiChevronDown,
  FiBook,
  FiCpu,
  FiWifi,
  FiDatabase,
  FiBookOpen,
  FiGitBranch,
  FiX,
} from "react-icons/fi";

// --- Interfaces ---
interface Topic {
  id: string | number;
  name: string;
}

interface Pattern {
  id: string | number;
  name: string;
}

interface SidebarProps {
  isSidebarOpen: boolean;
  view: "dashboard" | "pattern" | string;
  handleDashboardClick: () => void;
  handleTopicClick: (topicId: string | number) => void;
  handlePatternClick: (patternId: string | number) => void;
  activeTopicId: string | number | null;
  activePatternId: string | number | null;
  expandedTopics: Set<string | number>;
  dsaTopics: Topic[];
  patternsCache: Map<string | number, Pattern[]>;
  subjectTitle?: string;
  subjectIcon?: React.ReactNode;
  onClose?: () => void;
}

const DSASidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  view,
  handleDashboardClick,
  handleTopicClick,
  handlePatternClick,
  activeTopicId,
  activePatternId,
  expandedTopics,
  dsaTopics,
  patternsCache,
  subjectTitle = "DSA Sheet",
  subjectIcon = <FiBook size={14} />,
  onClose,
}) => {
  return (
    <div
      className={`transition-all duration-300 flex overflow-hidden shrink-0 ${isSidebarOpen ? "w-full lg:w-[18.5rem]" : "w-0"
        }`}
    >
      {/* Sidebar Container: Light mode has green tint border, Dark mode has neutral slate background/border */}
      <aside className="w-full lg:w-72 flex flex-col bg-white dark:bg-[#161b22] my-0 lg:my-2 lg:ml-2 rounded-none lg:rounded-2xl border-0 lg:border border-[#d1e8d8] dark:border-[#30363d] shadow-sm overflow-hidden transition-colors duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d1e8d8] dark:border-[#30363d]">
          <div className="flex items-center gap-2.5">
            <div className="text-emerald-600 dark:text-emerald-400 p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md">
              {subjectIcon}
            </div>
            <span className="text-sm font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">{subjectTitle}</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-[#a0aec0] dark:text-[#64748b] hover:text-[#1a202c] dark:hover:text-[#f0f6fc] hover:bg-[#f4fcf7] dark:hover:bg-[#21262d] rounded-lg transition-colors"
            >
              <FiX size={18} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Dashboard Button */}
          <button
            onClick={handleDashboardClick}
            className={`w-full flex items-center gap-3 px-6 py-3 text-[13px] font-bold transition-all ${view === "dashboard"
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-r-4 border-emerald-500 dark:border-emerald-500"
              : "text-[#4a5568] dark:text-[#8b949e] hover:text-[#1a202c] dark:hover:text-[#f0f6fc] hover:bg-[#f4fcf7] dark:hover:bg-[#21262d]"
              }`}
          >
            <FiPieChart size={14} />
            <span>Overview</span>
          </button>

          {/* Section Label */}
          <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#4b5563] uppercase tracking-[0.15em] px-6 py-3 mt-2">
            Topic Library
          </div>

          {/* Topics */}
          <div className="space-y-1 px-4">
            {dsaTopics.map((topic) => (
                <div key={topic.id}>
                  <button
                    onClick={() => handleTopicClick(topic.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTopicId === topic.id
                      ? "bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "text-[#4a5568] dark:text-[#8b949e] hover:text-[#1a202c] dark:hover:text-[#f0f6fc] hover:bg-[#f4fcf7] dark:hover:bg-[#21262d]"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <FiLayers
                        size={14}
                        className={
                          activeTopicId === topic.id
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-[#a0aec0] dark:text-[#64748b]"
                        }
                      />
                      <span>{topic.name}</span>
                    </div>
                    {expandedTopics.has(topic.id) ? (
                      <FiChevronDown size={12} className="text-[#a0aec0] dark:text-[#64748b]" />
                    ) : (
                      <FiChevronRight size={12} className="text-[#a0aec0] dark:text-[#64748b]" />
                    )}
                  </button>

                  {expandedTopics.has(topic.id) && (
                    <div className="ml-5 mt-1 mb-2 space-y-1 border-l-2 border-[#e8f5ee] dark:border-[#30363d] pl-2.5">
                      {(patternsCache.get(topic.id) ?? []).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handlePatternClick(p.id)}
                          className={`block w-full text-left px-3 py-2 text-[12px] rounded-lg transition-all ${activePatternId === p.id
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 font-bold"
                            : "text-[#4a5568] dark:text-[#8b949e] font-semibold hover:text-[#1a202c] dark:hover:text-[#f0f6fc] hover:bg-[#f4fcf7] dark:hover:bg-[#21262d]"
                            }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
            ))}
          </div>
        </nav>

        {/* Bottom links to other subjects */}
        {/* Light mode: distinct white/greenish | Dark mode: Clean matching dark (#161b22) */}
        <div className="border-t border-[#d1e8d8] dark:border-[#30363d] p-3 space-y-1 bg-[#fcfdfd] dark:bg-[#161b22]">
          <div className="text-[10px] font-bold text-[#a0aec0] dark:text-[#4b5563] uppercase tracking-[0.15em] px-3 py-2">
            Other Subjects
          </div>
          {[
            { label: "OS", href: "/learning/os", icon: <FiCpu size={14} /> },
            { label: "Networks (CN)", href: "/learning/networks", icon: <FiWifi size={14} /> },
            { label: "DBMS", href: "/learning/dbms", icon: <FiDatabase size={14} /> },
            { label: "Git", href: "/learning/git", icon: <FiGitBranch size={14} /> },
            { label: "Dashboard", href: "/dashboard", icon: <FiBookOpen size={14} /> },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold text-[#4a5568] dark:text-[#8b949e] hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-[#f4fcf7] dark:hover:bg-[#21262d] transition-all"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default DSASidebar;