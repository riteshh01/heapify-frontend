/**
 * Application-wide constants
 */

// App info
export const APP_NAME = "Heapify";
export const APP_DESCRIPTION = "Master your software engineering interview prep";

// UI Constants
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 1024,
  DESKTOP: 1280,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

// Learning Paths
export const LEARNING_PATHS = [
  { id: "dsa", label: "Data Structures & Algorithms", icon: "📊" },
  { id: "system-design", label: "System Design", icon: "🏗️" },
  { id: "dbms", label: "Database Management", icon: "🗄️" },
  { id: "os", label: "Operating Systems", icon: "⚙️" },
  { id: "networks", label: "Computer Networks", icon: "🌐" },
  { id: "oops", label: "OOPS & Design Patterns", icon: "🔧" },
] as const;

// Assessment types
export const ASSESSMENT_TYPES = {
  QUIZ: "quiz",
  MOCK_TEST: "mock_test",
  CHALLENGE: "challenge",
} as const;

// User roles
export const USER_ROLES = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
} as const;

// Validation patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  URL: /^https?:\/\/.+\..+/,
} as const;

// Time constants (in minutes)
export const TIME_CONSTANTS = {
  QUIZ_DURATION: 30,
  MOCK_TEST_DURATION: 180,
  SESSION_TIMEOUT: 60,
} as const;

// Cache TTL (in milliseconds)
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;
