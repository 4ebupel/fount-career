import { Alert, Platform } from 'react-native';
import { initDatabase, isDatabaseInitialized } from './database';
import { ReminderRelativeTimeType } from '@/types/database';

// Function to check if the database is initialized and initialize it if needed
export const ensureDatabaseInitialized = async (): Promise<boolean> => {
  try {
    const isInitialized = await isDatabaseInitialized();
    
    if (!isInitialized) {
      console.log('Database not initialized. Initializing now...');
      await initDatabase();
      return true;
    }
    
    return isInitialized;
  } catch (error) {
    console.error('Error initializing database:', error);
    
    // Show an alert on error if not in web environment
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Database Error',
        'There was an error initializing the database. Please restart the application.',
        [{ text: 'OK' }]
      );
    }
    
    return false;
  }
};

// Helper function to check if a value is a boolean stored as a number (0 or 1)
export const isBooleanAsNumber = (value: any): boolean => {
  return value === 0 || value === 1;
};

// Convert SQLite boolean (0/1) to JavaScript boolean
export const toBoolean = (value: number | boolean): boolean => {
  if (typeof value === 'boolean') return value;
  return value === 1;
};

// Parse a date string from SQLite
export const parseDate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  return new Date(dateString);
};

// Format a date to ISO string for SQLite storage
export const formatDateForStorage = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString();
};

// Parse a JSON string from SQLite
export const parseJSON = <T>(jsonString: string | null): T | null => {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON from database:', error);
    return null;
  }
};

// Format a value to JSON string for SQLite storage
export const formatJSONForStorage = <T>(value: T | null): string | null => {
  if (value === null || value === undefined) return null;
  return JSON.stringify(value);
};

// Reminder time validation and utilities
export type ReminderTime = string; // Format: HH:MM (24-hour)

// Validate reminder time format (HH:MM in 24-hour format)
export const isValidReminderTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const isValidRelativeReminderTime = (value: string): value is ReminderRelativeTimeType => {
  return ['Never', 'Two weeks before the deadline', 'One week before the deadline', 'Two days before the deadline', 'One day before the deadline', 'On the deadline'].includes(value);
};

// Format reminder time to ensure consistent HH:MM format
export const formatReminderTime = (time: string): ReminderTime | null => {
  if (isValidReminderTime(time)) return time;
  
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};