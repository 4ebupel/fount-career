import * as Notifications from "expo-notifications";
import { createReminderOccurrence, getHabits, getPendingReminderOccurrencesByHabitId } from "./database";
import { Habit } from "@/types/database";
import { WeekdaysInNumbers } from "./scheduleWeeklyReminders";

const bodies = [
    'Hey, do not forget to complete your habit!',
    'The deadline is calling. Will you pick up?',
    'Time to complete your habit!',
];

const getNOfDaysToTheNextWeekday = (startWeekday: string = 'Tuesday', weekday: string = 'Tuesday') => {
    let days = Object.keys(WeekdaysInNumbers).slice(7);
    // console.log(days, 'days');
    if (days.indexOf(startWeekday) === -1 || days.indexOf(weekday) === -1) {
        throw new Error('Invalid start weekday or weekday');
    }

    let n = 0;

    if (startWeekday === weekday) {
        console.log('startWeekday is equal to weekday');
        return 7;
    }

    let i = days.indexOf(startWeekday);
    let iterations = 0;
    const maxIterations = 7; // Prevent infinite loop

    while (iterations < maxIterations) {
        // console.log(i, 'i');
        if (i === days.indexOf(weekday)) {
            return n;
        }

        if (i === 6) {
            i = 0; // Reset to 0 for next week
        } else {
            i++;
        }

        n++;
        iterations++;
        // console.log(n, 'n');
    }

    // If we've gone through all 7 days and haven't found the weekday, something is wrong
    throw new Error(`Could not find weekday ${weekday} starting from ${startWeekday}`);
}

/**
 * @async
 * @param n - The number of weeks to schedule reminders for (default: 4)
 * @param habit - Optional, only use this if you want to schedule reminders for a single habit
 * @description Schedule reminders for the next n days for all habits that have reminders
 * -
 *  - Get all reminder occurrences for each habit
 *  - Sort the reminder occurrences by date
 *  - Calculate the number of reminders needed for each habit
 *  - Schedule the reminders for the next n weeks
 *  - Create a reminder occurrence for each reminder
 *  - Create a notification for each reminder
 * @returns void
 */
export const scheduleRemindersForNWeeks = async (n: number = 4, habit?: Habit) => {
    try {
        let habits = habit ? [habit] : await getHabits();

        if (habits.length === 0) {
            console.log('No habits found');
            return;
        } else {
            console.log(habits.length, 'habits found');
        }

        for (const habit of habits) {
            const weekdays = habit.reminder_days;
            console.log(weekdays, 'weekdays');
            if (weekdays.length === 0) {
                console.log('No weekdays found');
                continue;
            }

            const reminderOccurrences = await getPendingReminderOccurrencesByHabitId(habit.id);
            // console.log(reminderOccurrences, 'reminderOccurrences');
            const occurrenceSortedByDate = [...reminderOccurrences].sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
            const remindersAvailable = occurrenceSortedByDate.length || 0;

            let currDay = Object.keys(WeekdaysInNumbers).slice(7)[new Date().getDay()];
            let remindersNeeded = Math.max(0, (habit.reminder_days.length * n) - remindersAvailable);
            if (remindersNeeded <= 0) {
                console.log('No reminders needed');
                continue;
            }

            let nextReminderDate = occurrenceSortedByDate.length > 0 ? new Date(occurrenceSortedByDate[occurrenceSortedByDate.length - 1].scheduled_for) : new Date();
            let day = Object.keys(WeekdaysInNumbers).slice(7)[nextReminderDate.getDay()];
            let id = weekdays.indexOf(day);
            if (occurrenceSortedByDate.length > 0) {
                currDay = weekdays[id];
                if (id === weekdays.length - 1) {
                    id = 0;
                } else {
                    id++;
                }
                nextReminderDate.setDate(nextReminderDate.getDate() + getNOfDaysToTheNextWeekday(currDay, weekdays[id]));
                nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
            } else {
                if (weekdays.includes(currDay)) {
                    console.log('currDay is in weekdays');
                    let reminderTime = new Date().setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
                    if (nextReminderDate.getTime() > reminderTime) {
                        id >= weekdays.length - 1 ? id = 0 : id++;
                        nextReminderDate.setDate(nextReminderDate.getDate() + getNOfDaysToTheNextWeekday(currDay, weekdays[id]));
                    } else {
                        id = weekdays.indexOf(currDay);
                        nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
                    }
                    nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
                } else {
                    let nextDay = weekdays.find((day) => Object.keys(WeekdaysInNumbers).slice(7).indexOf(day) >= nextReminderDate.getDay());
                    // console.log('nextDay is', nextDay);
                    nextDay ? currDay = nextDay : currDay = weekdays[0];
                    nextDay ? id = weekdays.indexOf(nextDay) : id = 0;
                    // console.log('day is', day);
                    // console.log('weekdays[id] is', weekdays[id]);
                    nextReminderDate.setDate(nextReminderDate.getDate() + getNOfDaysToTheNextWeekday(day, weekdays[id]));
                    nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
                    // console.log('nextReminderDate is', nextReminderDate.toISOString());
                }
            }

            console.log(remindersNeeded, 'reminders needed');
            console.log(remindersAvailable, 'reminders available');
            console.log(nextReminderDate.toISOString(), 'next reminder date starting point');
            console.log('--------------------------------');
            console.log('Current Habit', habit.title);
            console.log('--------------------------------');

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
                        task_id: null,
                        scheduled_for_day: weekdays[id],
                        scheduled_for: nextReminderDate.toISOString(),
                        reminder_id: notificationId,
                        title: habit.title,
                        description: bodies[Math.floor(Math.random() * bodies.length)],
                        status: 'pending',
                    });

                    console.log('Vars before next reminder', {
                        remindersNeeded,
                        currDay,
                        id,
                        nextReminderDate: nextReminderDate.toISOString(),
                    });

                    currDay = weekdays[id];
                    id >= weekdays.length - 1 ? id = 0 : id++;
                    nextReminderDate.setDate(nextReminderDate.getDate() + getNOfDaysToTheNextWeekday(currDay, weekdays[id]));
                    nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);

                    remindersNeeded--;
                    console.log('Vars after next reminder', {
                        remindersNeeded,
                        currDay,
                        id,
                        nextReminderDate: nextReminderDate.toISOString(),
                    });

                    console.log(nextReminderDate.toISOString(), 'next reminder date');
                } catch (error) {
                    console.error(`Error scheduling reminder for habit ${habit.title} on ${nextReminderDate.toISOString()}:`, error);
                    remindersNeeded--;
                    currDay = weekdays[id];
                    id >= weekdays.length - 1 ? id = 0 : id++;
                    nextReminderDate.setDate(nextReminderDate.getDate() + getNOfDaysToTheNextWeekday(currDay, weekdays[id]));
                    nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
                    continue;
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
};
