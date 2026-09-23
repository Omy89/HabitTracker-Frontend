export const CATEGORIES = [
  'Health',
  'Wellness',
  'Study',
  'Work',
  'Finance',
  'General',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const FREQUENCIES = ['Daily', 'Weekly', 'Custom'] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const PRIORITIES = ['High', 'Medium', 'Low'] as const;
export type Priority = (typeof PRIORITIES)[number];

/** Monday first; values follow Date#getDay (0 = Sunday). */
export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0] as const;

export type StreakUnit = 'day' | 'week';

export interface Session {
  id: string;
  name: string;
  email: string;
}

export interface UserProfile extends Session {
  createdAt: string;
  totalHabits: number;
  /** Best run of days completing at least one habit (same as the dashboard). */
  bestStreak: number;
}

export interface PeriodProgress {
  done: number;
  due: number;
  percent: number | null;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: Category;
  frequency: Frequency;
  days: number[];
  priority: Priority;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

export interface HabitWithProgress extends Habit {
  streak: number;
  bestStreak: number;
  streakUnit: StreakUnit;
  todayProgress: number;
  completedToday: boolean;
  scheduledToday: boolean;
  dueToday: boolean;
  week: PeriodProgress;
  month: PeriodProgress;
}

export interface HabitRecord {
  date: string;
  progress: number;
  completed: boolean;
}

export interface HabitFormValues {
  name: string;
  description: string;
  category: Category;
  frequency: Frequency;
  days: number[];
  priority: Priority;
  startDate: string;
  endDate: string;
}

export interface DailyPoint extends PeriodProgress {
  date: string;
}

export interface MonthPoint extends PeriodProgress {
  month: string;
}

export interface DashboardSummary {
  activeCount: number;
  completedToday: number;
  dueToday: number;
  percentToday: number;
  currentStreak: number;
  bestStreak: number;
  weekly: DailyPoint[];
  monthly: DailyPoint[];
  habits: HabitWithProgress[];
  isEmpty: boolean;
}

export interface CategoryBreakdown {
  name: Category;
  value: number;
}

export interface HabitStatistics extends PeriodProgress {
  id: string;
  name: string;
  category: Category;
  frequency: Frequency;
  active: boolean;
  streak: number;
  bestStreak: number;
  streakUnit: StreakUnit;
}

export interface StatisticsSummary {
  range: { from: string; to: string };
  totalHabits: number;
  activeHabits: number;
  inactiveHabits: number;
  finishedHabits: number;
  currentStreak: number;
  bestStreak: number;
  completion: PeriodProgress;
  daily: DailyPoint[];
  trend: DailyPoint[];
  months: MonthPoint[];
  byCategory: CategoryBreakdown[];
  habits: HabitStatistics[];
}
