import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ErrorProvider } from "@/context/ErrorContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { NotificationContainer } from "@/components/ui/NotificationContainer";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heapify - Master Your Software Engineering Interviews",
  description: "Prepare for software engineering interviews with DSA, System Design, DBMS, OS, and Networks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ErrorProvider>
            <NotificationProvider>
              <AuthProvider>
                {children}
                <NotificationContainer />
                <ErrorDisplay />
              </AuthProvider>
            </NotificationProvider>
          </ErrorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
