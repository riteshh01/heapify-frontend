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
}) => {
  return (
    <div
      className={`transition-all duration-300 flex overflow-hidden shrink-0 ${isSidebarOpen ? "w-[18.5rem]" : "w-0"
        }`}
    >
      <aside className="w-72 flex flex-col bg-[#fff] dark:bg-[#0f172a] my-2 ml-2 rounded-lg border border-[#cbd5e1] dark:border-[#1e3a5f] shadow-sm dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#e2e8f0] dark:border-[#1e3a5f]">
          <div className="text-[#3b5998] dark:text-[#7dd3fc]">{subjectIcon}</div>
          <span className="text-xs font-bold text-[#334155] dark:text-[#f8fafc] tracking-tight">{subjectTitle}</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Dashboard Button */}
          <button
            onClick={handleDashboardClick}
            className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-xs font-semibold transition-all ${view === "dashboard"
                ? "bg-blue-50 dark:bg-blue-900/30 text-[#3b5998] dark:text-[#7dd3fc] border-r-2 border-[#3b5998] dark:border-[#7dd3fc]"
                : "text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b]"
              }`}
          >
            <FiPieChart size={13} />
            <span>Overview</span>
          </button>

          {/* Section Label */}
          <div className="text-[9px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-[0.15em] px-5 py-2 mt-2">
            Topic Library
          </div>

          {/* Topics */}
          <div className="space-y-0.5 px-3">
            {dsaTopics.map((topic) => (
              <div key={topic.id}>
                <button
                  onClick={() => handleTopicClick(topic.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTopicId === topic.id
                      ? "bg-blue-50 dark:bg-blue-900/30 text-[#3b5998] dark:text-[#7dd3fc]"
                      : "text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b]"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FiLayers
                      size={12}
                      className={
                        activeTopicId === topic.id
                          ? "text-[#3b5998] dark:text-[#7dd3fc]"
                          : "text-[#64748b] dark:text-[#94a3b8]"
                      }
                    />
                    <span>{topic.name}</span>
                  </div>
                  {expandedTopics.has(topic.id) ? (
                    <FiChevronDown size={10} className="text-[#64748b] dark:text-[#94a3b8]" />
                  ) : (
                    <FiChevronRight size={10} className="text-[#64748b] dark:text-[#94a3b8]" />
                  )}
                </button>

                {expandedTopics.has(topic.id) && (
                  <div className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l border-[#e2e8f0] dark:border-[#1e3a5f] pl-2">
                    {(patternsCache.get(topic.id) ?? []).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePatternClick(p.id)}
                        className={`block w-full text-left px-3 py-1.5 text-[11px] rounded-md transition-all ${activePatternId === p.id
                            ? "text-[#3b5998] dark:text-[#7dd3fc] bg-blue-50 dark:bg-blue-900/30 font-semibold"
                            : "text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b]"
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
        <div className="border-t border-[#e2e8f0] dark:border-[#1e3a5f] p-2 space-y-0.5">
          <div className="text-[9px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-[0.15em] px-3 py-1.5">
            Other Subjects
          </div>
          {[
            { label: "OS", href: "/learning/os", icon: <FiCpu size={12} /> },
            { label: "Networks (CN)", href: "/learning/networks", icon: <FiWifi size={12} /> },
            { label: "DBMS", href: "/learning/dbms", icon: <FiDatabase size={12} /> },
            { label: "Dashboard", href: "/dashboard", icon: <FiBookOpen size={12} /> },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b] transition-all"
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