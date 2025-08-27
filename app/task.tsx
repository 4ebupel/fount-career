import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
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
import DateSelectorButton from '@/components/DateSelectorButton';
import { Task as TaskType } from '@/types/database';
import TimePickerButton from '@/components/TimePickerButton';
import { ReminderRelativeTimeType } from '@/types/database';
import { isValidRelativeReminderTime } from '@/lib/database-utils';
import { useNavigation } from '@react-navigation/native';
import { navigationLock } from '@/lib/navigationLock';

// Add or edit a task or even simply look at a task
export default function Task() {
    // Will be undefined if nothing is passed (why is it typed as string | string[] then?)
    const { goalId, taskId } = useLocalSearchParams();
    const { theme } = useContext(ThemeContext);
    const [task, setTask] = useState<TaskType | null>(null);
    const [selectedEmoji, setSelectedEmoji] = useState<string>('🔄');
    const [taskTitle, setTaskTitle] = useState<string>('');
    const [taskDescription, setTaskDescription] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [reminderTime, setReminderTime] = useState<ReminderRelativeTimeType>('Never');
    const [reminderIds, setReminderIds] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const { openModal, closeModal } = useModal();
    const { createTask, updateTask, deleteTask, tasks, getPremadeTaskById } = useDatabase();
    const navigation = useNavigation();

    useEffect(() => {
        // @ts-ignore - transitionEnd works in practice despite TypeScript errors
        const unsubscribe = navigation.addListener('transitionEnd', (e) => {
            // @ts-ignore - transitionEnd works in practice despite TypeScript errors
            if (!e.data?.closing) {
                navigationLock.unlock();
            }
        });
    }, []);

    const isPremadeGoal = useMemo(() => {
        return !isNaN(Number(goalId));
    }, [goalId]);

    const scheduleReminder = async (dueDate: string, relativeDate: ReminderRelativeTimeType) => {
        let date;
        let notificationId;
        switch (relativeDate) {
            case 'Two weeks before the deadline':
                date = new Date(new Date(dueDate).setDate(new Date(dueDate).getDate() - 14));
                break;
            case 'One week before the deadline':
                date = new Date(new Date(dueDate).setDate(new Date(dueDate).getDate() - 7));
                break;
            case 'Two days before the deadline':
                date = new Date(new Date(dueDate).setDate(new Date(dueDate).getDate() - 2));
                break;
            case 'One day before the deadline':
                date = new Date(new Date(dueDate).setDate(new Date(dueDate).getDate() - 1));
                break;
            case 'On the deadline':
                date = new Date(dueDate);
                break;
            default:
                date = new Date();
                break;
        };

        if (new Date() > new Date(date)) {
            return null;
        }

        notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: taskTitle,
                body: 'The deadline is calling. Will you pick up?',
                data: {
                    taskId: taskId,
                    goalId: goalId,
                },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: date,
            },
        });

        return notificationId;
    }

    useEffect(() => {
        const goal_id = goalId as string;
        const task_id = taskId as string;
        if (!goal_id || !task_id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const fetchTask = async () => {
            try {
                if (!isPremadeGoal && task_id) {
                    const task = tasks[goal_id].find((task: TaskType) => task.id === task_id);
                    if (task) {
                        setSelectedEmoji(task.selected_emoji);
                        setTaskTitle(task.title);
                        setTaskDescription(task.description || '');
                        setDueDate(task.due_date || '');
                        setReminderTime(task.reminder_relative_date);
                        setReminderIds(task.reminder_ids);
                        setTask(task);
                    }
                }
                if (isPremadeGoal && task_id) {
                    const task = await getPremadeTaskById(task_id);
                    if (task) {
                        setSelectedEmoji(task.selected_emoji);
                        setTaskTitle(task.title);
                        setTaskDescription(task.description || '');
                        setDueDate(task.due_date || '');
                        setReminderTime(task.reminder_relative_date);
                        setReminderIds(task.reminder_ids);
                        setTask(task);
                    }
                }
            } catch (error) {
                console.error('Error fetching task:', error);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
        setLoading(false);
    }, [taskId, tasks]);

    const handleEmojiSelect = () => {
        if (!isPremadeGoal) {
            Keyboard.dismiss();
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
        }
    };

    const handleDelete = async () => {
        if (!taskId || isPremadeGoal) {
            return;
        }

        Keyboard.dismiss();
        openModal({
            modalName: DEFAULT_MODAL,
            props: {
                theme,
                title: 'Delete Task',
                content: '',
                description: 'Are you sure you want to delete this task? \n This action cannot be undone.',
                primaryCTA: 'Delete',
                secondaryCTA: 'Cancel',
                onConfirm: async () => {
                    for (const reminderId of reminderIds) {
                        await Notifications.cancelScheduledNotificationAsync(reminderId);
                    }
                    deleteTask(taskId as string, goalId as string);
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

    const handleSave = async () => {
        if (!taskTitle.trim() || isPremadeGoal) {
            // Don't create tasks without a title
            return;
        }

        try {
            // Create the new task using the database context
            const notificationId = await scheduleReminder(dueDate, reminderTime);
            await createTask({
                goal_id: goalId as string,
                title: taskTitle.trim(),
                description: taskDescription.trim(),
                selected_emoji: selectedEmoji,
                reminder_relative_date: reminderTime,
                reminder_ids: notificationId ? [notificationId] : [],
                due_date: dueDate || null,
            });

            // Navigate back to the goal details page after successful creation
            router.back();
        } catch (error) {
            console.error('Error creating task:', error);
            // In a production app, you would show an error message to the user
        }
    };

    const handleUpdate = async () => {
        if (!taskTitle.trim() || isPremadeGoal) {
            // Don't save tasks without a title
            return;
        }

        try {
            // Update the task using the database context
            let notificationId: string | null = null;
            if (reminderTime !== task?.reminder_relative_date && task?.reminder_ids?.length) {
                await Notifications.cancelScheduledNotificationAsync(task?.reminder_ids[0]);
            }

            if (reminderTime !== 'Never') {
                notificationId = await scheduleReminder(dueDate, reminderTime);
            }

            const updatedTask = {
                title: taskTitle.trim(),
                description: taskDescription.trim(),
                selected_emoji: selectedEmoji || '',
                reminder_relative_date: reminderTime,
                reminder_ids: notificationId ? [notificationId] : task?.reminder_ids,
                due_date: dueDate || null,
            };

            await updateTask(taskId as string, updatedTask);
            // Navigate back to the goal details page after successful update
            router.back();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const onSelectDate = (selectedDate: string) => {
        setDueDate(selectedDate);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary} />
            </View>
        );
    }

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
                            {taskId ? (isPremadeGoal ? 'Task' : 'Edit Task') : 'Add Task'}
                        </Text>
                        {/* Delete button */}
                        <TouchableOpacity onPress={isPremadeGoal ? () => { } : handleDelete} style={styles.deleteButton} disabled={!taskId || isPremadeGoal}>
                            <FontAwesome name="trash" size={24} color={taskId && !isPremadeGoal ? colors.dark_theme.status_error : colors.dark_theme.button_disabled_text} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.scrollView}>
                        <View style={styles.section}>
                            <Text style={[
                                styles.sectionTitle,
                                theme === 'dark'
                                    ? { color: colors.dark_theme.text_primary }
                                    : { color: colors.light_theme.text_primary }
                            ]}>
                                Task Title
                            </Text>
                            <View style={styles.titleContainer}>
                                {!isPremadeGoal ? (
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
                                {!isPremadeGoal ? (
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
                                        placeholder="Enter task title"
                                        placeholderTextColor={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary}
                                        value={taskTitle}
                                        onChangeText={setTaskTitle}
                                    />
                                ) : (
                                    <Text
                                        style={[
                                            styles.titleInput,
                                            { textAlign: 'center' },
                                            { lineHeight: 65 },
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
                                        {taskTitle}
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
                                Note
                            </Text>
                            {!isPremadeGoal ? (
                                <TextInput
                                    style={[
                                        styles.noteInput,
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
                                    placeholder="Add note..."
                                    placeholderTextColor={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary}
                                    value={taskDescription}
                                    onChangeText={setTaskDescription}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            ) : (
                                <Text
                                    style={[
                                        styles.noteInput,
                                        { textAlign: 'left' },
                                        { textAlignVertical: 'top' },
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
                                    {taskDescription}
                                </Text>
                            )}
                        </View>

                        <View style={styles.section}>
                            <Text style={[
                                styles.sectionTitle,
                                theme === 'dark'
                                    ? { color: colors.dark_theme.text_primary }
                                    : { color: colors.light_theme.text_primary }
                            ]}>
                                Due Date
                            </Text>
                            <DateSelectorButton
                                theme={theme}
                                date={dueDate}
                                isDisabled={isPremadeGoal}
                                icon="calendar"
                                onSelectDate={onSelectDate}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={[
                                styles.sectionTitle,
                                theme === 'dark'
                                    ? { color: colors.dark_theme.text_primary }
                                    : { color: colors.light_theme.text_primary }
                            ]}>
                                Reminder Time
                            </Text>
                            <TimePickerButton
                                isDisabled={isPremadeGoal}
                                selectedTime={reminderTime}
                                theme={theme}
                                timeType="rel"
                                setSelectedTime={(value) => {
                                    if (isValidRelativeReminderTime(value)) {
                                        setReminderTime(value);
                                    } else {
                                        setReminderTime('Never');
                                    }
                                }}
                            />
                        </View>
                    </View>

                    {!isPremadeGoal && (
                        <View style={[
                            styles.buttonContainer
                        ]}>
                            <Button
                                label={taskId ? 'Update Task' : 'Save Task'}
                                variant="primary"
                                theme={theme}
                                onPress={taskId ? handleUpdate : handleSave}
                                disabled={!taskTitle.trim() || (!dueDate && reminderTime !== 'Never')}
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
        padding: 4,
    },
    deleteButton: {
        padding: 4,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center'
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
    noteInput: {
        width: '100%',
        minHeight: 120,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
    },
    buttonContainer: {
        paddingVertical: 20,
    },
    // Decouple later
    containerLight: {
        backgroundColor: colors.light_theme.secondary_background,
    },
    containerDark: {
        backgroundColor: colors.dark_theme.secondary_background,
    },
    categoryContainer: {
        minHeight: 70,
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    textLight: {
        color: colors.light_theme.text_primary,
    },
    textDark: {
        color: colors.dark_theme.text_primary,
    },
    placeholderTextLight: {
        color: colors.light_theme.text_secondary,
        fontWeight: '400',
    },
    placeholderTextDark: {
        color: colors.dark_theme.text_secondary,
        fontWeight: '400',
    },
}); 