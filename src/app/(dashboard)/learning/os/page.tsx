"use client";

import React from "react";
import Link from "next/link";
import { 
  FiCpu, 
  FiLock, 
  FiActivity, 
  FiBox, 
  FiHardDrive, 
  FiLayers, 
  FiArrowRight, 
  FiClock 
} from "react-icons/fi";

const OS_TOPICS = [
  {
    id: "processes",
    title: "Processes & Threads",
    icon: <FiActivity size={20} />,
    description: "Process lifecycle, context switching, multi-threading models",
    problems: 12,
  },
  {
    id: "scheduling",
    title: "CPU Scheduling",
    icon: <FiClock size={20} />,
    description: "FCFS, SJF, Round Robin, Priority scheduling algorithms",
    problems: 10,
  },
  {
    id: "memory",
    title: "Memory Management",
    icon: <FiBox size={20} />,
    description: "Paging, segmentation, virtual memory, page replacement",
    problems: 15,
  },
  {
    id: "synchronization",
    title: "Synchronization",
    icon: <FiLock size={20} />,
    description: "Mutex, semaphores, deadlock detection & prevention",
    problems: 14,
  },
  {
    id: "storage",
    title: "Storage & File Systems",
    icon: <FiHardDrive size={20} />,
    description: "Disk scheduling, file allocation, directory structures",
    problems: 8,
  },
  {
    id: "ipc",
    title: "Inter-Process Communication",
    icon: <FiLayers size={20} />,
    description: "Pipes, message queues, shared memory, sockets",
    problems: 9,
  },
];

export default function OSPage() {
  return (
    <div className="min-h-screen bg-[#f4fcf7] dark:bg-[#0d1117] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Hero Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-4 uppercase tracking-wider">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Operating Systems</span>
          </div>

          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-3xl bg-emerald-600 flex items-center justify-center shadow-md">
              <FiCpu size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
                Operating Systems
              </h1>
              <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mt-3 leading-relaxed max-w-xl">
                Master processes, scheduling, memory management and synchronization — all the core OS concepts asked in SDE interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {OS_TOPICS.map((topic) => (
            <div
              key={topic.id}
              className="group bg-white dark:bg-[#21262d] border border-[#d1e8d8] dark:border-[#30363d] hover:border-emerald-500 dark:hover:border-emerald-500 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="p-3.5 bg-[#f0f3f6] dark:bg-[#0d1117] rounded-2xl text-emerald-600 dark:text-emerald-400">
                  {topic.icon}
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                  {topic.problems} concepts
                </span>
              </div>

              <h3 className="text-base font-bold text-[#1a202c] dark:text-[#f0f6fc] mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {topic.title}
              </h3>
              <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] leading-relaxed mb-5">
                {topic.description}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 transition-colors">
                Start studying
                <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Banner */}
        <div className="mt-10 border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl p-6 bg-white dark:bg-[#21262d] text-center shadow-sm">
          <p className="text-xs font-bold text-[#4a5568] dark:text-[#8b949e]">
            📚 Detailed notes, MCQ practice, and previous year questions coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}