import React, { useState, useContext, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/lib/colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useModal } from '@/hooks/useModal';
import { CATEGORY_SELECTOR_MODAL, DEFAULT_MODAL, EMOJI_SELECTOR_MODAL } from '@/lib/modals';
import Button from '@/components/Button';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useDatabase } from '@/hooks/useDatabase';
import TimePickerButton from '@/components/TimePickerButton';
import DateSelector from '@/components/DateSelector';
import { Task as TaskType } from '@/types/database';

// Add or edit a task or even simply look at a task
export default function Task() {
    // Will be undefined if nothing is passed (why is it typed as string | string[] then?)
    const { goalId, taskId } = useLocalSearchParams();
    const { theme } = useContext(ThemeContext);
    const [selectedEmoji, setSelectedEmoji] = useState<string>('🔄');
    const [taskTitle, setTaskTitle] = useState<string>('');
    const [taskDescription, setTaskDescription] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [reminderTime, setReminderTime] = useState<string>('None');
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const { openModal, closeModal } = useModal();
    const { createTask, updateTask, deleteTask, tasks, getPremadeTaskById } = useDatabase();

    const isPremadeGoal = useMemo(() => {
        return !isNaN(Number(goalId));
    }, [goalId]);

    const reminderTimes = useMemo(() => [
        'None',
        'Two weeks before the deadline',
        'One week before the deadline',
        'Two days before the deadline',
        'One day before the deadline',
        'On the deadline',
    ], []);

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
                    }
                }
                if (isPremadeGoal && task_id) {
                    const task = await getPremadeTaskById(task_id);
                    if (task) {
                        setSelectedEmoji(task.selected_emoji);
                        setTaskTitle(task.title);
                        setTaskDescription(task.description || '');
                        setDueDate(task.due_date || '');
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

    const handleReminderTimePress = () => {
        openModal({
            modalName: CATEGORY_SELECTOR_MODAL,
            props: {
                theme,
                categories: reminderTimes,
                onSelectCategory: (selectedCategory: string) => {
                    setReminderTime(selectedCategory);
                },
                title: 'Remind me...',
                onConfirm: (category: string) => {
                    setReminderTime(category);
                },
                onCancel: () => { },
                onClose: () => closeModal(),
            }
        });
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
                onConfirm: () => {
                    // TODO: should be "awaited" in the modal code (maybe add an additional "onSuccess" callback?)
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
            await createTask({
                goal_id: goalId as string,
                title: taskTitle.trim(),
                description: taskDescription.trim(),
                selected_emoji: selectedEmoji,
                reminder_time: null,
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

            const updatedTask = {
                title: taskTitle.trim(),
                description: taskDescription.trim(),
                selected_emoji: selectedEmoji || '',
                // Since we are not using those fields yet, we don't need to update them
                // reminder_time: typeof reminder_time === 'string' ? reminder_time : null,
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
                            <DateSelector
                                theme={theme}
                                date={dueDate}
                                isDisabled={isPremadeGoal}
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
                            {/* Fuze with DateSelector/TimePickerButton and make it a single component */}
                            <TouchableOpacity
                                style={[styles.categoryContainer, theme === 'light' ? styles.containerLight : styles.containerDark]}
                                onPress={!isPremadeGoal ? handleReminderTimePress : undefined}
                                disabled={isPremadeGoal}
                            >
                                <Text style={[
                                    styles.text,
                                    theme === 'light' ? styles.textLight : styles.textDark,
                                    !reminderTime && (theme === 'light' ? styles.placeholderTextLight : styles.placeholderTextDark)
                                ]}>
                                    {reminderTime || 'None'}
                                </Text>
                                {reminderTime && (
                                    <AntDesign
                                        name="checkcircleo"
                                        size={18}
                                        color={theme === 'light'
                                            ? colors.light_theme.text_accent
                                            : colors.dark_theme.text_accent}
                                    />
                                )}
                            </TouchableOpacity>
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
                                disabled={!taskTitle.trim()}
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