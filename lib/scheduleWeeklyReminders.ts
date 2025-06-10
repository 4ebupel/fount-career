import * as Notifications from "expo-notifications";

export enum WeekdaysInNumbers {
    Sunday = 1,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday
}

/**
 * Schedule weekly reminders;
 * @param title - The title of the reminder
 * @param body - The body of the reminder (optional)
 * @param reminderTime - The time of the reminder
 * @param reminderDays - The days of the week to schedule the reminder for
 * 
 * @returns - The ids of the scheduled notifications
 */

export const scheduleWeeklyReminders = async ({
    title,
    body = 'Hey, do not forget to complete your habit!',
    reminderTime,
    reminderDays,
}: {
    title: string;
    body?: string;
    reminderTime: string;
    reminderDays: string[];
}): Promise<string[]> => {
    const notificationIds: string[] = [];
    const reminderHour = +reminderTime.split(':')[0];
    const reminderMinute = +reminderTime.split(':')[1];
    const weekdays = reminderDays.map((day) => WeekdaysInNumbers[day as keyof typeof WeekdaysInNumbers]);

    for (const  weekday of weekdays) {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
            },
            trigger: {
                weekday,
                hour: reminderHour,
                minute: reminderMinute,
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                // repeats: true,
            },
        });
        notificationIds.push(id);
    }

    return notificationIds;
}