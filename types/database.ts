export interface Goal {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  category: 'Career Development' | 'Health & Fitness' | 'Personal Growth' | 'Financial' | 'Education' | 'Relationships' | 'Creativity' | 'Travel' | 'Other' | string;
  due_date: string | null;
  achieved: boolean;
  image_small: string | null;
  image_large: string | null;
}

export interface Habit {
  id: string;
  goal_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  selected_emoji: string;
  reminder_days: string[]; // Stored as JSON string of day names
  reminder_time: string; // Format: HH:MM
  reminder_ids: string[]; // Stored as JSON string of reminder IDs
  completed: boolean;
}

export interface Task {
  id: string;
  goal_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  selected_emoji: string;
  reminder_relative_date: ReminderRelativeTimeType;
  reminder_ids: string[]; // Stored as JSON string of reminder IDs
  due_date: string | null;
  description: string | null;
  completed: boolean;
}

export interface ReminderOccurrence {
  id: string;
  reminder_id: string;
  habit_id: string | null;
  task_id: string | null;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'missed';
  scheduled_for_day: string;
  scheduled_for: string;
  created_at: string;
  updated_at: string;
}

/**
 * Convert arrays to JSON strings
 * @param T - The type arrays of which to convert
 * @returns {ConvertArraysToJSON<T>} The converted type
 */
export type ConvertArraysToJSON<T> = {
  [K in keyof T]: T[K] extends string[] ? string : T[K]
}

export type ReminderRelativeTimeType = 'Never' | 'Two weeks before the deadline' | 'One week before the deadline' | 'Two days before the deadline' | 'One day before the deadline' | 'On the deadline';