/**
 * Knowledge API Service
 * Handles all knowledge/DSA routes:
 *   GET  /knowledge/topics
 *   GET  /knowledge/topics/:topicId
 *   GET  /knowledge/patterns/:topicId
 *   GET  /knowledge/problems/:patternId
 *   GET  /knowledge/problems/:problemId/tags
 *   GET  /knowledge/progress          (auth required)
 *   GET  /knowledge/progress/summary  (auth required — rich metadata)
 *   POST /knowledge/progress/toggle   (auth required)
 *
 * Uses the centralized fetch-based apiCall helpers from ./api so that
 * cookie handling, CSRF injection, and the 401→refresh retry flow are
 * applied automatically to every request.
 */

import { get, post, patch } from "./api";

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
  youtubeLink?: string | null;
  articleLink?: string | null;
  notes?: string | null;
}

export interface ProblemTag {
  id: string | number;
  name: string;
  tag_type: "company" | "topic" | string;
}

export interface ProgressRow {
  problem_id: string | number;
  completed: boolean;
}

export interface DifficultyStats {
  solved: number;
  total: number;
}

// These are only populated by the full progress page, not the DSA sheet summary
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
  byDifficulty: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
  // Optional fields — present when the richer progress endpoint is used
  completionPercent?: number;
  streak?: { current: number; longest: number };
  byTopic?: TopicProgress[];
  recentActivity?: RecentActivityItem[];
  lastSolvedAt?: string | null;
  memberSince?: string | null;
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
  const data = await get<{ success: boolean; topics: KnowledgeTopic[]; message?: string }>(
    "/knowledge/topics"
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch topics");
  return data.topics;
}

/** GET /knowledge/topics/:topicId — fetch a single topic's metadata */
export async function fetchTopicData(topicId: string | number): Promise<KnowledgeTopicData> {
  const data = await get<{ success: boolean; topic: KnowledgeTopicData; message?: string }>(
    `/knowledge/topics/${topicId}`
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch topic");
  return data.topic;
}

/** GET /knowledge/patterns/:topicId — fetch patterns for a topic */
export async function fetchPatterns(topicId: string | number): Promise<KnowledgePattern[]> {
  const data = await get<{ success: boolean; patterns: KnowledgePattern[]; message?: string }>(
    `/knowledge/patterns/${topicId}`
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch patterns");
  return data.patterns;
}

/** GET /knowledge/problems/:patternId — fetch problems for a pattern */
export async function fetchProblems(patternId: string | number): Promise<KnowledgeProblem[]> {
  const data = await get<{ success: boolean; problems: KnowledgeProblem[]; message?: string }>(
    `/knowledge/problems/${patternId}`
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch problems");
  return data.problems;
}

/** GET /knowledge/problems/:problemId/tags — fetch company & topic tags for a problem */
export async function fetchProblemTags(problemId: string | number): Promise<ProblemTag[]> {
  const data = await get<{ success: boolean; tags: ProblemTag[]; message?: string }>(
    `/knowledge/problems/${problemId}/tags`
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch tags");
  return data.tags;
}

/** GET /knowledge/progress — fetch user's solved problems (JWT protected) */
export async function fetchProgress(): Promise<Set<string | number>> {
  const data = await get<{ success: boolean; progress: ProgressRow[]; message?: string }>(
    "/knowledge/progress"
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch progress");
  const solved = new Set<string | number>(
    data.progress
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
  const data = await get<{
    success: boolean;
    summary: ProgressSummary;
    progress: ProgressRow[];
    message?: string;
  }>("/knowledge/progress/summary");
  if (!data.success) throw new Error(data.message || "Failed to fetch progress summary");

  const solvedSet = new Set<string | number>(data.progress.map((r) => r.problem_id));

  return {
    summary: data.summary,
    solvedSet,
  };
}

/** POST /knowledge/progress/toggle — toggle solved status (JWT protected) */
export async function toggleProblem(problemId: string | number): Promise<void> {
  const data = await post<{ success: boolean; message?: string }>(
    "/knowledge/progress/toggle",
    { problemId }
  );
  if (!data.success) throw new Error(data.message || "Failed to toggle progress");
}

/** GET /knowledge/problems/:problemId/note — fetch user's personal note (JWT protected) */
export async function fetchUserNote(problemId: string | number): Promise<string> {
  const data = await get<{ success: boolean; note: string; message?: string }>(
    `/knowledge/problems/${problemId}/note`
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch note");
  return data.note;
}

/** PATCH /knowledge/problems/:problemId/note — save user's personal note (JWT protected) */
export async function saveUserNote(problemId: string | number, note: string): Promise<void> {
  const data = await patch<{ success: boolean; message?: string }>(
    `/knowledge/problems/${problemId}/note`,
    { note }
  );
  if (!data.success) throw new Error(data.message || "Failed to save note");
}

/** Convenience: total solved count across all DSA problems */
export async function fetchSolvedCount(): Promise<number> {
  const solved = await fetchProgress();
  return solved.size;
}
