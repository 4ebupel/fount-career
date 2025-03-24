import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Goal, Habit, Task } from '../types/database';

// Database name
const DATABASE_NAME = 'fount_career.db';

// Global database instance
let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize and get the database instance
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbInstance) {
    try {
      dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
      console.log('Database opened successfully:', DATABASE_NAME);
    } catch (error) {
      console.error('Error opening database:', error);
      throw error;
    }
  }
  return dbInstance;
};

/**
 * Initialize the database with required tables
 */
export const initDatabase = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    
    console.log('Creating database tables if they don\'t exist...');
    
    // Use execAsync for bulk operations
    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        due_date TEXT,
        achieved INTEGER NOT NULL DEFAULT 0,
        image_small TEXT,
        image_large TEXT
      );
      
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY NOT NULL,
        goal_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        title TEXT NOT NULL,
        selected_emoji TEXT NOT NULL,
        reminder_days TEXT NOT NULL,
        reminder_time TEXT NOT NULL,
        FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        goal_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        title TEXT NOT NULL,
        selected_emoji TEXT NOT NULL,
        reminder_time TEXT,
        due_date TEXT,
        description TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
      );
    `);
    
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Check if the database has been initialized by checking if tables exist
 */
export const isDatabaseInitialized = async (): Promise<boolean> => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='goals';"
    );
    return !!result;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  }
};

/**
 * Generate a UUID for primary keys
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// GOALS CRUD Operations

/**
 * Create a new goal
 */
export const createGoal = async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> => {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const newGoal: Goal = {
      id: generateUUID(),
      created_at: now,
      updated_at: now,
      ...goal,
    };

    await db.runAsync(
      `INSERT INTO goals (id, created_at, updated_at, title, category, due_date, achieved, image_small, image_large)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newGoal.id,
        newGoal.created_at,
        newGoal.updated_at,
        newGoal.title,
        newGoal.category,
        newGoal.due_date,
        newGoal.achieved ? 1 : 0,
        newGoal.image_small,
        newGoal.image_large,
      ]
    );

    return newGoal;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

/**
 * Get all goals
 */
export const getGoals = async (): Promise<Goal[]> => {
  try {
    const db = await getDatabase();
    const goals = await db.getAllAsync<Goal>('SELECT * FROM goals ORDER BY created_at DESC;');
    
    // Convert SQLite integers to booleans
    return goals.map(goal => ({
      ...goal,
      achieved: goal.achieved === true,
    }));
  } catch (error) {
    console.error('Error getting goals:', error);
    return [];
  }
};

/**
 * Get a goal by its ID
 */
export const getGoalById = async (id: string): Promise<Goal | null> => {
  try {
    const db = await getDatabase();
    const goal = await db.getFirstAsync<Goal>('SELECT * FROM goals WHERE id = ?;', [id]);
    
    if (!goal) {
      return null;
    }
    
    return {
      ...goal,
      achieved: goal.achieved === true,
    };
  } catch (error) {
    console.error(`Error getting goal with ID ${id}:`, error);
    return null;
  }
};

/**
 * Update a goal
 */
export const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'created_at'>>): Promise<Goal> => {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    const existingGoal = await getGoalById(id);
    if (!existingGoal) {
      throw new Error('Goal not found');
    }
    
    const updatedGoal = {
      ...existingGoal,
      ...updates,
      updated_at: now,
    };
    
    await db.runAsync(
      `UPDATE goals 
       SET updated_at = ?, title = ?, category = ?, due_date = ?, achieved = ?, image_small = ?, image_large = ?
       WHERE id = ?;`,
      [
        updatedGoal.updated_at,
        updatedGoal.title,
        updatedGoal.category,
        updatedGoal.due_date,
        updatedGoal.achieved ? 1 : 0,
        updatedGoal.image_small,
        updatedGoal.image_large,
        id,
      ]
    );
    
    return updatedGoal;
  } catch (error) {
    console.error(`Error updating goal with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a goal
 */
export const deleteGoal = async (id: string): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM goals WHERE id = ?;', [id]);
  } catch (error) {
    console.error(`Error deleting goal with ID ${id}:`, error);
    throw error;
  }
};

// HABITS CRUD Operations

/**
 * Create a new habit
 */
export const createHabit = async (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<Habit> => {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const newHabit: Habit = {
      id: generateUUID(),
      created_at: now,
      updated_at: now,
      ...habit,
    };

    await db.runAsync(
      `INSERT INTO habits (id, goal_id, created_at, updated_at, title, selected_emoji, reminder_days, reminder_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newHabit.id,
        newHabit.goal_id,
        newHabit.created_at,
        newHabit.updated_at,
        newHabit.title,
        newHabit.selected_emoji,
        newHabit.reminder_days,
        newHabit.reminder_time,
      ]
    );

    return newHabit;
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
};

/**
 * Get habits by goal ID
 */
export const getHabitsByGoalId = async (goalId: string): Promise<Habit[]> => {
  try {
    const db = await getDatabase();
    return await db.getAllAsync<Habit>(
      'SELECT * FROM habits WHERE goal_id = ? ORDER BY created_at DESC;',
      [goalId]
    );
  } catch (error) {
    console.error(`Error getting habits for goal ID ${goalId}:`, error);
    return [];
  }
};

/**
 * Update a habit
 */
export const updateHabit = async (id: string, updates: Partial<Omit<Habit, 'id' | 'goal_id' | 'created_at'>>): Promise<Habit> => {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    // First check if habit exists
    const existingHabit = await db.getFirstAsync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
    
    if (!existingHabit) {
      throw new Error('Habit not found');
    }
    
    const updatedHabit = {
      ...existingHabit,
      ...updates,
      updated_at: now,
    };
    
    await db.runAsync(
      `UPDATE habits 
       SET updated_at = ?, title = ?, selected_emoji = ?, reminder_days = ?, reminder_time = ?
       WHERE id = ?;`,
      [
        updatedHabit.updated_at,
        updatedHabit.title,
        updatedHabit.selected_emoji,
        updatedHabit.reminder_days,
        updatedHabit.reminder_time,
        id,
      ]
    );
    
    return updatedHabit;
  } catch (error) {
    console.error(`Error updating habit with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a habit
 */
export const deleteHabit = async (id: string): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM habits WHERE id = ?;', [id]);
  } catch (error) {
    console.error(`Error deleting habit with ID ${id}:`, error);
    throw error;
  }
};

// TASKS CRUD Operations

/**
 * Create a new task
 */
export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed'>): Promise<Task> => {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const newTask: Task = {
      id: generateUUID(),
      created_at: now,
      updated_at: now,
      completed: false,
      ...task,
    };

    await db.runAsync(
      `INSERT INTO tasks (id, goal_id, created_at, updated_at, title, selected_emoji, reminder_time, due_date, description, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newTask.id,
        newTask.goal_id,
        newTask.created_at,
        newTask.updated_at,
        newTask.title,
        newTask.selected_emoji,
        newTask.reminder_time,
        newTask.due_date,
        newTask.description,
        newTask.completed ? 1 : 0,
      ]
    );

    return newTask;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Get tasks by goal ID
 */
export const getTasksByGoalId = async (goalId: string): Promise<Task[]> => {
  try {
    const db = await getDatabase();
    const tasks = await db.getAllAsync<Task>(
      'SELECT * FROM tasks WHERE goal_id = ? ORDER BY created_at DESC;',
      [goalId]
    );
    
    // Convert SQLite integers to booleans
    return tasks.map(task => ({
      ...task,
      completed: task.completed === true,
    }));
  } catch (error) {
    console.error(`Error getting tasks for goal ID ${goalId}:`, error);
    return [];
  }
};

/**
 * Update a task
 */
export const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'goal_id' | 'created_at'>>): Promise<Task> => {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    // First check if task exists
    const existingTask = await db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?;', [id]);
    
    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...existingTask,
      ...updates,
      updated_at: now,
      completed: updates.completed !== undefined ? updates.completed : existingTask.completed === true,
    };
    
    await db.runAsync(
      `UPDATE tasks 
       SET updated_at = ?, title = ?, selected_emoji = ?, reminder_time = ?, due_date = ?, description = ?, completed = ?
       WHERE id = ?;`,
      [
        updatedTask.updated_at,
        updatedTask.title,
        updatedTask.selected_emoji,
        updatedTask.reminder_time,
        updatedTask.due_date,
        updatedTask.description,
        updatedTask.completed ? 1 : 0,
        id,
      ]
    );
    
    return {
      ...updatedTask,
      completed: updatedTask.completed === true,
    };
  } catch (error) {
    console.error(`Error updating task with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (id: string): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tasks WHERE id = ?;', [id]);
  } catch (error) {
    console.error(`Error deleting task with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Clean up database resources
 */
export const closeDatabase = async (): Promise<void> => {
  if (dbInstance) {
    try {
      await dbInstance.closeAsync();
      dbInstance = null;
      console.log('Database closed successfully');
    } catch (error) {
      console.error('Error closing database:', error);
      throw error;
    }
  }
};

// Export the database access function
export const db = { getDatabase }; 