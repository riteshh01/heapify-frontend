/**
 * Progress Tracking Page — 2010s design system
 */

import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default function ProgressPage() {
  const pathProgress = [
    { name: "DSA", progress: 45, icon: "📊" },
    { name: "System Design", progress: 20, icon: "🏗️" },
    { name: "DBMS", progress: 30, icon: "🗄️" },
    { name: "Operating Systems", progress: 15, icon: "⚙️" },
    { name: "Networks", progress: 25, icon: "🌐" },
    { name: "OOPS", progress: 10, icon: "🔧" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b] dark:text-[#f8fafc]">Your Progress</h1>
        <p className="text-[#64748b] dark:text-[#94a3b8] mt-2 text-sm">Track your learning journey across all paths</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-[#334155] dark:text-[#f1f5f9]">Learning Paths Progress</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          {pathProgress.map((path) => (
            <div key={path.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{path.icon}</span>
                  <span className="font-bold text-[#334155] dark:text-[#f1f5f9]">{path.name}</span>
                </div>
                <span className="text-sm font-black text-[#3b5998] dark:text-[#7dd3fc]">{path.progress}%</span>
              </div>
              <div className="w-full bg-[#e2e8f0] dark:bg-[#0f172a] rounded-full h-2 shadow-inner">
                <div
                  className="bg-gradient-to-r from-[#3b82f6] to-[#0ea5e9] dark:from-[#2563eb] dark:to-[#38bdf8] h-2 rounded-full transition-all duration-700"
                  style={{ width: `${path.progress}%` }}
                />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
