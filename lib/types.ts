export const CATEGORIES = [
  "Health",
  "Wellness",
  "Study",
  "Work",
  "Finance",
  "General",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const FREQUENCIES = ["Daily", "Weekly", "Custom"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const PRIORITIES = ["High", "Medium", "Low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Session {
  id: string;
  name: string;
  email: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: Category;
  frequency: Frequency;
  priority: Priority;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

/** A habit decorated with derived, read-only progress data. */
export interface HabitWithProgress extends Habit {
  streak: number;
  bestStreak: number;
  todayProgress: number;
  completedToday: boolean;
}

export interface HabitRecord {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  /** Completion percentage for that day, 0-100. */
  progress: number;
}

export interface HabitFormValues {
  name: string;
  description: string;
  category: Category;
  frequency: Frequency;
  priority: Priority;
  startDate: string;
  endDate: string;
}

export interface DailyPoint {
  label: string;
  percent: number;
}

export interface DashboardSummary {
  activeCount: number;
  completedToday: number;
  percentToday: number;
  currentStreak: number;
  bestStreak: number;
  weekly: DailyPoint[];
  monthly: DailyPoint[];
  habits: HabitWithProgress[];
  isEmpty: boolean;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
}

export interface StatisticsSummary {
  totalHabits: number;
  activeHabits: number;
  finishedHabits: number;
  bestStreak: number;
  byCategory: CategoryBreakdown[];
  weekly: DailyPoint[];
  monthly: DailyPoint[];
}
