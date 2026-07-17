/**
 * Domain models for the LMS platform
 */

import { Timestamp, UserRole } from "./common";

// ===== USER TYPES =====
export interface User extends Timestamp {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  isEmailVerified: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

// ===== LEARNING PATH TYPES =====
export enum LearningPathType {
  DSA = "dsa",
  SYSTEM_DESIGN = "system_design",
  DBMS = "dbms",
  OS = "os",
  NETWORKS = "networks",
  OOPS = "oops",
}

export interface Topic extends Timestamp {
  id: string;
  pathId: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  order: number;
  videoUrl?: string;
  articleUrl?: string;
  problemCount: number;
}

export interface Problem extends Timestamp {
  id: string;
  topicId: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  examples: Example[];
  constraints?: string;
  tags: string[];
  acceptanceRate?: number;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Solution extends Timestamp {
  id: string;
  problemId: string;
  userId: string;
  code: string;
  language: string;
  isOptimal: boolean;
  timeComplexity?: string;
  spaceComplexity?: string;
  status: "pending" | "accepted" | "rejected";
}

// ===== ASSESSMENT TYPES =====
export interface Assessment extends Timestamp {
  id: string;
  title: string;
  description: string;
  type: "quiz" | "mock_test" | "challenge";
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface Question {
  id: string;
  assessmentId: string;
  question: string;
  type: "multiple_choice" | "short_answer" | "coding";
  options?: Option[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface AssessmentAttempt extends Timestamp {
  id: string;
  assessmentId: string;
  userId: string;
  score: number;
  totalScore: number;
  status: "in_progress" | "completed";
  answers: Answer[];
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

// ===== PROGRESS TYPES =====
export interface UserProgress extends Timestamp {
  userId: string;
  pathType: LearningPathType;
  topicId: string;
  completionPercentage: number;
  problemsSolved: number;
  totalProblems: number;
  isCompleted: boolean;
}

export interface SkillBadge extends Timestamp {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface UserBadge extends Timestamp {
  userId: string;
  badgeId: string;
  unlockedAt: string;
}

// ===== BOOKMARK TYPES =====
export interface Bookmark extends Timestamp {
  id: string;
  userId: string;
  problemId: string;
  note?: string;
}

// ===== ADMIN TYPES =====
export interface LearningPath extends Timestamp {
  id: string;
  type: LearningPathType;
  title: string;
  description: string;
  icon: string;
  order: number;
  isPublished: boolean;
}
