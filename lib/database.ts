import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Goal, Habit, Task } from '../types/database';
import { premadeGoalsSeedData, premadeTasksSeedData, premadeHabitsSeedData } from './seedData';
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
        reminder_time TEXT,
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
        reminder_time TEXT,
        due_date TEXT,
        description TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
      );
    `);

    console.log('Database tables created successfully');

    // Check if premade goals need to be populated
    await populatePremadeGoals();
    await populatePremadeTasks();
    await populatePremadeHabits();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
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
          valueGroups.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');
          params.push(
            goalData.id,
            now,
            now,
            goalData.title,
            goalData.category,
            goalData.due_date,
            goalData.achieved ? 1 : 0,
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
          valueGroups.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');
          params.push(
            taskData.id,
            now,
            now,
            taskData.title,
            taskData.selected_emoji,
            taskData.reminder_time,
            taskData.due_date,
            taskData.description,
            taskData.completed ? 1 : 0,
            taskData.goal_id
          );
        }

        // Execute the batch insert
        const query = `
          INSERT INTO premadeTasks (id, created_at, updated_at, title, selected_emoji, reminder_time, due_date, description, completed, goal_id)
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
          valueGroups.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');
          params.push(
            habitData.id,
            now,
            now,
            habitData.title,
            habitData.selected_emoji,
            habitData.reminder_days,
            habitData.reminder_time,
            habitData.completed ? 1 : 0,
            habitData.goal_id
          );
        }

        // Execute the batch insert
        const query = `
          INSERT INTO premadeHabits (id, created_at, updated_at, title, selected_emoji, reminder_days, reminder_time, completed, goal_id)
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
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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
      achieved: Boolean(goal.achieved),
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
      achieved: Boolean(goal.achieved),
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
      `INSERT INTO habits (id, goal_id, created_at, updated_at, title, selected_emoji, reminder_days, reminder_time, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newHabit.id,
        newHabit.goal_id,
        newHabit.created_at,
        newHabit.updated_at,
        newHabit.title,
        newHabit.selected_emoji,
        newHabit.reminder_days,
        newHabit.reminder_time,
        0,
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
export const updateHabit = async (id: string, updates: Partial<Omit<Habit, 'id' | 'created_at'>>): Promise<Habit> => {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    // First check if habit exists and get its goal_id
    const existingHabit = await db.getFirstAsync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);

    if (!existingHabit) {
      throw new Error('Habit not found');
    }

    // Ensure goal_id cannot be changed even if provided in updates
    const updatedHabit = {
      ...existingHabit,
      ...updates,
      goal_id: existingHabit.goal_id, // Always keep the original goal_id
      updated_at: now,
    };

    await db.runAsync(
      `UPDATE habits 
       SET updated_at = ?, title = ?, selected_emoji = ?, reminder_days = ?, reminder_time = ?, completed = ?
       WHERE id = ?;`,
      [
        updatedHabit.updated_at,
        updatedHabit.title,
        updatedHabit.selected_emoji,
        updatedHabit.reminder_days,
        updatedHabit.reminder_time,
        updatedHabit.completed ? 1 : 0,
        id,
      ]
    );

    return updatedHabit; // Returns complete habit with goal_id
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
      completed: Boolean(task.completed),
    }));
  } catch (error) {
    console.error(`Error getting tasks for goal ID ${goalId}:`, error);
    return [];
  }
};

/**
 * Update a task
 */
export const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<Task> => {
  try {
    const db = await getDatabase();
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

    return updatedTask;
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

/**
 * Reset the entire database by dropping all tables and reinitializing
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    console.log('Dropping all tables and resetting database...');

    // First close the existing connection
    await closeDatabase();

    // For Expo SQLite, delete the database file
    if (Platform.OS === 'web') {
      // Web implementation
      const db = await getDatabase();
      await db.execAsync(`
        DROP TABLE IF EXISTS tasks;
        DROP TABLE IF EXISTS habits;
        DROP TABLE IF EXISTS goals;
        DROP TABLE IF EXISTS premadeGoals;
      `);
    } else {
      // Native implementation
      await SQLite.deleteDatabaseAsync(DATABASE_NAME);
    }

    // Reinitialize the database
    dbInstance = null; // Reset the instance
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
  try {
    const db = await getDatabase();
    const goal = await db.getFirstAsync<Goal>('SELECT * FROM premadeGoals WHERE id = ?;', [id]);

    if (!goal) {
      return null;
    }

    return {
      ...goal,
      achieved: Boolean(goal.achieved),
    };
  } catch (error) {
    console.error(`Error getting premade goal with ID ${id}:`, error);
    return null;
  }
};

/**
 * Add a premade goal to the user's goals
 */
export const addPremadeGoalToUserGoals = async (premadeGoalId: string): Promise<Goal | null> => {
  try {
    // Get the premade goal
    const premadeGoal = await getPremadeGoalById(premadeGoalId);

    if (!premadeGoal) {
      throw new Error('Premade goal not found');
    }

    // Create a new goal based on the premade goal
    const newGoal: Omit<Goal, 'id' | 'created_at' | 'updated_at'> = {
      title: premadeGoal.title,
      category: premadeGoal.category,
      due_date: null, // Reset the due date for the user to set
      achieved: false,
      image_small: premadeGoal.image_small,
      image_large: premadeGoal.image_large,
    };

    // Add to user goals
    return await createGoal(newGoal);
  } catch (error) {
    console.error(`Error adding premade goal with ID ${premadeGoalId} to user goals:`, error);
    return null;
  }
};

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
 * Get all premade tasks for an array of goal IDs with improved error handling and performance
 * @param goalIds Array of goal IDs to fetch tasks for
 * @param batchSize Optional batch size for processing large arrays (default 50)
 * @returns Promise<Task[]> Array of tasks
 */
export const getPremadeTasksForGoalIds = async (
  goalIds: string[], 
  batchSize: number = 50
): Promise<Task[]> => {
  try {
    // Input validation
    if (!Array.isArray(goalIds) || goalIds.length === 0) {
      return [];
    }

    const db = await getDatabase();
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

  } catch (error) {
    console.error(
      `Error getting premade tasks for goal IDs: ${goalIds.slice(0, 3).join(', ')}${goalIds.length > 3 ? '...' : ''}`,
      error
    );
    throw new Error(`Failed to fetch premade tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get a premade task by its ID
 */
export const getPremadeTaskById = async (id: string): Promise<Task | null> => {
  try {
    const db = await getDatabase();
    const task = await db.getFirstAsync<Task>('SELECT * FROM premadeTasks WHERE id = ?;', [id]);

    if (!task) {
      return null;
    }

    return {
      ...task,
      completed: Boolean(task.completed),
    };
  } catch (error) {
    console.error(`Error getting premade task with ID ${id}:`, error);
    return null;
  }
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