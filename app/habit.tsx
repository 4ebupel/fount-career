import React, { useState, useContext, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/lib/colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useModal } from '@/hooks/useModal';
import { DEFAULT_MODAL, EMOJI_SELECTOR_MODAL } from '@/lib/modals';
import Button from '@/components/Button';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useDatabase } from '@/hooks/useDatabase';
import { scheduleWeeklyReminders, WeekdaysInNumbers } from '@/lib/scheduleWeeklyReminders';
import { checkForExistingReminders } from '@/lib/checkForExistingReminders';
import { navigationLock } from '@/lib/navigationLock';
import { Habit as HabitType } from '@/types/database';
import { deleteReminderOccurrencesByHabitId, deleteReminderOccurrencesForHabitByDay, getPendingReminderOccurrencesByHabitId, getPendingReminderOccurrencesForHabitByDay, getPremadeHabitById } from '@/lib/database';
import { scheduleRemindersForNWeeks } from '@/lib/scheduleRemindersForNWeeks';

// Days of the week for habit reminders
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Habit() {
    const { goalId, habitId } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();

    const [habitTitle, setHabitTitle] = useState<string>('');
    const [selectedEmoji, setSelectedEmoji] = useState<string>('🔄');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [reminderDays, setReminderDays] = useState<string[]>([]);

    const [habit, setHabit] = useState<HabitType | null>(null);

    const { openModal, closeModal } = useModal();
    const { createHabit, updateHabit, deleteHabit, getHabitById } = useDatabase();
    const { theme } = useContext(ThemeContext);

    const isPremadeHabit = useMemo(() => {
        return !isNaN(Number(habitId));
    }, [habitId]);

    useEffect(() => {
        // @ts-ignore - transitionEnd works in practice despite TypeScript errors
        const unsubscribe = navigation.addListener('transitionEnd', (e) => {
            console.log('transitionEnd', e);
            // @ts-ignore - transitionEnd works in practice despite TypeScript errors
            if (!e.data?.closing) {
                navigationLock.unlock();
            }
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const fetchHabit = async () => {
            if (!habitId || typeof habitId !== 'string' || isPremadeHabit) {
                return;
            }
            const habit = isPremadeHabit ? await getPremadeHabitById(habitId) : await getHabitById(habitId);
            console.log('habit', habit);
            if (habit) {
                setHabitTitle(habit.title);
                setSelectedEmoji(habit.selected_emoji);
                setReminderDays(habit.reminder_days);
                setSelectedTime(habit.reminder_time);
                setHabit(habit);
            }
        };
        try {
            fetchHabit();
        } catch (error) {
            console.error('Error fetching habit', error);
        }
    }, [habitId]);

    // Schedule the reminders
    const scheduleReminders = async (oldHabit: HabitType | null, newHabit: HabitType): Promise<boolean | void> => {
        if (isPremadeHabit) {
            return;
        };

        const existingReminderDays: string[] = oldHabit?.reminder_days || [];
        let newReminderDays: string[] = newHabit.reminder_days.filter((day) => !existingReminderDays.includes(day));
        // let existingReminders: {
        //     id: string;
        //     title: string;
        //     body: string;
        //     weekday: keyof typeof WeekdaysInNumbers;
        // }[] = [];

        // // Check for existing reminders
        // try {
        //     existingReminders = await checkForExistingReminders(habit.id);
        //     console.log('Existing reminders', existingReminders.length, existingReminders.map((reminder) => reminder.weekday));
        // } catch (error) {
        //     console.error('Error checking for existing reminders', error);
        // }

        // If the number of reminders has changed, remove the unscheduled reminders
        if (existingReminderDays.length > reminderDays.length && oldHabit) {
            try {
                console.log('--------------------------------');
                console.log('Removing unscheduled reminders');
                console.log('--------------------------------');

                const reminderDaysToRemove = existingReminderDays.filter((reminderDay) => !reminderDays.includes(reminderDay));
                console.log('Unscheduled reminders', reminderDaysToRemove);

                for (const reminderDay of reminderDaysToRemove) {
                    const reminders = await getPendingReminderOccurrencesForHabitByDay(oldHabit.id, reminderDay);
                    console.log('Reminders to remove', reminders);
                    for (const reminder of reminders) {
                        await Notifications.cancelScheduledNotificationAsync(reminder.id);
                    }
                    await deleteReminderOccurrencesForHabitByDay(oldHabit.id, reminderDay);
                }

                console.log('--------------------------------');
                console.log('Unscheduled reminders removed');
                console.log('--------------------------------');
            } catch (error) {
                console.error('Error removing unscheduled reminders', error);
                return false;
            }
        }


        // If the reminder time has changed, delete the existing reminders and schedule new ones
        if ((selectedTime !== oldHabit?.reminder_time && selectedTime) && oldHabit) {
            console.log('--------------------------------');
            console.log('Deleting existing reminders');
            console.log('--------------------------------');

            try {
                await deleteReminderOccurrencesByHabitId(oldHabit.id);
                console.log('Existing reminders deleted successfully');
                console.log('--------------------------------');
            } catch (error) {
                console.error('Error deleting existing reminders', error);
                return false;
            }

            console.log('--------------------------------');
            console.log('Scheduling new reminders');
            console.log('--------------------------------');

            try {
                await scheduleRemindersForNWeeks(1, newHabit);
                console.log('Reminders scheduled successfully');
                console.log('--------------------------------');
            } catch (error) {
                console.error('Error scheduling reminders', error);
                return false;
            }
        }

        if (newReminderDays.length > 0) {
            try {
                await scheduleRemindersForNWeeks(1, newHabit);
                console.log('Reminders scheduled successfully');
            } catch (error) {
                console.error('Error scheduling reminders', error);
                return false;
            }
        }

        // Since we came this far, might as well schedule the reminders for the next 7 days in the background
        scheduleRemindersForNWeeks(2, newHabit);

        return true;
    }

    // Handle time picker for reminder time
    const onChangeTime = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        if (!selectedDate) {
            return;
        }
        const currentDate = selectedDate;
        const time = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        setShowTimePicker(false);
        setSelectedTime(time);
        console.log('onChangeTime', event, 'selectedDate', selectedDate, 'currentDate', currentDate, 'time', time);
    };

    // Handle emoji selection
    const handleEmojiSelect = () => {
        Keyboard.dismiss();
        if (isPremadeHabit) {
            return;
        }
        openModal({
            modalName: EMOJI_SELECTOR_MODAL,
            props: {
                theme,
                title: 'Select Emoji',
                content: selectedEmoji,
                description: '',
                primaryCTA: 'Select',
                secondaryCTA: 'Cancel',
                onConfirm: (emoji: string) => {
                    setSelectedEmoji(emoji);
                },
                onCancel: () => { },
                onClose: () => { },
            }
        });
    };

    // Toggle reminder day selection
    const toggleReminderDay = (day: string) => {
        if (isPremadeHabit) {
            return;
        }
        if (reminderDays.includes(day)) {
            const newHabitReminderDays = reminderDays.filter(d => d !== day);
            setReminderDays(newHabitReminderDays);
        } else {
            const newHabitReminderDays = [...reminderDays, day];
            setReminderDays(newHabitReminderDays);
        }
    };

    // Delete the habit
    const handleDelete = async () => {
        if (!habitId || isPremadeHabit) {
            return;
        }

        Keyboard.dismiss();
        openModal({
            modalName: DEFAULT_MODAL,
            props: {
                theme,
                title: 'Delete Habit',
                content: '',
                description: 'Are you sure you want to delete this habit? \n This action cannot be undone.',
                primaryCTA: 'Delete',
                secondaryCTA: 'Cancel',
                onConfirm: async () => {
                    await deleteHabit(habitId as string, goalId as string);
                    closeModal();
                    router.back();
                },
                onCancel: () => {
                    closeModal();
                },
                onClose: () => { },
            }
        });

    };

    // Create the habit
    const handleSave = async () => {
        if (!habitTitle.trim() || isPremadeHabit) {
            // Don't create habits without a title
            return;
        }

        let newHabit: HabitType;
        // Create the new habit using the database context
        try {
            newHabit = await createHabit({
                goal_id: goalId as string,
                title: habitTitle.trim(),
                selected_emoji: selectedEmoji,
                reminder_days: reminderDays, // Store as JSON string
                reminder_time: selectedTime,
                reminder_ids: [],
                completed: false,
            });
        } catch (error) {
            console.error('Error creating habit:', error);
            return;
        }

        try {
            if (reminderDays.length > 0) {
                await scheduleReminders(null, newHabit);
            }
            // Navigate back to the goal details page after successful creation
            router.back();
        } catch (error) {
            console.error('Error scheduling reminders:', error);
            return;
        }
    };

    // Update the habit
    const handleUpdate = async () => {
        if (!habitTitle.trim() || isPremadeHabit || !habit) {
            // Don't update habits without a title
            return;
        }

        let newHabit: HabitType;
        // Prepare the updated habit data
        const updatedHabit = {
            title: habitTitle.trim(),
            selected_emoji: selectedEmoji,
            reminder_days: reminderDays,
            reminder_time: selectedTime,
            reminder_ids: [],
        };

        try {
            newHabit = await updateHabit(habit.id, updatedHabit);
        } catch (error) {
            console.error('Error updating habit:', error);
            return;
        }

        try {
            if (reminderDays.length > 0) {
                await scheduleReminders(habit, newHabit);
            }
            // Navigate back to the goal details page after successful update
            router.back();
        } catch (error) {
            console.error('Error scheduling reminders:', error);
            return;
        }
    };

    return (
        <SafeAreaView style={[
            { flex: 1 },
            theme === 'dark'
                ? { backgroundColor: colors.dark_theme.background }
                : { backgroundColor: colors.light_theme.background }
        ]}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        {/* Back button */}
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <AntDesign name="close" size={24} color={theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary} />
                        </TouchableOpacity>
                        {/* Header text */}
                        <Text style={[
                            styles.headerText,
                            theme === 'dark' ? styles.headerTextDark : styles.headerTextLight
                        ]}>
                            {habitId ? (isPremadeHabit ? 'Habit' : 'Edit Habit') : 'Add Habit'}
                        </Text>
                        {/* Delete button */}
                        <TouchableOpacity onPress={isPremadeHabit ? () => { } : handleDelete} style={styles.deleteButton} disabled={!habitId || isPremadeHabit}>
                            <FontAwesome name="trash" size={24} color={habitId && !isPremadeHabit ? colors.dark_theme.status_error : colors.dark_theme.button_disabled_text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.scrollView}>
                        <View style={styles.section}>
                            <Text style={[
                                styles.sectionTitle,
                                theme === 'dark'
                                    ? { color: colors.dark_theme.text_primary }
                                    : { color: colors.light_theme.text_primary }
                            ]}>
                                Habit Title
                            </Text>
                            <View style={styles.titleContainer}>
                                {!isPremadeHabit ? (
                                    <TouchableOpacity
                                        style={[
                                            styles.emojiContainer,
                                            theme === 'dark'
                                                ? { backgroundColor: colors.dark_theme.secondary_background }
                                                : { backgroundColor: colors.light_theme.secondary_background }
                                        ]}
                                        onPress={handleEmojiSelect}
                                    >
                                        <Text style={styles.emojiText}>{selectedEmoji}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View
                                        style={[
                                            styles.emojiContainer,
                                            theme === 'dark'
                                                ? { backgroundColor: colors.dark_theme.secondary_background }
                                                : { backgroundColor: colors.light_theme.secondary_background }
                                        ]}
                                    >
                                        <Text style={styles.emojiText}>{selectedEmoji}</Text>
                                    </View>
                                )}
                                {!isPremadeHabit ? (
                                    <TextInput
                                        style={[
                                            styles.titleInput,
                                            theme === 'dark'
                                                ? {
                                                    color: colors.dark_theme.text_primary,
                                                    backgroundColor: colors.dark_theme.secondary_background,
                                                    borderColor: colors.dark_theme.border_input
                                                }
                                                : {
                                                    color: colors.light_theme.text_primary,
                                                    backgroundColor: colors.light_theme.secondary_background,
                                                    borderColor: colors.light_theme.border_input
                                                }
                                        ]}
                                        placeholder="What habit will you build?"
                                        placeholderTextColor={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary}
                                        value={habitTitle}
                                        onChangeText={setHabitTitle}
                                    />
                                ) : (
                                    <Text
                                        style={[
                                            styles.titleInput,
                                            { lineHeight: 65 },
                                            { textAlign: 'center' },
                                            theme === 'dark'
                                                ? {
                                                    color: colors.dark_theme.text_primary,
                                                    backgroundColor: colors.dark_theme.secondary_background,
                                                    borderColor: colors.dark_theme.border_input
                                                }
                                                : {
                                                    color: colors.light_theme.text_primary,
                                                    backgroundColor: colors.light_theme.secondary_background,
                                                    borderColor: colors.light_theme.border_input
                                                }
                                        ]}
                                    >
                                        {habitTitle}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[
                                styles.sectionTitle,
                                theme === 'dark'
                                    ? { color: colors.dark_theme.text_primary }
                                    : { color: colors.light_theme.text_primary }
                            ]}>
                                Repeat Days
                            </Text>
                            <View style={styles.daysContainer}>
                                {DAYS_OF_WEEK.map((day, index) => (
                                    !isPremadeHabit ? (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.dayButton,
                                                reminderDays.includes(day) && (
                                                    theme === 'dark'
                                                        ? {
                                                            backgroundColor: colors.dark_theme.button_primary_bg,
                                                            borderColor: colors.dark_theme.button_primary_bg
                                                        }
                                                        : {
                                                            backgroundColor: colors.light_theme.button_primary_bg,
                                                            borderColor: colors.light_theme.button_primary_bg
                                                        }
                                                ),
                                                !reminderDays.includes(day) && (
                                                    theme === 'dark'
                                                        ? { borderColor: colors.dark_theme.border_input }
                                                        : { borderColor: colors.light_theme.border_input }
                                                )
                                            ]}
                                            onPress={() => toggleReminderDay(day)}
                                        >
                                            <Text style={[
                                                styles.dayText,
                                                reminderDays.includes(day)
                                                    ? theme === 'dark'
                                                        ? { color: colors.dark_theme.button_primary_text }
                                                        : { color: colors.light_theme.button_primary_text }
                                                    : theme === 'dark'
                                                        ? { color: colors.dark_theme.text_primary }
                                                        : { color: colors.light_theme.text_primary }
                                            ]}>
                                                {day.charAt(0)}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View
                                            key={index}
                                            style={[
                                                styles.dayButton,
                                                reminderDays.includes(day) && (
                                                    theme === 'dark'
                                                        ? {
                                                            backgroundColor: colors.dark_theme.button_primary_bg,
                                                            borderColor: colors.dark_theme.button_primary_bg
                                                        }
                                                        : {
                                                            backgroundColor: colors.light_theme.button_primary_bg,
                                                            borderColor: colors.light_theme.button_primary_bg
                                                        }
                                                ),
                                                !reminderDays.includes(day) && (
                                                    theme === 'dark'
                                                        ? { borderColor: colors.dark_theme.border_input }
                                                        : { borderColor: colors.light_theme.border_input }
                                                )
                                            ]}
                                        >
                                            <Text style={[
                                                styles.dayText,
                                                reminderDays.includes(day)
                                                    ? theme === 'dark'
                                                        ? { color: colors.dark_theme.button_primary_text }
                                                        : { color: colors.light_theme.button_primary_text }
                                                    : theme === 'dark'
                                                        ? { color: colors.dark_theme.text_primary }
                                                        : { color: colors.light_theme.text_primary }
                                            ]}>
                                                {day.charAt(0)}
                                            </Text>
                                        </View>
                                    )
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[
                                styles.sectionTitle,
                                theme === 'dark'
                                    ? { color: colors.dark_theme.text_primary }
                                    : { color: colors.light_theme.text_primary }
                            ]}>
                                Habit Reminder
                            </Text>
                            {!isPremadeHabit ? (
                                <TouchableOpacity
                                    style={[
                                        styles.timePickerButton,
                                        theme === 'dark'
                                            ? {
                                                backgroundColor: colors.dark_theme.secondary_background,
                                                borderColor: colors.dark_theme.border_input
                                            }
                                            : {
                                                backgroundColor: colors.light_theme.secondary_background,
                                                borderColor: colors.light_theme.border_input
                                            }
                                    ]}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text style={[
                                        styles.timeText,
                                        theme === 'dark'
                                            ? { color: colors.dark_theme.text_primary }
                                            : { color: colors.light_theme.text_primary }
                                    ]}>
                                        {selectedTime}
                                    </Text>
                                    <AntDesign
                                        name="clockcircleo"
                                        size={20}
                                        color={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary}
                                    />
                                </TouchableOpacity>
                            ) : (
                                <View
                                    style={[
                                        styles.timePickerButton,
                                        theme === 'dark'
                                            ? {
                                                backgroundColor: colors.dark_theme.secondary_background,
                                                borderColor: colors.dark_theme.border_input
                                            }
                                            : {
                                                backgroundColor: colors.light_theme.secondary_background,
                                                borderColor: colors.light_theme.border_input
                                            }
                                    ]}
                                >
                                    <Text style={[
                                        styles.timeText,
                                        theme === 'dark'
                                            ? { color: colors.dark_theme.text_primary }
                                            : { color: colors.light_theme.text_primary }
                                    ]}>
                                        {selectedTime}
                                    </Text>
                                    <AntDesign
                                        name="clockcircleo"
                                        size={20}
                                        color={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary}
                                    />
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {showTimePicker ? (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={new Date()}
                            mode={'time'}
                            display='default'
                            is24Hour={true}
                            onChange={onChangeTime}
                        />
                    ) : null}

                    {!isPremadeHabit && (
                        <View style={styles.buttonContainer}>
                            <Button
                                label={habitId ? 'Update Habit' : 'Save Habit'}
                                variant="primary"
                                theme={theme}
                                onPress={habitId ? handleUpdate : handleSave}
                                disabled={!habitTitle.trim()}
                            />
                        </View>
                    )}
                    {__DEV__ && (
                        <View style={[styles.buttonContainer, { marginTop: 16 }]}>
                            <Button
                                label="Check for existing reminders"
                                variant="primary"
                                theme={theme}
                                onPress={() => checkForExistingReminders(habitId as string)}
                                disabled={!habitId}
                            />
                        </View>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        paddingTop: 24,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerTextLight: {
        color: colors.light_theme.text_primary,
    },
    headerTextDark: {
        color: colors.dark_theme.text_primary,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    emojiContainer: {
        width: 65,
        height: 65,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 32,
    },
    titleInput: {
        flex: 1,
        height: 65,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        borderWidth: 1,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    dayButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 18,
        fontWeight: '500',
    },
    timePickerButton: {
        height: 65,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeText: {
        fontSize: 18,
    },
    buttonContainer: {
        paddingVertical: 24,
    },
}); 