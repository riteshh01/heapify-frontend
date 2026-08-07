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
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "light";
    }
    return "light";
  });
  const [isDark, setIsDark] = useState(false);

  // Update theme
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    const applyTheme = (t: Theme) => {
      let isDarkTheme = false;
      if (t === "system") {
        isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        isDarkTheme = t === "dark";
      }

      if (isDarkTheme) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }
      setIsDark(isDarkTheme);
    };

    // Apply immediately
    applyTheme(theme);

    // Listen for system changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", listener);

    localStorage.setItem("theme", theme);

    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

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
