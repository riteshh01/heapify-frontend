/**
 * Dashboard Route Group Layout
 * Wraps all authenticated dashboard pages
 * Shows Navbar + Sidebar + main content
 */

import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
