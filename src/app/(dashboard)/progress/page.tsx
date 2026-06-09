/**
 * Progress Tracking Page
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
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-600 mt-2">Track your learning journey across all paths</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Learning Paths Progress</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          {pathProgress.map((path) => (
            <div key={path.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{path.icon}</span>
                  <span className="font-medium text-gray-900">{path.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-600">{path.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
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
