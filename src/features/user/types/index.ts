// user feature types

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  userId: string;
  emailNotifications: boolean;
  dailyReminders: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}
