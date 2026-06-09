// Learning feature types (can be expanded)

export interface Topic {
  id: string;
  path: string; // 'dsa', 'system-design', etc.
  title: string;
  description: string;
  order: number;
}

export interface Problem {
  id: string;
  topicId: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  solved: boolean;
}

export interface LearningPath {
  name: string;
  title: string;
  description: string;
  topics: Topic[];
}
