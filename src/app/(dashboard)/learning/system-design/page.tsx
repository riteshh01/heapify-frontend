"use client";

import React from "react";
import Link from "next/link";
import { 
  FiServer, 
  FiSliders, 
  FiDatabase, 
  FiLayers, 
  FiZap, 
  FiLayout, 
  FiArrowRight 
} from "react-icons/fi";

const SD_TOPICS = [
  {
    id: "distributed-systems",
    title: "Distributed Systems Basics",
    icon: <FiServer size={20} />,
    description: "CAP Theorem, PACELC, Consistent Hashing, and Data Replication",
    problems: 14,
  },
  {
    id: "scaling",
    title: "Scaling & Load Balancing",
    icon: <FiSliders size={20} />,
    description: "Horizontal vs Vertical scaling, API Gateways, L4 vs L7 Load Balancers",
    problems: 10,
  },
  {
    id: "databases",
    title: "Databases & Caching",
    icon: <FiDatabase size={20} />,
    description: "SQL vs NoSQL, Sharding, Indexing, Redis, and CDN strategies",
    problems: 18,
  },
  {
    id: "microservices",
    title: "Microservices & APIs",
    icon: <FiLayers size={20} />,
    description: "REST, GraphQL, gRPC, Service Discovery, and Circuit Breakers",
    problems: 12,
  },
  {
    id: "event-driven",
    title: "Message Queues & Streams",
    icon: <FiZap size={20} />,
    description: "Kafka, RabbitMQ, Pub/Sub models, and Asynchronous processing",
    problems: 9,
  },
  {
    id: "architectures",
    title: "Real-World Architectures",
    icon: <FiLayout size={20} />,
    description: "Design Netflix, Uber, Twitter, and real-time chat applications",
    problems: 15,
  },
];

export default function SystemDesignPage() {
  return (
    <div className="min-h-screen bg-[#f4fcf7] dark:bg-[#0d1117] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Hero Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-4 uppercase tracking-wider">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>System Design</span>
          </div>

          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-3xl bg-emerald-600 flex items-center justify-center shadow-md">
              <FiLayout size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
                System Design
              </h1>
              <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mt-3 leading-relaxed max-w-xl">
                Master scalability, distributed systems, databases, and microservices — essential concepts for cracking High Level Design (HLD) interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SD_TOPICS.map((topic) => (
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
            📚 Case studies, architecture diagrams, and mock interview questions coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}