import * as Notifications from 'expo-notifications';
import { getHabitById } from './database';
import { WeekdaysInNumbers } from './scheduleWeeklyReminders';
import { WeeklyTriggerInput } from 'expo-notifications/src/Notifications.types';

export const checkForExistingReminders = async (habitId: string) => {
    try {
        console.log('--------------------------------');
        console.log('Checking for existing reminders');
        const habit = await getHabitById(habitId);
        const habitReminderIds = habit?.reminder_ids ? JSON.parse(habit.reminder_ids) : [];
        console.log('Habit reminder ids', habitReminderIds);
        const existingReminders = await Notifications.getAllScheduledNotificationsAsync();
        console.log('Existing reminders', existingReminders.length);
        const existingHabitReminders = existingReminders.filter((reminder) => habitReminderIds.includes(reminder.identifier));
        const parsedReminderObjs = existingHabitReminders.map((reminder) => {
            const weekday = WeekdaysInNumbers[(reminder.trigger as WeeklyTriggerInput).weekday] as keyof typeof WeekdaysInNumbers;

            return {
                id: reminder.identifier,
                title: reminder.content.title,
                body: reminder.content.body,
                weekday
            }
        })
        console.log('Parsed reminder objects', parsedReminderObjs);
        return parsedReminderObjs;
    } catch (error) {
        console.error('Error checking for existing reminders', error);
        return [];
    } finally {
        console.log('--------------------------------');
        console.log('Finished checking for existing reminders');
        console.log('--------------------------------');
    }
}