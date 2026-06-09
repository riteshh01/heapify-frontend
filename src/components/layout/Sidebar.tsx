/**
 * Sidebar component
 * Navigation sidebar for authenticated users
 */

import Link from "next/link";

export function Sidebar() {
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/learning/dsa", label: "DSA", icon: "📈" },
    { href: "/learning/system-design", label: "System Design", icon: "🏗️" },
    { href: "/learning/dbms", label: "DBMS", icon: "🗄️" },
    { href: "/learning/os", label: "OS", icon: "⚙️" },
    { href: "/learning/networks", label: "Networks", icon: "🌐" },
    { href: "/assessments", label: "Assessments", icon: "📝" },
    { href: "/progress", label: "Progress", icon: "📉" },
    { href: "/bookmarks", label: "Bookmarks", icon: "🔖" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 border-r bg-gray-50 p-6">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-200"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
