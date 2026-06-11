"use client";

import Link from "next/link";
import { FiWifi, FiGlobe, FiShield, FiServer, FiLink, FiPackage, FiArrowRight } from "react-icons/fi";

const CN_TOPICS = [
  {
    id: "basics",
    title: "Network Fundamentals",
    icon: <FiGlobe size={18} />,
    description: "OSI model, TCP/IP stack, network topologies and types",
    problems: 14,
    color: "emerald",
  },
  {
    id: "transport",
    title: "Transport Layer",
    icon: <FiPackage size={18} />,
    description: "TCP vs UDP, flow control, congestion control, three-way handshake",
    problems: 16,
    color: "teal",
  },
  {
    id: "network",
    title: "Network Layer",
    icon: <FiLink size={18} />,
    description: "IP addressing, subnetting, routing algorithms (Dijkstra, Bellman-Ford)",
    problems: 18,
    color: "cyan",
  },
  {
    id: "application",
    title: "Application Layer",
    icon: <FiServer size={18} />,
    description: "HTTP/HTTPS, DNS, DHCP, FTP, SMTP protocols",
    problems: 12,
    color: "blue",
  },
  {
    id: "security",
    title: "Network Security",
    icon: <FiShield size={18} />,
    description: "Firewalls, SSL/TLS, encryption, authentication, VPNs",
    problems: 10,
    color: "violet",
  },
  {
    id: "wireless",
    title: "Wireless & Mobile",
    icon: <FiWifi size={18} />,
    description: "WiFi standards, Bluetooth, cellular networks, MAC protocols",
    problems: 8,
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

export default function NetworksPage() {
  return (
    <div className="min-h-full bg-[#030303] text-[#ededed]">
      {/* Background glow */}
      <div className="fixed top-1/4 right-1/4 w-[600px] h-[300px] bg-gradient-to-l from-teal-500/5 via-emerald-500/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
            <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-zinc-300">Computer Networks</span>
          </div>

          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(20,184,166,0.3)]">
              <FiWifi size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Computer Networks
              </h1>
              <p className="text-zinc-500 mt-1.5 text-sm leading-relaxed max-w-xl">
                Deep-dive into networking fundamentals — from OSI layers to TCP/IP, routing algorithms, and network security. Essential for every SDE interview.
              </p>
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {["78 Concepts", "GATE Ready", "System Design Prep"].map((tag) => (
              <span key={tag} className="text-[11px] font-medium text-zinc-500 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CN_TOPICS.map((topic) => {
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
            📡 Detailed notes, packet tracing exercises, and previous year questions coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
