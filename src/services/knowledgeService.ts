/**
 * Knowledge API Service
 * Handles all knowledge/DSA routes:
 *   GET  /knowledge/topics
 *   GET  /knowledge/topics/:topicId
 *   GET  /knowledge/patterns/:topicId
 *   GET  /knowledge/problems/:patternId
 *   GET  /knowledge/progress          (auth required)
 *   GET  /knowledge/progress/summary  (auth required — rich metadata)
 *   POST /knowledge/progress/toggle   (auth required)
 */

import axios from "axios";

// NEXT_PUBLIC_API_URL may be set to something like "http://localhost:4000/api/auth".
// Knowledge routes live at /api/knowledge/*, so we strip any trailing /auth segment.
const RAW_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";
const API_BASE = RAW_URL.replace(/\/auth$/, "");

// ── Shared axios config (sends cookies for JWT) ─────────────────────────────
const withCreds = { withCredentials: true };

// ── Types ────────────────────────────────────────────────────────────────────

export interface KnowledgeTopic {
  id: string | number;
  name: string;
  problem_count: string | number;
}

export interface KnowledgeTopicData {
  id: string | number;
  name: string;
  description?: string;
  problem_count: string | number;
}

export interface KnowledgePattern {
  id: string | number;
  name: string;
  description?: string;
}

export interface KnowledgeProblem {
  id: string | number;
  title: string;
  difficulty: "easy" | "medium" | "hard" | string;
  problemLink: string;
}

export interface ProgressRow {
  problem_id: string | number;
  completed: boolean;
}

export interface DifficultyStats {
  solved: number;
  total: number;
}

export interface TopicProgress {
  topicId: string | number;
  topicName: string;
  solved: number;
  total: number;
  percent: number;
}

export interface RecentActivityItem {
  problemId: string | number;
  title: string;
  difficulty: string;
  topicName: string;
  solvedAt: string | null;
}

export interface ProgressSummary {
  totalSolved: number;
  totalProblems: number;
  completionPercent: number;
  streak: { current: number; longest: number };
  byDifficulty: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
  byTopic: TopicProgress[];
  recentActivity: RecentActivityItem[];
  lastSolvedAt: string | null;
  memberSince: string | null;
}

/** Shape returned by fetchProgressSummary — both the rich summary AND the solved Set */
export interface ProgressSummaryResult {
  summary: ProgressSummary;
  /** Pre-built Set of solved problem IDs — drop-in replacement for the old fetchProgress result */
  solvedSet: Set<string | number>;
}

// ── API calls ────────────────────────────────────────────────────────────────

/** GET /knowledge/topics — fetch all DSA topics */
export async function fetchTopics(): Promise<KnowledgeTopic[]> {
  const { data } = await axios.get(`${API_BASE}/knowledge/topics`, withCreds);
  if (!data.success) throw new Error(data.message || "Failed to fetch topics");
  return data.topics as KnowledgeTopic[];
}

/** GET /knowledge/topics/:topicId — fetch a single topic's metadata */
export async function fetchTopicData(topicId: string | number): Promise<KnowledgeTopicData> {
  const { data } = await axios.get(`${API_BASE}/knowledge/topics/${topicId}`, withCreds);
  if (!data.success) throw new Error(data.message || "Failed to fetch topic");
  return data.topic as KnowledgeTopicData;
}

/** GET /knowledge/patterns/:topicId — fetch patterns for a topic */
export async function fetchPatterns(topicId: string | number): Promise<KnowledgePattern[]> {
  const { data } = await axios.get(`${API_BASE}/knowledge/patterns/${topicId}`, withCreds);
  if (!data.success) throw new Error(data.message || "Failed to fetch patterns");
  return data.patterns as KnowledgePattern[];
}

/** GET /knowledge/problems/:patternId — fetch problems for a pattern */
export async function fetchProblems(patternId: string | number): Promise<KnowledgeProblem[]> {
  const { data } = await axios.get(`${API_BASE}/knowledge/problems/${patternId}`, withCreds);
  if (!data.success) throw new Error(data.message || "Failed to fetch problems");
  return data.problems as KnowledgeProblem[];
}

/** GET /knowledge/progress — fetch user's solved problems (JWT protected) */
export async function fetchProgress(): Promise<Set<string | number>> {
  const { data } = await axios.get(`${API_BASE}/knowledge/progress`, withCreds);
  if (!data.success) throw new Error(data.message || "Failed to fetch progress");
  const solved = new Set<string | number>(
    (data.progress as ProgressRow[])
      .filter((row) => row.completed)
      .map((row) => row.problem_id)
  );
  return solved;
}

/**
 * GET /knowledge/progress/summary — fetch rich progress metadata (JWT protected)
 *
 * Returns both the structured `summary` and a pre-built `solvedSet` for use
 * directly in the DSA sheet as checkbox state — replaces the need to call
 * fetchProgress() separately.
 */
export async function fetchProgressSummary(): Promise<ProgressSummaryResult> {
  const { data } = await axios.get(
    `${API_BASE}/knowledge/progress/summary`,
    withCreds
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch progress summary");

  const solvedSet = new Set<string | number>(
    (data.progress as ProgressRow[]).map((r) => r.problem_id)
  );

  return {
    summary: data.summary as ProgressSummary,
    solvedSet,
  };
}

/** POST /knowledge/progress/toggle — toggle solved status (JWT protected) */
export async function toggleProblem(problemId: string | number): Promise<void> {
  const { data } = await axios.post(
    `${API_BASE}/knowledge/progress/toggle`,
    { problemId },
    withCreds
  );
  if (!data.success) throw new Error(data.message || "Failed to toggle progress");
}

/** Convenience: total solved count across all DSA problems */
export async function fetchSolvedCount(): Promise<number> {
  const solved = await fetchProgress();
  return solved.size;
}
