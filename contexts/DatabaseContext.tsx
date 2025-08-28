import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Goal, Habit, Task } from '../types/database';
import * as DB from '../lib/database';
import { formatReminderTime, isValidReminderTime } from '../lib/database-utils';
import * as Notifications from 'expo-notifications';
import { scheduleWeeklyReminders } from '@/lib/scheduleWeeklyReminders';
import { scheduleRemindersForNWeeks } from '@/lib/scheduleRemindersForNWeeks';
import { getPendingReminderOccurrencesByHabitId } from '../lib/database';

// Define the context type
interface DatabaseContextType {
  isLoading: boolean;
  isInitialized: boolean;
  hasError: boolean;
  errorMessage: string | null;
  initializeDatabase: () => Promise<void>;
  goals: Goal[];
  habits: Record<string, Habit[]>;
  tasks: Record<string, Task[]>;
  // Goal operations
  /**
   * Create a new goal
   */
  createGoal: typeof DB.createGoal;
  /**
   * Get all goals
   */
  getGoals: typeof DB.getGoals;
  /**
   * Get a goal by id
   */
  getGoalById: typeof DB.getGoalById;
  /**
   * Update a goal
   */
  updateGoal: typeof DB.updateGoal;
  /**
   * Delete a goal
   */
  deleteGoal: typeof DB.deleteGoal;

  // Premade goal operations
  /**
   * Get all premade goals
   */
  getPremadeGoals: typeof DB.getPremadeGoals;
  /**
   * Get a premade goal by id
   */
  getPremadeGoalById: typeof DB.getPremadeGoalById;
  /**
   * Add a premade goal to user goals
   */
  addPremadeGoalToUserGoals: (premadeGoalId: string) => Promise<void>;

  // Premade task operations
  /**
   * Get all premade tasks
   */
  getPremadeTasks: typeof DB.getPremadeTasks;
  /**
   * Get all premade tasks for an array of goal IDs
   */
  getPremadeTasksForGoalIds: typeof DB.getPremadeTasksForGoalIds;
  /**
   * Get a premade task by id
   */
  getPremadeTaskById: typeof DB.getPremadeTaskById;
  // Premade habit operations
  /**
   * Get all premade habits for an array of goal IDs
   */
  getPremadeHabitsForGoalIds: typeof DB.getPremadeHabitsForGoalIds;
  // Habit operations
  /**
   * Create a new habit
   */
  createHabit: typeof DB.createHabit;
  /**
   * Get habits by goal id
   */
  getHabitsByGoalId: typeof DB.getHabitsByGoalId;
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
  getHabitById: typeof DB.getHabitById;
  /**
   * Update a habit
   */
  updateHabit: typeof DB.updateHabit;
  /**
   * Delete a habit
   */
  deleteHabit: (id: string, goal_id: string) => Promise<void>;
  // Task operations
  /**
   * Create a new task
   */
  createTask: typeof DB.createTask;
  /**
   * Get tasks by goal id
   */
  getTasksByGoalId: typeof DB.getTasksByGoalId;
  /**
   * Update a task
   */
  updateTask: typeof DB.updateTask;
  /**
   * Delete a task
   */
  deleteTask: (id: string, goal_id: string) => Promise<void>;
  // Refresh data
  refreshData: () => Promise<void>;
  clearError: () => void;
}

// Create the context with default values
export const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Provider props type
interface DatabaseProviderProps {
  children: ReactNode;
}

// Database provider component
export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Record<string, Habit[]>>({});
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});

  // Clear any database errors
  const clearError = () => {
    setHasError(false);
    setErrorMessage(null);
  };

  // Handle database errors
  const handleError = (error: any, context: string) => {
    console.error(`Database error in ${context}:`, error);
    const message = error?.message || `An error occurred while ${context}`;
    setHasError(true);
    setErrorMessage(message);

    // Show an alert for critical errors
    if (context === 'initializing database') {
      Alert.alert(
        'Database Error',
        `Could not initialize the database. ${message}`,
        [{ text: 'OK' }]
      );
    }
  };
  /**
   * Initialize the database
   */
  const initializeDatabase = async () => {
    try {
      setIsLoading(true);
      clearError();

      const isDbInitialized = await DB.isDatabaseInitialized();

      if (!isDbInitialized) {
        console.log('Database not initialized, creating tables...');
        await DB.initDatabase();
      } else {
        console.log('Database already initialized');
      }

      setIsInitialized(true);
      await refreshData();
    } catch (error) {
      handleError(error, 'initializing database');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh all data
   */
  const refreshData = async () => {
    try {
      setIsLoading(true);
      clearError();

      // Get all goals
      console.log('Fetching goals from database...');
      const fetchedGoals = await DB.getGoals();
      setGoals(fetchedGoals);

      // Get habits and tasks for each goal
      const habitsMap: Record<string, Habit[]> = {};
      const tasksMap: Record<string, Task[]> = {};

      if (fetchedGoals.length > 0) {
        console.log(`Fetching habits and tasks for ${fetchedGoals.length} goals...`);

        // Process goals sequentially to avoid potential database locks
        for (const goal of fetchedGoals) {
          try {
            const [goalHabits, goalTasks] = await Promise.all([
              DB.getHabitsByGoalId(goal.id),
              DB.getTasksByGoalId(goal.id)
            ]);

            habitsMap[goal.id] = goalHabits;
            tasksMap[goal.id] = goalTasks;
          } catch (error) {
            console.error(`Error fetching data for goal ${goal.id}:`, error);
            // Continue with other goals even if one fails
            habitsMap[goal.id] = [];
            tasksMap[goal.id] = [];
          }
        }
      }

      setHabits(habitsMap);
      setTasks(tasksMap);
    } catch (error) {
      handleError(error, 'refreshing data');
    } finally {
      setIsLoading(false);
    }
  };

  // Wrap database operations to update state after changes
  /**
  * Create a new goal and update local state
  */
  const createGoalWithRefresh = async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      clearError();
      const newGoal = await DB.createGoal(goal);

      // Update local state
      setGoals(prevGoals => [newGoal, ...prevGoals]);
      setHabits(prevHabits => ({ ...prevHabits, [newGoal.id]: [] }));
      setTasks(prevTasks => ({ ...prevTasks, [newGoal.id]: [] }));

      return newGoal;
    } catch (error) {
      handleError(error, 'creating goal');
      throw error;
    }
  };

  /**
   * Update a goal and update local state
   */
  const updateGoalWithRefresh = async (id: string, updates: Partial<Omit<Goal, 'id' | 'created_at'>>) => {
    try {
      clearError();
      const updatedGoal = await DB.updateGoal(id, updates);

      // Update local state
      setGoals(prevGoals =>
        prevGoals.map(goal => goal.id === id ? updatedGoal : goal)
      );

      return updatedGoal;
    } catch (error) {
      handleError(error, 'updating goal');
      throw error;
    }
  };

  /**
   * Delete a goal and update local state
   */
  const deleteGoalWithRefresh = async (id: string) => {
    try {
      clearError();
      await DB.deleteGoal(id);

      // Update local state
      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
      setHabits(prevHabits => {
        const newHabits = { ...prevHabits };
        delete newHabits[id];
        return newHabits;
      });
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        delete newTasks[id];
        return newTasks;
      });
    } catch (error) {
      handleError(error, 'deleting goal');
      throw error;
    }
  };

  /**
   * Create a new habit and update local state
   */
  const createHabitWithRefresh = async (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      clearError();

      // Ensure we have valid habit to process
      if (Object.keys(habit).length === 0) {
        throw new Error('No valid habit provided');
      }

      if (habit.reminder_time) {
        const isValidTime = isValidReminderTime(habit.reminder_time);
        if (!isValidTime) {
          const formattedTime = formatReminderTime(habit.reminder_time);
          habit.reminder_time = formattedTime || '';
        }
      }
      const newHabit = await DB.createHabit(habit);

      // Update local state
      setHabits(prevHabits => {
        const goalHabits = prevHabits[habit.goal_id] || [];
        return {
          ...prevHabits,
          [habit.goal_id]: [newHabit, ...goalHabits],
        };
      });

      return newHabit;
    } catch (error) {
      handleError(error, 'creating habit');
      throw error;
    }
  };

  /**
   * Update a habit and update local state
   */
  const updateHabitWithRefresh = async (id: string, updates: Partial<Omit<Habit, 'id' | 'created_at'>>) => {
    try {
      console.log('updateHabitWithRefresh start', id, updates);
      clearError();
      // Explicitly remove goal_id from updates to prevent accidental modifications
      const { goal_id, ...safeUpdates } = updates;

      // Ensure we have valid updates to process
      if (Object.keys(safeUpdates).length === 0) {
        throw new Error('No valid updates provided');
      }

      if (safeUpdates.reminder_time) {
        const isValidTime = isValidReminderTime(safeUpdates.reminder_time);
        if (!isValidTime) {
          const formattedTime = formatReminderTime(safeUpdates.reminder_time);
          safeUpdates.reminder_time = formattedTime || undefined;
        }
      }

      const updatedHabit = await DB.updateHabit(id, safeUpdates);
      // Update local state with direct access to goal_id
      setHabits(prevHabits => ({
        ...prevHabits,
        [updatedHabit.goal_id]: prevHabits[updatedHabit.goal_id].map(h =>
          h.id === id ? updatedHabit : h
        )
      }));
      console.log('updateHabitWithRefresh end', updatedHabit);

      return updatedHabit;
    } catch (error) {
      handleError(error, 'updating habit');
      throw error;
    }
  };

  /**
   * Delete a habit and update local state
   */
  const deleteHabitWithRefresh = async (id: string, goal_id: string) => {
    try {
      clearError();
      // Cancel all reminders for the habit before deleting it
      const habit = await DB.getHabitById(id);

      if (!habit) {
        throw new Error('Habit not found');
      }

      const reminders = await getPendingReminderOccurrencesByHabitId(id);
      console.log('Reminders to remove', reminders.length);
      for (const reminder of reminders) {
        await Notifications.cancelScheduledNotificationAsync(reminder.id);
      }

      await DB.deleteHabit(id);

      // Update local state using provided goal_id
      setHabits(prevHabits => ({
        ...prevHabits,
        [goal_id]: prevHabits[goal_id].filter(h => h.id !== id)
      }));
    } catch (error) {
      handleError(error, 'deleting habit');
      throw error;
    }
  };

  /**
   * Create a new task and update local state
   */
  const createTaskWithRefresh = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed'>) => {
    try {
      clearError();
      const newTask = await DB.createTask(task);

      // Update local state
      setTasks(prevTasks => {
        const goalTasks = prevTasks[task.goal_id] || [];
        return {
          ...prevTasks,
          [task.goal_id]: [newTask, ...goalTasks],
        };
      });

      return newTask;
    } catch (error) {
      handleError(error, 'creating task');
      throw error;
    }
  };

  /**
   * Update a task and update local state
   */
  const updateTaskWithRefresh = async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>) => {
    try {
      clearError();
      // Explicitly remove goal_id from updates
      const { goal_id, ...safeUpdates } = updates;
      const updatedTask = await DB.updateTask(id, safeUpdates);

      // Update local state using goal_id from the response
      setTasks(prevTasks => ({
        ...prevTasks,
        [updatedTask.goal_id]: prevTasks[updatedTask.goal_id].map(t =>
          t.id === id ? updatedTask : t
        )
      }));

      return updatedTask;
    } catch (error) {
      handleError(error, 'updating task');
      throw error;
    }
  };

  /**
   * Delete a task and update local state
   */
  const deleteTaskWithRefresh = async (id: string, goal_id: string) => {
    try {
      clearError();
      const task = await DB.getTaskById(id);

      if (task?.reminder_ids?.length) {
        for (const reminder of task.reminder_ids) {
          await Notifications.cancelScheduledNotificationAsync(reminder);
          console.log('Reminder cancelled:', reminder);
        }
      }
      await DB.deleteTask(id);

      // Update local state using provided goal_id
      setTasks(prevTasks => ({
        ...prevTasks,
        [goal_id]: prevTasks[goal_id].filter(t => t.id !== id)
      }));
    } catch (error) {
      handleError(error, 'deleting task');
      throw error;
    }
  };

  const addPremadeGoalToUserGoals = async (premadeGoalId: string) => {
    try {
      const premadeGoal = await DB.getPremadeGoalById(premadeGoalId);
      const tasks = await DB.getPremadeTasksForGoalIds([premadeGoalId]);
      const habits = await DB.getPremadeHabitsForGoalIds([premadeGoalId]);
      let newGoal: Goal | null = null;
      // Create goal
      if (premadeGoal) {
        newGoal = await DB.createGoal(premadeGoal);
      }
      // Create tasks
      if (tasks.length > 0 && newGoal) {
        for (const task of tasks) {
          const newTask = await DB.createTask({ ...task, goal_id: newGoal.id });
          console.log('New task created:', newTask);
        }
      }
      // Create habits
      if (habits.length > 0 && newGoal) {
        for (const habit of habits) {
          // let ids: string[] = [];

          // // Schedule reminders
          // if (habit.reminder_time) {
          //   const reminderDays = habit.reminder_days;

          //   ids = await scheduleWeeklyReminders({
          //     title: habit.title,
          //     reminderTime: habit.reminder_time,
          //     reminderDays,
          //   });
          //   console.log('Reminder scheduled:', ids);
          // }

          const newHabit = await DB.createHabit(
            {
              ...habit,
              goal_id: newGoal.id,
              reminder_ids: []
            }
          );

          scheduleRemindersForNWeeks(2, newHabit);

          console.log('New habit created:', newHabit);
        }

      }

      // Refresh data
      await refreshData();
    } catch (error) {
      handleError(error, 'adding premade goal to user goals');
    }
  };

  // Check if database is initialized on component mount
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        setIsLoading(true);
        clearError();

        const isDbInitialized = await DB.isDatabaseInitialized();
        console.log('Database initialization check:', isDbInitialized ? 'Already initialized' : 'Needs initialization');

        if (isDbInitialized) {
          setIsInitialized(true);
          await refreshData();
        }
      } catch (error) {
        handleError(error, 'checking database');
      } finally {
        setIsLoading(false);
      }
    };

    checkDatabase();

    // Clean up database resources when component unmounts
    return () => {
      DB.closeDatabase().catch(error => console.error('Error closing database:', error));
    };
  }, []);

  const contextValue: DatabaseContextType = {
    isLoading,
    isInitialized,
    hasError,
    errorMessage,
    initializeDatabase,
    goals,
    habits,
    tasks,
    // Goal operations
    createGoal: createGoalWithRefresh,
    getGoals: DB.getGoals,
    getGoalById: DB.getGoalById,
    updateGoal: updateGoalWithRefresh,
    deleteGoal: deleteGoalWithRefresh,
    // Premade goal operations
    getPremadeGoals: DB.getPremadeGoals,
    getPremadeGoalById: DB.getPremadeGoalById,
    addPremadeGoalToUserGoals: addPremadeGoalToUserGoals,
    // Premade task operations
    getPremadeTasks: DB.getPremadeTasks,
    getPremadeTasksForGoalIds: DB.getPremadeTasksForGoalIds,
    getPremadeTaskById: DB.getPremadeTaskById,
    // Premade habit operations
    getPremadeHabitsForGoalIds: DB.getPremadeHabitsForGoalIds,
    // Habit operations
    createHabit: createHabitWithRefresh,
    getHabitsByGoalId: DB.getHabitsByGoalId,
    getHabitById: DB.getHabitById,
    updateHabit: updateHabitWithRefresh,
    deleteHabit: deleteHabitWithRefresh,
    // Task operations
    createTask: createTaskWithRefresh,
    getTasksByGoalId: DB.getTasksByGoalId,
    updateTask: updateTaskWithRefresh,
    deleteTask: deleteTaskWithRefresh,
    // Refresh data
    refreshData,
    clearError,
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};