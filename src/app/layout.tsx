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
  icons: {
    icon: "/heapify_logo.jpg",
    apple: "/heapify_logo.jpg",
  },
};

export const icon = () => {
  return {
    url: "/heapify_logo.jpg",
    type: "image/jpg",
  };
};

export const apple = () => {
  return {
    url: "/heapify_logo.jpg",
    type: "image/jpg",
  };
};

// Inline script that runs before React hydrates to prevent flash of wrong theme.
// Reads the saved theme from localStorage and adds "dark" class to <html> if needed.
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = t === "dark" || (!t || t === "system") && prefersDark;
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  } catch(e){}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script: sets dark class before first paint — no theme flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
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

