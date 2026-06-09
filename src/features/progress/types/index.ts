// progress feature types

export interface UserProgress {
  userId: string;
  pathProgress: PathProgress[];
  totalProblemasSolved: number;
  lastActiveAt: Date;
}

export interface PathProgress {
  pathName: string;
  completedTopics: number;
  totalTopics: number;
  solvedProblems: number;
  totalProblems: number;
  progress: number; // percentage
}

export interface ProblemProgress {
  problemId: string;
  solved: boolean;
  attempts: number;
  lastAttemptAt: Date;
}
