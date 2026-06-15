/**
 * Theory API Service
 * Handles all theory/learning routes:
 *   GET  /theory/subjects
 *   GET  /theory/subjects/:subjectId/chapters
 *   GET  /theory/articles/:articleId
 *
 * NOTE: NEXT_PUBLIC_API_URL points to /api/auth — we strip that suffix
 * to get the base /api URL, matching the pattern used in knowledgeService.ts.
 */

import axios from "axios";

// Strip trailing /auth (or any auth segment) to get the base API root
const RAW_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/auth";
const API_BASE = RAW_URL.replace(/\/auth$/, "");

// Shared axios config: send httpOnly JWT cookie on every request
const withCreds = { withCredentials: true };

// ── Types ────────────────────────────────────────────────────────────────────

export interface TheorySubject {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface TheoryArticleStub {
  id: number;
  chapterId: number;
  title: string;
  readTimeMinutes: number;
  isPremium: boolean;
}

export interface TheoryChapter {
  id: number;
  name: string;
  sequenceOrder: number;
  articles: TheoryArticleStub[];
}

export interface TheoryArticle {
  id: number;
  chapterId: number;
  chapterName: string;
  subjectId: number;
  subjectName: string;
  title: string;
  content: string;
  readTimeMinutes: number;
  isPremium: boolean;
  videoLink: string | null;
  coverImage: string | null;
  createdAt: string;
}

// ── API calls ────────────────────────────────────────────────────────────────

/** GET /theory/subjects — fetch all theory subjects */
export async function fetchSubjects(): Promise<TheorySubject[]> {
  const { data } = await axios.get(`${API_BASE}/theory/subjects`, withCreds);
  if (!data.success) throw new Error(data.message || "Failed to fetch subjects");
  return data.subjects as TheorySubject[];
}

/**
 * GET /theory/subjects/:subjectId/chapters
 * Fetch all chapters (with article stubs) for a subject.
 */
export async function fetchChaptersBySubject(
  subjectId: string | number
): Promise<TheoryChapter[]> {
  const { data } = await axios.get(
    `${API_BASE}/theory/subjects/${subjectId}/chapters`,
    withCreds
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch chapters");
  return data.chapters as TheoryChapter[];
}

/**
 * GET /theory/articles/:articleId
 * Fetch full article content for reading.
 */
export async function fetchArticle(
  articleId: string | number
): Promise<TheoryArticle> {
  const { data } = await axios.get(
    `${API_BASE}/theory/articles/${articleId}`,
    withCreds
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch article");
  return data.article as TheoryArticle;
}
