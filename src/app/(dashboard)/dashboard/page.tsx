/**
 * Dashboard Home Page
 * Shows user overview, recent activity, stats
 */

import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Keep learning.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Problems Solved", value: "24", icon: "✓" },
          { label: "Current Streak", value: "7 days", icon: "🔥" },
          { label: "Topics Completed", value: "5/12", icon: "📊" },
          { label: "Badges Earned", value: "3", icon: "🏆" },
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardBody>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Recent Activity</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {[
              { title: "Solved: Two Sum", time: "2 hours ago", icon: "✓" },
              { title: "Completed: Arrays Topic", time: "1 day ago", icon: "📚" },
              { title: "Quiz: DSA Basics", time: "3 days ago", icon: "📝" },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 border-b pb-4">
                <div className="text-2xl">{activity.icon}</div>
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
