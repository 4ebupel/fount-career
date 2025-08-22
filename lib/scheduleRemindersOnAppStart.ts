import { createReminderOccurrence, getHabits, getReminderOccurrencesByHabitId } from "./database";
import * as Notifications from "expo-notifications";

const bodies = [
    'Hey, do not forget to complete your habit!',
    'The deadline is calling. Will you pick up?',
    'Time to complete your habit!',
];

/**
 * @async
 * @description Schedule reminders on app start for the next 14 days for all habits that have reminders
 * -
 *  - Get all reminder occurrences for each habit
 *  - Sort the reminder occurrences by date
 *  - Calculate the number of reminders needed for each habit
 *  - Schedule the reminders for the next 14 days
 *  - Create a reminder occurrence for each reminder
 *  - Create a notification for each reminder
 * @returns void
 */
export const scheduleRemindersOnAppStart = async () => {
    try {
        const habits = await getHabits();
        for (const habit of habits) {
            const reminderOccurrences = await getReminderOccurrencesByHabitId(habit.id);
            const occurrenceSortedByDate = [...reminderOccurrences].sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
            const remindersAvailable = occurrenceSortedByDate.length || 0;
            let remindersNeeded = habit.reminder_days.length * 14 - remindersAvailable;
            let nextReminderDate = occurrenceSortedByDate.length > 0 ? new Date(occurrenceSortedByDate[occurrenceSortedByDate.length - 1].scheduled_for) : new Date();
            nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);

            while (remindersNeeded > 0) {
                try {
                    const notificationId = await Notifications.scheduleNotificationAsync({
                        content: {
                            title: habit.title,
                            body: bodies[Math.floor(Math.random() * bodies.length)],
                        },
                        trigger: {
                            type: Notifications.SchedulableTriggerInputTypes.DATE,
                            date: nextReminderDate,
                        },
                    });

                    await createReminderOccurrence({
                        habit_id: habit.id,
                        scheduled_for: nextReminderDate.toISOString(),
                        reminder_id: notificationId,
                        task_id: null,
                        title: habit.title,
                        description: bodies[Math.floor(Math.random() * bodies.length)],
                        status: 'pending',
                    });
                } catch (error) {
                    console.error(`Error scheduling reminder for habit ${habit.title} on ${nextReminderDate.toISOString()}:`, error);
                    continue;
                }

                remindersNeeded--;
                nextReminderDate.setDate(nextReminderDate.getDate() + 1);
                nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
            }
        }
    } catch (error) {
        console.error(error);
    }
};
