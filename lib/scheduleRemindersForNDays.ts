import * as Notifications from "expo-notifications";
import { createReminderOccurrence, getHabits, getPendingReminderOccurrencesByHabitId } from "./database";
import { WeekdaysInNumbers } from "./scheduleWeeklyReminders";

const bodies = [
    'Hey, do not forget to complete your habit!',
    'The deadline is calling. Will you pick up?',
    'Time to complete your habit!',
];

const getNOfDaysToTheNextWeekday = (startWeekday: string = 'Tuesday', weekday: string = 'Tuesday') => {
    let n = 0;

    if (startWeekday === weekday) {
        return 7;
    }

    for (let i = WeekdaysInNumbers[startWeekday as keyof typeof WeekdaysInNumbers]; i <= 7; i++) {
        if (i === 7) {
            n++;
            i = 1;
        }

        if (i === WeekdaysInNumbers[weekday as keyof typeof WeekdaysInNumbers]) {
            return n;
        }

        n++;
    }

    return n;
}

/**
 * @async
 * @param n - The number of days to schedule reminders for (default: 14)
 * @description Schedule reminders for the next n days for all habits that have reminders
 * -
 *  - Get all reminder occurrences for each habit
 *  - Sort the reminder occurrences by date
 *  - Calculate the number of reminders needed for each habit
 *  - Schedule the reminders for the next n days
 *  - Create a reminder occurrence for each reminder
 *  - Create a notification for each reminder
 * @returns void
 */
export const scheduleRemindersForNDays = async (n: number = 14) => {
    try {
        const habits = await getHabits();

        if (habits.length === 0) {
            console.log('No habits found');
            return;
        } else {
            console.log(habits.length, 'habits found');
        }

        for (const habit of habits) {
            const weekdays = habit.reminder_days;
            if (weekdays.length === 0) {
                console.log('No weekdays found');
                continue;
            }

            const reminderOccurrences = await getPendingReminderOccurrencesByHabitId(habit.id);
            const occurrenceSortedByDate = [...reminderOccurrences].sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
            const remindersAvailable = occurrenceSortedByDate.length || 0;

            let currDay = WeekdaysInNumbers[new Date().getDay() + 1];
            let remindersNeeded = habit.reminder_days.length * n - remindersAvailable;
            let nextReminderDate = occurrenceSortedByDate.length > 0 ? new Date(occurrenceSortedByDate[occurrenceSortedByDate.length - 1].scheduled_for) : new Date();
            let day = WeekdaysInNumbers[nextReminderDate.getDay() + 1];
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
                if (weekdays.includes(day)) {
                    // if we're in the past, we need to schedule the reminder for the next day
                    let comparisonDateTime = new Date().setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
                    if (nextReminderDate.getTime() > comparisonDateTime) {
                        currDay = weekdays[id];
                        if (id === weekdays.length - 1) {
                            id = 0;
                        } else {
                            id++;
                        }
                        nextReminderDate.setDate(nextReminderDate.getDate() + getNOfDaysToTheNextWeekday(currDay, weekdays[id]));
                        nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
                    } else {
                        // nextReminderDate.setDate(nextReminderDate.getDate() + getNOfDaysToTheNextWeekday(currDay, weekdays[0]));
                        nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
                    }
                } else {
                    let numberedWeekdays = weekdays.map((day) => WeekdaysInNumbers[day as keyof typeof WeekdaysInNumbers]);
                    let nextWeekday = numberedWeekdays.find((day) => day > (nextReminderDate.getDay() + 1));
                    if (nextWeekday) {
                        nextReminderDate.setDate(nextReminderDate.getDate() + getNOfDaysToTheNextWeekday(currDay, weekdays[nextWeekday]));
                        nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
                    } else {
                        nextReminderDate.setDate(nextReminderDate.getDate() + getNOfDaysToTheNextWeekday(currDay, weekdays[0]));
                        nextReminderDate.setHours(+habit.reminder_time.split(':')[0], +habit.reminder_time.split(':')[1], 0, 0);
                    }
                }
            }


            console.log(remindersNeeded, 'reminders needed');
            console.log(remindersAvailable, 'reminders available');

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
                        scheduled_for_day: day,
                        scheduled_for: nextReminderDate.toISOString(),
                        reminder_id: notificationId,
                        title: habit.title,
                        description: bodies[Math.floor(Math.random() * bodies.length)],
                        status: 'pending',
                    });
                } catch (error) {
                    console.error(`Error scheduling reminder for habit ${habit.title} on ${nextReminderDate.toISOString()}:`, error);
                    continue;
                }

                remindersNeeded--;
                nextReminderDate.setDate(nextReminderDate.getDate() + getNOfDaysToTheNextWeekday(currDay, habit.reminder_days[1]));

                console.log(nextReminderDate.toISOString(), 'next reminder date');
            }
        }
    } catch (error) {
        console.error(error);
    }
};
