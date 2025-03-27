export interface Goal {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  category: string;
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
  reminder_days: string; // Stored as JSON string of day names
  reminder_time: string; // Format: HH:MM
  completed: boolean;
}

export interface Task {
  id: string;
  goal_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  selected_emoji: string;
  reminder_time: string | null; // Format: HH:MM
  due_date: string | null;
  description: string | null;
  completed: boolean;
} 