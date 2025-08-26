import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { ConvertArraysToJSON, Goal, Habit, ReminderOccurrence, Task } from '../types/database';
import { premadeGoalsSeedData, premadeTasksSeedData, premadeHabitsSeedData } from './seedData';

// Database name
const DATABASE_NAME = 'fount_career.db';

// Global database instance
let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize and get the database instance with better error handling
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbInstance) {
    try {
      dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME, {
        useNewConnection: true
      });
      console.log('Database opened successfully:', DATABASE_NAME);
    } catch (error) {
      console.error('Error opening database:', error);
      throw error;
    }
  }

  // Test the connection before returning
  try {
    await dbInstance.getFirstAsync('SELECT 1');
    return dbInstance;
  } catch (error) {
    console.warn('Database connection test failed, reopening...', error);
    // Reset the instance and try again
    dbInstance = null;
    try {
      dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME, {
        useNewConnection: true
      });
      console.log('Database reopened successfully');
      return dbInstance;
    } catch (reopenError) {
      console.error('Failed to reopen database:', reopenError);
      throw reopenError;
    }
  }
};

/**
 * Wrapper for database operations with automatic retry
 */
const withDatabaseRetry = async <T>(
  operation: (db: SQLite.SQLiteDatabase) => Promise<T>,
  maxRetries: number = 2
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const db = await getDatabase();
      return await operation(db);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);

      if (attempt < maxRetries) {
        // Reset database instance for retry
        dbInstance = null;
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      }
    }
  }

  throw lastError!;
};

/**
 * Initialize the database with required tables
 */
export const initDatabase = async (): Promise<void> => {
  return withDatabaseRetry(async (db) => {
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
      
      CREATE TABLE IF NOT EXISTS premadeGoals (
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

      CREATE TABLE IF NOT EXISTS premadeHabits (
        id TEXT PRIMARY KEY NOT NULL,
        goal_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        title TEXT NOT NULL,
        selected_emoji TEXT NOT NULL,
        reminder_days TEXT NOT NULL,
        reminder_time TEXT NOT NULL,
        reminder_ids TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (goal_id) REFERENCES premadeGoals (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS premadeTasks (
        id TEXT PRIMARY KEY NOT NULL,
        goal_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        title TEXT NOT NULL,
        selected_emoji TEXT NOT NULL,
        reminder_relative_date TEXT NOT NULL,
        reminder_ids TEXT NOT NULL,
        due_date TEXT,
        description TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (goal_id) REFERENCES premadeGoals (id) ON DELETE CASCADE
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
        reminder_ids TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        goal_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        title TEXT NOT NULL,
        selected_emoji TEXT NOT NULL,
        reminder_relative_date TEXT NOT NULL,
        reminder_ids TEXT NOT NULL,
        due_date TEXT,
        description TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reminderOccurrences (
        id TEXT PRIMARY KEY NOT NULL,
        reminder_id TEXT NOT NULL,
        habit_id TEXT,
        task_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        scheduled_for TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
        CHECK (
          (habit_id IS NOT NULL AND task_id IS NULL) OR
          (habit_id IS NULL AND task_id IS NOT NULL)
        )
      );
    `);

    console.log('Database tables created successfully');

    // Check if premade goals need to be populated
    await populatePremadeGoals();
    await populatePremadeTasks();
    await populatePremadeHabits();
  });
};

// Populate the premade tables with predefined data

/**
 * Populate the premadeGoals table with predefined data
 */
export const populatePremadeGoals = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    const count = await db.getFirstAsync<{ count: number }>("SELECT count(*) as count FROM premadeGoals;");

    if (count && count.count === 0) {
      console.log('Populating premadeGoals table with seed data...');
      const now = new Date().toISOString();

      // Handle large datasets by processing in batches
      const BATCH_SIZE = 50; // SQLite has parameter limits, keep batch size reasonable
      let totalInserted = 0;

      // Process in batches to avoid hitting SQLite parameter limits
      for (let i = 0; i < premadeGoalsSeedData.length; i += BATCH_SIZE) {
        const batch = premadeGoalsSeedData.slice(i, i + BATCH_SIZE);

        // Use a single SQL statement with multiple value sets for better performance
        // This builds a query like: INSERT INTO table VALUES (), (), ()...
        const valueGroups: string[] = [];
        const params: any[] = [];

        for (const goalData of batch) {
          // Use a placeholder string that our image component can recognize
          // const imagePath = Platform.OS === 'ios' ? `asset:/assets/${goalData.image_small}` : `file:///android_asset/assets/${goalData.image_small}`;
          // const imagePath =`asset:/fount.career/assets/${goalData.image_small}`;

          valueGroups.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');
          params.push(
            goalData.id,
            now,
            now,
            goalData.title,
            goalData.category,
            goalData.due_date,
            goalData.achieved ? 1 : 0,
            // imagePath,
            // imagePath
            goalData.image_small,
            goalData.image_large
          );
        }

        // Execute the batch insert
        const query = `
          INSERT INTO premadeGoals (id, created_at, updated_at, title, category, due_date, achieved, image_small, image_large)
          VALUES ${valueGroups.join(', ')};
        `;

        await db.runAsync(query, params);
        totalInserted += batch.length;
      }

      console.log(`${totalInserted} premade goals added successfully`);
    } else {
      console.log('Premade goals already populated, skipping seed data');
    }
  } catch (error) {
    console.error('Error populating premade goals:', error);
  }
};

/**
 * Populate the tasks table with predefined data
 */

export const populatePremadeTasks = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    const count = await db.getFirstAsync<{ count: number }>("SELECT count(*) as count FROM premadeTasks;");

    if (count && count.count === 0) {
      console.log('Populating premadeTasks table with seed data...');
      const now = new Date().toISOString();

      // Handle large datasets by processing in batches
      const BATCH_SIZE = 50; // SQLite has parameter limits, keep batch size reasonable
      let totalInserted = 0;

      // Process in batches to avoid hitting SQLite parameter limits
      for (let i = 0; i < premadeTasksSeedData.length; i += BATCH_SIZE) {
        const batch = premadeTasksSeedData.slice(i, i + BATCH_SIZE);

        // Use a single SQL statement with multiple value sets for better performance
        // This builds a query like: INSERT INTO table VALUES (), (), ()...
        const valueGroups: string[] = [];
        const params: any[] = [];

        for (const taskData of batch) {
          valueGroups.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          params.push(
            taskData.id,
            now,
            now,
            taskData.title,
            taskData.selected_emoji,
            taskData.reminder_relative_date,
            JSON.stringify(taskData.reminder_ids),
            taskData.due_date,
            taskData.description,
            taskData.completed ? 1 : 0,
            taskData.goal_id
          );
        }

        // Execute the batch insert
        const query = `
          INSERT INTO premadeTasks (id, created_at, updated_at, title, selected_emoji, reminder_relative_date, reminder_ids, due_date, description, completed, goal_id)
          VALUES ${valueGroups.join(', ')};
        `;

        await db.runAsync(query, params);
        totalInserted += batch.length;
      }

      console.log(`${totalInserted} premade tasks added successfully`);
    } else {
      console.log('Premade tasks already populated, skipping seed data');
    }
  } catch (error) {
    console.error('Error populating premade tasks:', error);
  }
};

/**
 * Populate the habits table with predefined data
 */

export const populatePremadeHabits = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    const count = await db.getFirstAsync<{ count: number }>("SELECT count(*) as count FROM premadeHabits;");

    if (count && count.count === 0) {
      console.log('Populating premadeHabits table with seed data...');
      const now = new Date().toISOString();

      // Handle large datasets by processing in batches
      const BATCH_SIZE = 50; // SQLite has parameter limits, keep batch size reasonable
      let totalInserted = 0;

      // Process in batches to avoid hitting SQLite parameter limits
      for (let i = 0; i < premadeHabitsSeedData.length; i += BATCH_SIZE) {
        const batch = premadeHabitsSeedData.slice(i, i + BATCH_SIZE);

        // Use a single SQL statement with multiple value sets for better performance
        // This builds a query like: INSERT INTO table VALUES (), (), ()...
        const valueGroups: string[] = [];
        const params: any[] = [];

        for (const habitData of batch) {
          valueGroups.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          params.push(
            habitData.id,
            now,
            now,
            habitData.title,
            habitData.selected_emoji,
            JSON.stringify(habitData.reminder_days),
            habitData.reminder_time,
            JSON.stringify(habitData.reminder_ids),
            habitData.completed ? 1 : 0,
            habitData.goal_id
          );
        }

        // Execute the batch insert
        const query = `
          INSERT INTO premadeHabits (id, created_at, updated_at, title, selected_emoji, reminder_days, reminder_time, reminder_ids, completed, goal_id)
          VALUES ${valueGroups.join(', ')};
        `;

        await db.runAsync(query, params);
        totalInserted += batch.length;
      }

      console.log(`${totalInserted} premade habits added successfully`);
    } else {
      console.log('Premade habits already populated, skipping seed data');
    }
  } catch (error) {
    console.error('Error populating premade habits:', error);
  }
};


/**
 * Check if the database has been initialized by checking if tables exist
 */
export const isDatabaseInitialized = async (): Promise<boolean> => {
  return withDatabaseRetry(async (db) => {
    const result = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='goals';"
    );
    return !!result;
  });
};

/**
 * Generate a UUID for primary keys
 */
export const generateUUID = (): string => {
  return uuidv4();
};

// GOALS CRUD Operations

/**
 * Create a new goal
 */
export const createGoal = async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> => {
  return withDatabaseRetry(async (db) => {
    const now = new Date().toISOString();
    const newGoal: Goal = {
      ...goal,
      id: generateUUID(),
      created_at: now,
      updated_at: now,
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
  });
};

/**
 * Get all goals
 */
export const getGoals = async (): Promise<Goal[]> => {
  return withDatabaseRetry(async (db) => {
    const goals = await db.getAllAsync<Goal>('SELECT * FROM goals ORDER BY created_at DESC;');

    // Convert SQLite integers to booleans
    return goals.map(goal => ({
      ...goal,
      achieved: Boolean(goal.achieved),
    }));
  });
};

/**
 * Get a goal by its ID
 */
export const getGoalById = async (id: string): Promise<Goal | null> => {
  return withDatabaseRetry(async (db) => {
    const goal = await db.getFirstAsync<Goal>('SELECT * FROM goals WHERE id = ?;', [id]);

    if (!goal) {
      return null;
    }

    return {
      ...goal,
      achieved: Boolean(goal.achieved),
    };
  });
};

/**
 * Update a goal
 */
export const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'created_at'>>): Promise<Goal> => {
  return withDatabaseRetry(async (db) => {
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
  });
};

/**
 * Delete a goal
 */
export const deleteGoal = async (id: string): Promise<void> => {
  return withDatabaseRetry(async (db) => {
    await db.runAsync('DELETE FROM goals WHERE id = ?;', [id]);
  });
};

// HABITS CRUD Operations

/**
 * Create a new habit
 */
export const createHabit = async (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<Habit> => {
  return withDatabaseRetry(async (db) => {
    const now = new Date().toISOString();
    const newHabit: Habit = {
      ...habit,
      id: generateUUID(),
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO habits (id, goal_id, created_at, updated_at, title, selected_emoji, reminder_days, reminder_time, reminder_ids, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newHabit.id,
        newHabit.goal_id,
        newHabit.created_at,
        newHabit.updated_at,
        newHabit.title,
        newHabit.selected_emoji,
        JSON.stringify(newHabit.reminder_days),
        newHabit.reminder_time,
        JSON.stringify(newHabit.reminder_ids),
        0,
      ]
    );

    return newHabit;
  });
};

export const getHabits = async (): Promise<Habit[]> => {
  return withDatabaseRetry(async (db) => {
    const habits = await db.getAllAsync<ConvertArraysToJSON<Habit>>('SELECT * FROM habits ORDER BY created_at DESC;');
    
    // Convert SQLite integers to booleans and parse JSON strings
    return habits.map(habit => ({
      ...habit,
      completed: Boolean(habit.completed),
      reminder_days: JSON.parse(habit.reminder_days),
      reminder_ids: JSON.parse(habit.reminder_ids),
    }));
  });
};

/**
 * Get habits by goal ID
 */
export const getHabitsByGoalId = async (goalId: string): Promise<Habit[]> => {
  return withDatabaseRetry(async (db) => {
    const habits = await db.getAllAsync<ConvertArraysToJSON<Habit>>(
      'SELECT * FROM habits WHERE goal_id = ? ORDER BY created_at DESC;',
      [goalId]
    );

    // Convert SQLite integers to booleans
    return habits.map(habit => ({
      ...habit,
      completed: Boolean(habit.completed),
      reminder_days: JSON.parse(habit.reminder_days),
      reminder_ids: JSON.parse(habit.reminder_ids),
    }));
  });
};

type HabitWithReminderOccurrence = Habit & {
  reminder_occurrence_id: string | null;
  reminder_occurrence_status: string | null;
  reminder_occurrence_scheduled_for: string | null;
};

export const getHabitsByGoalIdWithJoin = async (goalId: string): Promise<HabitWithReminderOccurrence[]> => {
  return withDatabaseRetry(async (db) => {
    const now = new Date().toISOString();
    const habits = await db.getAllAsync<ConvertArraysToJSON<HabitWithReminderOccurrence>>(
      `SELECT habits.*, 
              closest_occurrence.id as reminder_occurrence_id, 
              closest_occurrence.status as reminder_occurrence_status, 
              closest_occurrence.scheduled_for as reminder_occurrence_scheduled_for
       FROM habits
       LEFT JOIN (
         SELECT habit_id, id, status, scheduled_for,
                ROW_NUMBER() OVER (
                  PARTITION BY habit_id 
                  ORDER BY ABS(julianday(scheduled_for) - julianday(?))
                ) as rn
         FROM reminderOccurrences
       ) closest_occurrence ON habits.id = closest_occurrence.habit_id AND closest_occurrence.rn = 1
       WHERE habits.goal_id = ?
       ORDER BY habits.created_at DESC;`, 
      [now, goalId]
    );

    return habits.map(habit => ({
      ...habit,
      completed: Boolean(habit.completed),
      reminder_days: JSON.parse(habit.reminder_days),
      reminder_ids: JSON.parse(habit.reminder_ids),
    }));
  });
};

/**
   * Get a habit by its ID
   * @param id - The ID of the habit to get
   * @returns {Promise<Habit | null>} A Promise that resolves to:
   * - A Habit object with properties:
   *   - id: string - Unique identifier
   *   - goal_id: string - ID of associated goal
   *   - created_at: string - Creation timestamp
   *   - updated_at: string - Last update timestamp
   *   - title: string - Habit title
   *   - selected_emoji: string - Selected emoji icon
   *   - reminder_days: string - JSON string of reminder days
   *   - reminder_time: string - Reminder time
   *   - reminder_ids: string - JSON string of reminder IDs
   *   - completed: boolean - Completion status
   * - null if no habit found with given ID
   */
export const getHabitById = async (id: string): Promise<Habit | null> => {
  return withDatabaseRetry(async (db) => {
    const habit = await db.getFirstAsync<ConvertArraysToJSON<Habit>>('SELECT * FROM habits WHERE id = ?;', [id]);

    if (!habit) {
      return null;
    }

    return {
      ...habit,
      completed: Boolean(habit.completed),
      reminder_days: JSON.parse(habit.reminder_days),
      reminder_ids: JSON.parse(habit.reminder_ids),
    };
  });
};

/**
 * Update a habit
 */
export const updateHabit = async (id: string, updates: Partial<Omit<Habit, 'id' | 'created_at'>>): Promise<Habit> => {
  return withDatabaseRetry(async (db) => {
    const now = new Date().toISOString();

    const existingHabit = await db.getFirstAsync<ConvertArraysToJSON<Habit>>('SELECT * FROM habits WHERE id = ?;', [id]);

    if (!existingHabit) {
      throw new Error('Habit not found');
    }

    const updatedHabit = {
      ...existingHabit,
      ...updates,
      goal_id: existingHabit.goal_id, // Always keep the original goal_id
      updated_at: now,
      reminder_days: updates.reminder_days || JSON.parse(existingHabit.reminder_days),
      reminder_ids: updates.reminder_ids || JSON.parse(existingHabit.reminder_ids),
    };

    await db.runAsync(
      `UPDATE habits 
       SET updated_at = ?, title = ?, selected_emoji = ?, reminder_days = ?, reminder_time = ?, reminder_ids = ?, completed = ?
       WHERE id = ?;`,
      [
        updatedHabit.updated_at,
        updatedHabit.title,
        updatedHabit.selected_emoji,
        JSON.stringify(updatedHabit.reminder_days),
        updatedHabit.reminder_time,
        JSON.stringify(updatedHabit.reminder_ids),
        updatedHabit.completed ? 1 : 0,
        id,
      ]
    );

    return updatedHabit;
  });
};

/**
 * Delete a habit
 */
export const deleteHabit = async (id: string): Promise<void> => {
  return withDatabaseRetry(async (db) => {
    await db.runAsync('DELETE FROM habits WHERE id = ?;', [id]);
  });
};

// TASKS CRUD Operations

/**
 * Create a new task
 */
export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed'>): Promise<Task> => {
  return withDatabaseRetry(async (db) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: generateUUID(),
      created_at: now,
      updated_at: now,
      completed: false,
    };

    await db.runAsync(
      `INSERT INTO tasks (id, goal_id, created_at, updated_at, title, selected_emoji, reminder_relative_date, reminder_ids, due_date, description, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newTask.id,
        newTask.goal_id,
        newTask.created_at,
        newTask.updated_at,
        newTask.title,
        newTask.selected_emoji,
        newTask.reminder_relative_date,
        JSON.stringify(newTask.reminder_ids),
        newTask.due_date,
        newTask.description,
        newTask.completed ? 1 : 0,
      ]
    );

    return newTask;
  });
};

/**
 * Get tasks by goal ID
 */
export const getTasksByGoalId = async (goalId: string): Promise<Task[]> => {
  return withDatabaseRetry(async (db) => {
    const tasks = await db.getAllAsync<Task>(
      'SELECT * FROM tasks WHERE goal_id = ? ORDER BY created_at DESC;',
      [goalId]
    );

    // Convert SQLite integers to booleans
    return tasks.map(task => ({
      ...task,
      completed: Boolean(task.completed),
    }));
  });
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  return withDatabaseRetry(async (db) => {
    const task = await db.getFirstAsync<ConvertArraysToJSON<Task>>('SELECT * FROM tasks WHERE id = ?;', [id]);

    if (!task) {
      return null;
    }

    return {
      ...task,
      completed: Boolean(task.completed),
      reminder_ids: JSON.parse(task.reminder_ids),
    };
  });
};

/**
 * Update a task
 */
export const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<Task> => {
  return withDatabaseRetry(async (db) => {
    const now = new Date().toISOString();

    const existingTask = await db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?;', [id]);

    if (!existingTask) {
      throw new Error('Task not found');
    }

    const updatedTask = {
      ...existingTask,
      ...updates,
      goal_id: existingTask.goal_id, // Always keep the original goal_id
      updated_at: now,
    };

    await db.runAsync(
      `UPDATE tasks 
       SET updated_at = ?, title = ?, selected_emoji = ?, reminder_relative_date = ?, reminder_ids = ?, due_date = ?, description = ?, completed = ?
       WHERE id = ?;`,
      [
        updatedTask.updated_at,
        updatedTask.title,
        updatedTask.selected_emoji,
        updatedTask.reminder_relative_date,
        JSON.stringify(updatedTask.reminder_ids),
        updatedTask.due_date,
        updatedTask.description,
        updatedTask.completed ? 1 : 0,
        id,
      ]
    );

    return updatedTask;
  });
};

/**
 * Delete a task
 */
export const deleteTask = async (id: string): Promise<void> => {
  return withDatabaseRetry(async (db) => {
    await db.runAsync('DELETE FROM tasks WHERE id = ?;', [id]);
  });
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

// REMINDER OCCURRENCES CRUD Operations

export const createReminderOccurrence = async (reminderOccurrence: Omit<ReminderOccurrence, 'id' | 'created_at' | 'updated_at'>): Promise<ReminderOccurrence> => {
  return withDatabaseRetry(async (db) => {
    const now = new Date().toISOString();
    const newReminderOccurrence: ReminderOccurrence = {
      ...reminderOccurrence,
      id: generateUUID(),
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO reminderOccurrences (id, reminder_id, habit_id, task_id, title, description, status, scheduled_for, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newReminderOccurrence.id,
        newReminderOccurrence.reminder_id,
        newReminderOccurrence.habit_id,
        newReminderOccurrence.task_id,
        newReminderOccurrence.title,
        newReminderOccurrence.description || null,
        newReminderOccurrence.status,
        newReminderOccurrence.scheduled_for,
        newReminderOccurrence.created_at,
        newReminderOccurrence.updated_at,
      ]
    );

    return newReminderOccurrence;
  });
};

export const getReminderOccurrencesByDate = async (date: string): Promise<ReminderOccurrence[]> => {
  return withDatabaseRetry(async (db) => {
    const reminderOccurrences = await db.getAllAsync<ReminderOccurrence>('SELECT * FROM reminderOccurrences WHERE scheduled_for = ?;', [date]);
    return reminderOccurrences;
  });
};

export const getPendingReminderOccurrencesByHabitId = async (habitId: string): Promise<ReminderOccurrence[]> => {
  return withDatabaseRetry(async (db) => {
    const reminderOccurrences = await db.getAllAsync<ReminderOccurrence>('SELECT * FROM reminderOccurrences WHERE habit_id = ? AND status = ?;', [habitId, 'pending']);
    return reminderOccurrences;
  });
};

export const updateReminderOccurrence = async (id: string, updates: Partial<Omit<ReminderOccurrence, 'id' | 'created_at' | 'updated_at'>>): Promise<ReminderOccurrence> => {
  return withDatabaseRetry(async (db) => {
    const now = new Date().toISOString();
    const existingReminderOccurrence = await db.getFirstAsync<ReminderOccurrence>('SELECT * FROM reminderOccurrences WHERE id = ?;', [id]);

  if (!existingReminderOccurrence) {
    throw new Error('Reminder occurrence not found');
  }

  const updatedReminderOccurrence = {
    ...existingReminderOccurrence,
    ...updates,
    habit_id: existingReminderOccurrence.habit_id,
    task_id: existingReminderOccurrence.task_id,
    updated_at: now,
  };

  await db.runAsync(
    `UPDATE reminderOccurrences 
     SET updated_at = ?, status = ?
     WHERE id = ?;`,
    [updatedReminderOccurrence.updated_at, updatedReminderOccurrence.status, id]
  );

  return updatedReminderOccurrence;
  });
};

export const deleteReminderOccurrence = async (id: string): Promise<void> => {
  return withDatabaseRetry(async (db) => {
    await db.runAsync('DELETE FROM reminderOccurrences WHERE id = ?;', [id]);
  });
};

export const deleteReminderOccurrencesByHabitId = async (habitId: string): Promise<void> => {
  return withDatabaseRetry(async (db) => {
    await db.runAsync('DELETE FROM reminderOccurrences WHERE habit_id = ?;', [habitId]);
  });
};

export const deleteReminderOccurrencesByTaskId = async (taskId: string): Promise<void> => {
  return withDatabaseRetry(async (db) => {
    await db.runAsync('DELETE FROM reminderOccurrences WHERE task_id = ?;', [taskId]);
  });
};

/**
 * Delete reminder occurrences for a habit by day
 * - Only deletes pending reminder occurrences
 * @param habitId - The ID of the habit
 * @param day - The day to delete reminder occurrences for
 * @returns void
 */
export const deleteReminderOccurencesForHabitByDay = async (habitId: string, day: string): Promise<void> => {
  return withDatabaseRetry(async (db) => {
    await db.runAsync('DELETE FROM reminderOccurrences WHERE habit_id = ? AND scheduled_for_day = ? AND status = ?;', [habitId, day, 'pending']);
  });
};

export const deleteAllReminderOccurrences = async (): Promise<void> => {
  return withDatabaseRetry(async (db) => {
    await db.runAsync('DELETE FROM reminderOccurrences;');
  });
};

/**
 * Reset the entire database by dropping all tables and reinitializing
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    console.log('Dropping all tables and resetting database...');

    if (Platform.OS === 'web') {
      // Web implementation - drop tables instead of deleting file
      const db = await getDatabase();
      await db.execAsync(`
        DROP TABLE IF EXISTS tasks;
        DROP TABLE IF EXISTS habits;
        DROP TABLE IF EXISTS goals;
        DROP TABLE IF EXISTS premadeGoals;
        DROP TABLE IF EXISTS premadeTasks;
        DROP TABLE IF EXISTS premadeHabits;
        DROP TABLE IF EXISTS reminderOccurrences;
      `);
      // Close after dropping tables
      await closeDatabase();
    } else {
      // Native implementation - close database first, then delete file
      await closeDatabase();

      // Add a small delay to ensure the database is fully closed
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        await SQLite.deleteDatabaseAsync(DATABASE_NAME);
        console.log('Database file deleted successfully');
      } catch (deleteError) {
        console.warn('Database deletion failed, falling back to table dropping:', deleteError);
        // Fallback: reopen and drop tables if deletion fails
        dbInstance = null;
        const db = await getDatabase();
        await db.execAsync(`
          DROP TABLE IF EXISTS tasks;
          DROP TABLE IF EXISTS habits;
          DROP TABLE IF EXISTS goals;
          DROP TABLE IF EXISTS premadeGoals;
          DROP TABLE IF EXISTS premadeTasks;
          DROP TABLE IF EXISTS premadeHabits;
          DROP TABLE IF EXISTS reminderOccurrences;
        `);
        await closeDatabase();
      }
    }

    // Reset the instance and reinitialize
    dbInstance = null;
    await initDatabase();

    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};

// PREMADE GOALS Functions

/**
 * Get all premade goals
 */
export const getPremadeGoals = async (page = 1, limit = 20): Promise<{ goals: Goal[], total: number }> => {
  try {
    const db = await getDatabase();
    const offset = (page - 1) * limit;

    const goals = await db.getAllAsync<Goal>(
      'SELECT * FROM premadeGoals ORDER BY title ASC LIMIT ? OFFSET ?;',
      [limit, offset]
    );

    const total = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM premadeGoals;'
    );

    return {
      goals: goals.map(goal => ({ ...goal, achieved: Boolean(goal.achieved) })),
      total: total?.count || 0
    };
  } catch (error) {
    console.error('Error getting premade goals:', error);
    return { goals: [], total: 0 };
  }
};

/**
 * Get a premade goal by its ID
 */
export const getPremadeGoalById = async (id: string): Promise<Goal | null> => {
  return withDatabaseRetry(async (db) => {
    const goal = await db.getFirstAsync<Goal>('SELECT * FROM premadeGoals WHERE id = ?;', [id]);

    if (!goal) {
      return null;
    }

    return {
      ...goal,
      achieved: Boolean(goal.achieved),
    };
  });
};

/**
 * Add a premade goal to the user's goals
 */
// export const addPremadeGoalToUserGoals = async (premadeGoalId: string): Promise<Goal | null> => {
//   try {
//     // Get the premade goal
//     const premadeGoal = await getPremadeGoalById(premadeGoalId);

//     if (!premadeGoal) {
//       throw new Error('Premade goal not found');
//     }

//     // Create a new goal based on the premade goal
//     const newGoal: Omit<Goal, 'id' | 'created_at' | 'updated_at'> = {
//       title: premadeGoal.title,
//       category: premadeGoal.category,
//       due_date: null, // Reset the due date for the user to set
//       achieved: false,
//       image_small: premadeGoal.image_small,
//       image_large: premadeGoal.image_large,
//     };

//     // Add to user goals
//     return await createGoal(newGoal);
//   } catch (error) {
//     console.error(`Error adding premade goal with ID ${premadeGoalId} to user goals:`, error);
//     return null;
//   }
// };

// PREMADE TASKS Functions

/**
 * Get all premade tasks
 */
export const getPremadeTasks = async (page = 1, limit = 20): Promise<{ tasks: Task[], total: number }> => {
  try {
    const db = await getDatabase();
    const offset = (page - 1) * limit;

    const tasks = await db.getAllAsync<Task>(
      'SELECT * FROM premadeTasks ORDER BY title ASC LIMIT ? OFFSET ?;',
      [limit, offset]
    );

    const total = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM premadeTasks;'
    );

    return {
      tasks: tasks.map(task => ({ ...task, completed: Boolean(task.completed) })),
      total: total?.count || 0
    };
  } catch (error) {
    console.error('Error getting premade tasks:', error);
    return { tasks: [], total: 0 };
  }
};

/**
 * Get all premade tasks for an array of goal IDs
 * @param goalIds Array of goal IDs to fetch tasks for
 * @param batchSize Optional batch size for processing large arrays (default 500)
 * @returns Promise<Task[]> Array of tasks
 */
export const getPremadeTasksForGoalIds = async (
  goalIds: string[],
  batchSize: number = 500
): Promise<Task[]> => {
  return withDatabaseRetry(async (db) => {
    // Input validation
    if (!Array.isArray(goalIds) || goalIds.length === 0) {
      return [];
    }

    let allTasks: Task[] = [];

    // Process in batches if the array is large
    for (let i = 0; i < goalIds.length; i += batchSize) {
      const batchIds = goalIds.slice(i, i + batchSize);

      const query = `
        SELECT * FROM premadeTasks 
        WHERE goal_id IN (${batchIds.map(() => '?').join(',')}) 
        ORDER BY title ASC;
      `;

      const batchTasks = await db.getAllAsync<Task>(query, batchIds);
      allTasks = allTasks.concat(
        batchTasks.map(task => ({ ...task, completed: Boolean(task.completed) }))
      );
    }

    return allTasks;
  });
};

/**
 * Get a premade task by its ID
 */
export const getPremadeTaskById = async (id: string): Promise<Task | null> => {
  return withDatabaseRetry(async (db) => {
    const task = await db.getFirstAsync<Task>('SELECT * FROM premadeTasks WHERE id = ?;', [id]);

    if (!task) {
      return null;
    }

    return {
      ...task,
      completed: Boolean(task.completed),
    };
  });
};

// PREMADE HABITS Functions

/**
 * Get all premade habits for an array of goal IDs
 * @param goalIds Array of goal IDs to fetch habits for
 * @param batchSize Optional batch size for processing large arrays (default 500)
 * @returns Promise<Habit[]> Array of habits
 */
export const getPremadeHabitsForGoalIds = async (
  goalIds: string[],
  batchSize: number = 500
): Promise<Habit[]> => {
  return withDatabaseRetry(async (db) => {
    // Input validation
    if (!Array.isArray(goalIds) || goalIds.length === 0) {
      return [];
    }

    let allHabits: Habit[] = [];

    // Process in batches if the array is large
    for (let i = 0; i < goalIds.length; i += batchSize) {
      const batchIds = goalIds.slice(i, i + batchSize);

      const query = `
        SELECT * FROM premadeHabits 
        WHERE goal_id IN (${batchIds.map(() => '?').join(',')}) 
        ORDER BY title ASC;
      `;

      const batchHabits = await db.getAllAsync<ConvertArraysToJSON<Habit>>(query, batchIds);
      allHabits = allHabits.concat(
        batchHabits.map(habit => ({ ...habit, completed: Boolean(habit.completed), reminder_days: JSON.parse(habit.reminder_days || '[]'), reminder_ids: JSON.parse(habit.reminder_ids || '[]') }))
      );
    }

    return allHabits;
  });
};

// DEVELOPMENT UTILITY FUNCTIONS

/**
 * Generate a large number of test premade goals for development purposes
 * This is useful for testing how the app handles a large number of goals
 */
export const generateTestPremadeGoals = async (count: number = 100): Promise<void> => {
  try {
    const db = await getDatabase();
    console.log(`Generating ${count} test premade goals...`);

    // Generate categories for test data
    const categories = [
      'Career Development',
      'Education',
      'Financial',
      'Health & Fitness',
      'Personal Growth',
      'Relationships',
      'Creativity',
      'Travel',
      'Other'
    ];

    const now = new Date().toISOString();
    const BATCH_SIZE = 50;
    let totalInserted = 0;

    // Process in batches
    for (let i = 0; i < count; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, count - i);
      const valueGroups: string[] = [];
      const params: any[] = [];

      for (let j = 0; j < batchSize; j++) {
        const goalId = generateUUID();
        const categoryIndex = Math.floor(Math.random() * categories.length);

        valueGroups.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');
        params.push(
          goalId,
          now,
          now,
          `Test Goal #${i + j + 1}`,
          categories[categoryIndex],
          null,
          0,
          null,
          null
        );
      }

      // Execute the batch insert
      const query = `
        INSERT INTO premadeGoals (id, created_at, updated_at, title, category, due_date, achieved, image_small, image_large)
        VALUES ${valueGroups.join(', ')};
      `;

      await db.runAsync(query, params);
      totalInserted += batchSize;
      console.log(`Inserted batch of ${batchSize} goals. Total: ${totalInserted}/${count}`);
    }

    console.log(`Successfully generated ${totalInserted} test premade goals`);
  } catch (error) {
    console.error('Error generating test premade goals:', error);
    throw error;
  }
};

// Export the database access function
export const db = { getDatabase }; 