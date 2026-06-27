/**
 * Theory API Service
 * Handles all theory/learning routes:
 *   GET  /theory/subjects
 *   GET  /theory/subjects/name/:slug/chapters  ← single-call for subject pages
 *   GET  /theory/subjects/:subjectId/chapters
 *   GET  /theory/chapters/:chapterId/articles
 *   GET  /theory/articles/:articleId
 *
 * Uses the centralized fetch-based apiCall helpers from ./api so that
 * cookie handling, CSRF injection, and the 401→refresh retry flow are
 * applied automatically to every request.
 */

import { get } from "./api";

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

export interface ArticleImage {
  id: number;
  imageUrl: string;
  caption: string | null;
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
  images: ArticleImage[];
}

/** Shape returned by fetchChaptersBySubjectName */
export interface SubjectChaptersResult {
  subjectId: number;
  subjectName: string;
  chapters: TheoryChapter[];
}

// ── API calls ────────────────────────────────────────────────────────────────

/** GET /theory/subjects — fetch all theory subjects */
export async function fetchSubjects(): Promise<TheorySubject[]> {
  const data = await get<{ success: boolean; subjects: TheorySubject[]; message?: string }>(
    "/theory/subjects"
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch subjects");
  return data.subjects;
}

/**
 * GET /theory/subjects/name/:slug/chapters
 * Resolves the subject by name in ONE DB round-trip — use this on subject-specific
 * pages (Git, OS, DBMS…) instead of calling fetchSubjects() + fetchChaptersBySubject().
 */
export async function fetchChaptersBySubjectName(slug: string): Promise<SubjectChaptersResult> {
  const data = await get<{
    success: boolean;
    subjectId: number;
    subjectName: string;
    chapters: TheoryChapter[];
    message?: string;
  }>(`/theory/subjects/name/${encodeURIComponent(slug)}/chapters`);
  if (!data.success) throw new Error(data.message || "Failed to fetch chapters");
  return {
    subjectId: data.subjectId,
    subjectName: data.subjectName,
    chapters: data.chapters,
  };
}

/**
 * GET /theory/subjects/:subjectId/chapters
 * Fetch all chapters (with article stubs) for a subject by numeric ID.
 */
export async function fetchChaptersBySubject(
  subjectId: string | number
): Promise<TheoryChapter[]> {
  const data = await get<{ success: boolean; chapters: TheoryChapter[]; message?: string }>(
    `/theory/subjects/${subjectId}/chapters`
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch chapters");
  return data.chapters;
}

/**
 * GET /theory/chapters/:chapterId/articles
 * Fetch article stubs for a specific chapter.
 */
export async function fetchArticlesByChapter(chapterId: string | number): Promise<TheoryArticleStub[]> {
  const data = await get<{ success: boolean; articles: TheoryArticleStub[]; message?: string }>(
    `/theory/chapters/${chapterId}/articles`
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch articles");
  return data.articles;
}

/**
 * GET /theory/articles/:articleId
 * Fetch full article content for reading.
 */
export async function fetchArticle(articleId: string | number): Promise<TheoryArticle> {
  const data = await get<{ success: boolean; article: TheoryArticle; message?: string }>(
    `/theory/articles/${articleId}`
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch article");
  return data.article;
}
