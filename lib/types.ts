// Progress tracking types
export interface ProgressEntry {
  id: string;
  userId: string;
  date: string; // ISO string
  title: string;
  description: string;
  images: string[]; // URLs to Cloudinary images
  postedAt: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface UserStats {
  userId: string;
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  lastPostedDate: string;
}

export interface MonthCard {
  month: number; // 0-11
  year: number;
  entriesCount: number;
  daysInMonth: number;
  progressPercentage: number;
} 