/**
 * Landing Page (Public)
 */

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">Heapify</h1>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900">
            Master Your Software Engineering Interviews
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Comprehensive platform to prepare for FAANG interviews with DSA, System Design, DBMS, OS, and Networks
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="#features">
              <Button variant="secondary" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "📊", title: "DSA Mastery", desc: "500+ problems organized by topic" },
            { icon: "🏗️", title: "System Design", desc: "Learn to design scalable systems" },
            { icon: "🗄️", title: "Database Concepts", desc: "SQL, NoSQL, and DBMS fundamentals" },
            { icon: "⚙️", title: "Operating Systems", desc: "Processes, threads, memory management" },
            { icon: "🌐", title: "Computer Networks", desc: "OSI model, TCP/IP, and more" },
            { icon: "📈", title: "Progress Tracking", desc: "Track your learning journey" },
          ].map((feature, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-4 font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
