"use client";

import React from "react";
import Link from "next/link";
import { 
  FiWifi, 
  FiGlobe, 
  FiShield, 
  FiServer, 
  FiLink, 
  FiPackage, 
  FiArrowRight 
} from "react-icons/fi";

const CN_TOPICS = [
  {
    id: "basics",
    title: "Network Fundamentals",
    icon: <FiGlobe size={20} />,
    description: "OSI model, TCP/IP stack, network topologies and types",
    problems: 14,
  },
  {
    id: "transport",
    title: "Transport Layer",
    icon: <FiPackage size={20} />,
    description: "TCP vs UDP, flow control, congestion control, three-way handshake",
    problems: 16,
  },
  {
    id: "network",
    title: "Network Layer",
    icon: <FiLink size={20} />,
    description: "IP addressing, subnetting, routing algorithms (Dijkstra, Bellman-Ford)",
    problems: 18,
  },
  {
    id: "application",
    title: "Application Layer",
    icon: <FiServer size={20} />,
    description: "HTTP/HTTPS, DNS, DHCP, FTP, SMTP protocols",
    problems: 12,
  },
  {
    id: "security",
    title: "Network Security",
    icon: <FiShield size={20} />,
    description: "Firewalls, SSL/TLS, encryption, authentication, VPNs",
    problems: 10,
  },
  {
    id: "wireless",
    title: "Wireless & Mobile",
    icon: <FiWifi size={20} />,
    description: "WiFi standards, Bluetooth, cellular networks, MAC protocols",
    problems: 8,
  },
];

export default function NetworksPage() {
  return (
    <div className="min-h-screen bg-[#f4fcf7] dark:bg-[#0d1117] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Hero Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-4 uppercase tracking-wider">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Networks</span>
          </div>

          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-3xl bg-emerald-600 flex items-center justify-center shadow-md">
              <FiWifi size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-[#1a202c] dark:text-[#f0f6fc] tracking-tight">
                Computer Networks
              </h1>
              <p className="text-sm font-medium text-[#4a5568] dark:text-[#8b949e] mt-3 leading-relaxed max-w-xl">
                Deep-dive into networking fundamentals — from OSI layers to TCP/IP, routing algorithms, and network security. Essential for every SDE interview.
              </p>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CN_TOPICS.map((topic) => (
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
            📡 Detailed notes, packet tracing exercises, and previous year questions coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}