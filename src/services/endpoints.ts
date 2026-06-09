/**
 * Centralized API endpoint constants
 * Organized by feature for easy access and maintenance
 */

// ===== AUTH ENDPOINTS =====
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  LOGOUT: "/auth/logout",
  VERIFY_EMAIL: "/auth/verify-email",
  RESEND_EMAIL: "/auth/resend-verification",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  REFRESH_TOKEN: "/auth/refresh",
  ME: "/auth/me",
} as const;

// ===== LEARNING ENDPOINTS =====
export const LEARNING_ENDPOINTS = {
  // Paths
  PATHS: "/learning/paths",
  PATH_DETAILS: (pathId: string) => `/learning/paths/${pathId}`,

  // Topics
  TOPICS: (pathId: string) => `/learning/paths/${pathId}/topics`,
  TOPIC_DETAILS: (topicId: string) => `/learning/topics/${topicId}`,

  // Problems
  PROBLEMS: (topicId: string) => `/learning/topics/${topicId}/problems`,
  PROBLEM_DETAILS: (problemId: string) => `/learning/problems/${problemId}`,

  // Solutions
  SOLUTIONS: "/learning/solutions",
  SUBMIT_SOLUTION: "/learning/solutions/submit",
  GET_SOLUTION: (solutionId: string) => `/learning/solutions/${solutionId}`,
} as const;

// ===== ASSESSMENT ENDPOINTS =====
export const ASSESSMENT_ENDPOINTS = {
  ASSESSMENTS: "/assessments",
  ASSESSMENT_DETAILS: (assessmentId: string) => `/assessments/${assessmentId}`,
  START_ASSESSMENT: (assessmentId: string) =>
    `/assessments/${assessmentId}/start`,
  SUBMIT_ASSESSMENT: (assessmentId: string) =>
    `/assessments/${assessmentId}/submit`,
  GET_RESULTS: (attemptId: string) => `/assessments/results/${attemptId}`,
} as const;

// ===== PROGRESS ENDPOINTS =====
export const PROGRESS_ENDPOINTS = {
  USER_PROGRESS: "/progress",
  PROGRESS_BY_PATH: (pathId: string) => `/progress/paths/${pathId}`,
  PROGRESS_BY_TOPIC: (topicId: string) => `/progress/topics/${topicId}`,
  BADGES: "/progress/badges",
  USER_BADGES: "/progress/badges/earned",
} as const;

// ===== USER ENDPOINTS =====
export const USER_ENDPOINTS = {
  PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile/update",
  PREFERENCES: "/user/preferences",
  UPDATE_PREFERENCES: "/user/preferences/update",
  SETTINGS: "/user/settings",
  UPDATE_SETTINGS: "/user/settings/update",
} as const;

// ===== BOOKMARK ENDPOINTS =====
export const BOOKMARK_ENDPOINTS = {
  BOOKMARKS: "/bookmarks",
  CREATE_BOOKMARK: "/bookmarks",
  DELETE_BOOKMARK: (bookmarkId: string) => `/bookmarks/${bookmarkId}`,
  GET_BOOKMARKS: (problemId: string) => `/bookmarks?problemId=${problemId}`,
} as const;

// ===== ADMIN ENDPOINTS =====
export const ADMIN_ENDPOINTS = {
  PATHS: "/admin/paths",
  CREATE_PATH: "/admin/paths",
  UPDATE_PATH: (pathId: string) => `/admin/paths/${pathId}`,
  DELETE_PATH: (pathId: string) => `/admin/paths/${pathId}`,

  TOPICS: "/admin/topics",
  CREATE_TOPIC: "/admin/topics",
  UPDATE_TOPIC: (topicId: string) => `/admin/topics/${topicId}`,
  DELETE_TOPIC: (topicId: string) => `/admin/topics/${topicId}`,

  PROBLEMS: "/admin/problems",
  CREATE_PROBLEM: "/admin/problems",
  UPDATE_PROBLEM: (problemId: string) => `/admin/problems/${problemId}`,
  DELETE_PROBLEM: (problemId: string) => `/admin/problems/${problemId}`,

  ANALYTICS: "/admin/analytics",
  USER_STATS: "/admin/analytics/users",
} as const;
