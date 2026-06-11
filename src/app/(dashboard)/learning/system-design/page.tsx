"use client";

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
    icon: <FiServer size={18} />,
    description: "CAP Theorem, PACELC, Consistent Hashing, and Data Replication",
    problems: 14,
    color: "emerald",
  },
  {
    id: "scaling",
    title: "Scaling & Load Balancing",
    icon: <FiSliders size={18} />,
    description: "Horizontal vs Vertical scaling, API Gateways, L4 vs L7 Load Balancers",
    problems: 10,
    color: "teal",
  },
  {
    id: "databases",
    title: "Databases & Caching",
    icon: <FiDatabase size={18} />,
    description: "SQL vs NoSQL, Sharding, Indexing, Redis, and CDN strategies",
    problems: 18,
    color: "cyan",
  },
  {
    id: "microservices",
    title: "Microservices & APIs",
    icon: <FiLayers size={18} />,
    description: "REST, GraphQL, gRPC, Service Discovery, and Circuit Breakers",
    problems: 12,
    color: "blue",
  },
  {
    id: "event-driven",
    title: "Message Queues & Streams",
    icon: <FiZap size={18} />,
    description: "Kafka, RabbitMQ, Pub/Sub models, and Asynchronous processing",
    problems: 9,
    color: "violet",
  },
  {
    id: "architectures",
    title: "Real-World Architectures",
    icon: <FiLayout size={18} />,
    description: "Design Netflix, Uber, Twitter, and real-time chat applications",
    problems: 15,
    color: "purple",
  },
];

const colorStyles: Record<string, { border: string; icon: string; badge: string; glow: string }> = {
  emerald: {
    border: "hover:border-emerald-500/30",
    icon: "text-emerald-400 bg-emerald-500/10",
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    glow: "hover:bg-emerald-500/[0.03]",
  },
  teal: {
    border: "hover:border-teal-500/30",
    icon: "text-teal-400 bg-teal-500/10",
    badge: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    glow: "hover:bg-teal-500/[0.03]",
  },
  cyan: {
    border: "hover:border-cyan-500/30",
    icon: "text-cyan-400 bg-cyan-500/10",
    badge: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    glow: "hover:bg-cyan-500/[0.03]",
  },
  blue: {
    border: "hover:border-blue-500/30",
    icon: "text-blue-400 bg-blue-500/10",
    badge: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    glow: "hover:bg-blue-500/[0.03]",
  },
  violet: {
    border: "hover:border-violet-500/30",
    icon: "text-violet-400 bg-violet-500/10",
    badge: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    glow: "hover:bg-violet-500/[0.03]",
  },
  purple: {
    border: "hover:border-purple-500/30",
    icon: "text-purple-400 bg-purple-500/10",
    badge: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    glow: "hover:bg-purple-500/[0.03]",
  },
};

export default function SystemDesignPage() {
  return (
    <div className="min-h-full bg-[#030303] text-[#ededed]">
      {/* Background glow */}
      <div className="fixed top-1/4 left-1/4 w-[600px] h-[300px] bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
            <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-zinc-300">System Design</span>
          </div>

          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-400 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <FiLayout size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                System Design
              </h1>
              <p className="text-zinc-500 mt-1.5 text-sm leading-relaxed max-w-xl">
                Master scalability, distributed systems, databases, and microservices — essential concepts for cracking High Level Design (HLD) interviews.
              </p>
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {["78 Concepts", "HLD Focus", "Architect Ready"].map((tag) => (
              <span key={tag} className="text-[11px] font-medium text-zinc-500 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SD_TOPICS.map((topic) => {
            const style = colorStyles[topic.color];
            return (
              <div
                key={topic.id}
                className={`group bg-zinc-950/60 border border-white/[0.06] ${style.border} ${style.glow} rounded-2xl p-5 cursor-pointer transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${style.icon}`}>
                    {topic.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${style.badge}`}>
                    {topic.problems} concepts
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{topic.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">{topic.description}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 group-hover:text-zinc-400 transition-colors font-medium">
                  Start studying
                  <FiArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming soon banner */}
        <div className="mt-8 border border-white/[0.06] rounded-2xl p-6 bg-zinc-950/40 text-center">
          <p className="text-xs text-zinc-600 font-medium">
            📚 Case studies, architecture diagrams, and mock interview questions coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}