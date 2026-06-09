"use client";

/**
 * Theme Context
 * Manages dark/light theme preference
 */

import React, { createContext, useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);

  // Update theme
  useEffect(() => {
    if (!mounted) return;

    let currentTheme = theme;

    // If system preference, check actual system preference
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
      currentTheme = prefersDark.matches ? "dark" : "light";
    }

    // Update document and state
    const htmlElement = document.documentElement;
    if (currentTheme === "dark") {
      htmlElement.classList.add("dark");
      setIsDark(true);
    } else {
      htmlElement.classList.remove("dark");
      setIsDark(false);
    }

    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
