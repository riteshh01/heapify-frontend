"use client";

import React from "react";
import Link from "next/link";
import { 
  FiDatabase, 
  FiGrid, 
  FiKey, 
  FiZap, 
  FiLayers, 
  FiRepeat, 
  FiArrowRight 
} from "react-icons/fi";

const DBMS_TOPICS = [
  {
    id: "fundamentals",
    title: "Database Fundamentals",
    icon: <FiDatabase size={20} />,
    description: "DBMS architecture, data models, ER diagrams, schema design",
    problems: 12,
  },
  {
    id: "sql",
    title: "SQL & Queries",
    icon: <FiGrid size={20} />,
    description: "DDL, DML, DCL, joins, subqueries, aggregations and window functions",
    problems: 25,
  },
  {
    id: "normalization",
    title: "Normalization",
    icon: <FiLayers size={20} />,
    description: "1NF to BCNF, functional dependencies, lossless decomposition",
    problems: 14,
  },
  {
    id: "transactions",
    title: "Transactions & ACID",
    icon: <FiZap size={20} />,
    description: "ACID properties, concurrency control, locking, serializability",
    problems: 16,
  },
  {
    id: "indexing",
    title: "Indexing & Storage",
    icon: <FiKey size={20} />,
    description: "B-trees, B+ trees, hashing, clustered vs non-clustered indexes",
    problems: 10,
  },
  {
    id: "nosql",
    title: "NoSQL Databases",
    icon: <FiRepeat size={20} />,
    description: "CAP theorem, MongoDB, Redis, Cassandra, BASE vs ACID",
    problems: 8,
  },
];

export default function DBMSPage() {
  return (
    <div className="min-h-screen bg-[#f4fcf7] dark:bg-[#0d1117] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-4 uppercase tracking-wider">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>DBMS</span>
          </div>

          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-3xl bg-emerald-600 flex items-center justify-center shadow-lg">
              <FiDatabase size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
                Database Management Systems
              </h1>
              <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mt-3 leading-relaxed max-w-xl">
                From SQL joins to normalization, transactions, and NoSQL — master everything about databases for your SDE interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DBMS_TOPICS.map((topic) => (
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

        {/* Info Banner */}
        <div className="mt-10 border border-[#d1e8d8] dark:border-[#30363d] rounded-3xl p-6 bg-white dark:bg-[#21262d] text-center shadow-sm">
          <p className="text-xs font-bold text-[#4a5568] dark:text-[#8b949e]">
            🗄️ SQL sandbox, query execution plans, and GATE PYQs coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}