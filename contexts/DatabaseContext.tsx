import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Goal, Habit, Task } from '../types/database';
import * as DB from '../lib/database';

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
  createGoal: typeof DB.createGoal;
  getGoals: typeof DB.getGoals;
  getGoalById: typeof DB.getGoalById;
  updateGoal: typeof DB.updateGoal;
  deleteGoal: typeof DB.deleteGoal;
  // Habit operations
  createHabit: typeof DB.createHabit;
  getHabitsByGoalId: typeof DB.getHabitsByGoalId;
  updateHabit: typeof DB.updateHabit;
  deleteHabit: (id: string, goal_id: string) => Promise<void>;
  // Task operations
  createTask: typeof DB.createTask;
  getTasksByGoalId: typeof DB.getTasksByGoalId;
  updateTask: typeof DB.updateTask;
  deleteTask: (id: string, goal_id: string) => Promise<void>;
  // Refresh data
  refreshData: () => Promise<void>;
  clearError: () => void;
}

// Create the context with default values
const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

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

  // Initialize the database
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

  // Refresh all data
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
  const createGoalWithRefresh = async (goal: Parameters<typeof DB.createGoal>[0]) => {
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

  const updateGoalWithRefresh = async (id: string, updates: Parameters<typeof DB.updateGoal>[1]) => {
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

  const createHabitWithRefresh = async (habit: Parameters<typeof DB.createHabit>[0]) => {
    try {
      clearError();
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

  const updateHabitWithRefresh = async (id: string, updates: Parameters<typeof DB.updateHabit>[1]) => {
    try {
      clearError();
      // Explicitly remove goal_id from updates to prevent accidental modifications
      const { goal_id, ...safeUpdates } = updates;

      const updatedHabit = await DB.updateHabit(id, safeUpdates);

      // Update local state with direct access to goal_id
      setHabits(prevHabits => ({
        ...prevHabits,
        [updatedHabit.goal_id]: prevHabits[updatedHabit.goal_id].map(h =>
          h.id === id ? updatedHabit : h
        )
      }));

      return updatedHabit;
    } catch (error) {
      handleError(error, 'updating habit');
      throw error;
    }
  };

  const deleteHabitWithRefresh = async (id: string, goal_id: string) => {
    try {
      clearError();
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

  const createTaskWithRefresh = async (task: Parameters<typeof DB.createTask>[0]) => {
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

  const updateTaskWithRefresh = async (id: string, updates: Parameters<typeof DB.updateTask>[1]) => {
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

  const deleteTaskWithRefresh = async (id: string, goal_id: string) => {
    try {
      clearError();
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
    // Habit operations
    createHabit: createHabitWithRefresh,
    getHabitsByGoalId: DB.getHabitsByGoalId,
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

// Custom hook to use the database context
export const useDatabase = () => {
  const context = useContext(DatabaseContext);

  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }

  return context;
}; 