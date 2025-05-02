import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/lib/colors';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useModal } from '@/hooks/useModal';
import { EMOJI_SELECTOR_MODAL } from '@/lib/modals';
import Button from '@/components/Button';
import { ThemeContext } from '@/contexts/ThemeContext';
import { mockData } from '@/lib/mock-data';
import { useDatabase } from '@/contexts/DatabaseContext';
export default function AddTask() {
    // Will be undefined if nothing is passed (why is it typed as string | string[] then?)
    const { goalId, taskId, title, description, emoji, due_date, reminder_time } = useLocalSearchParams();
    const { theme } = useContext(ThemeContext);
    const [selectedEmoji, setSelectedEmoji] = useState<string>(emoji as string || '🔄');
    const [taskTitle, setTaskTitle] = useState<string>(title as string || '');
    const [taskDescription, setTaskDescription] = useState<string>(description as string || '');
    const router = useRouter();
    const { openModal } = useModal();
    const { createTask, updateTask } = useDatabase();

    // Find the goal that this task belongs to
    // const goal = mockData.find((item) => item.id === parseInt(goalId as string));

    useEffect(() => {
        console.log('taskId', taskId);
    }, [taskId]);

    const handleEmojiSelect = () => {
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
    };
    
    const handleSave = async () => {
        if (!taskTitle.trim()) {
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
                due_date: null,
            });
            
            // Navigate back to the goal details page after successful creation
            router.replace(`/goal/${goalId}`);
        } catch (error) {
            console.error('Error creating task:', error);
            // In a production app, you would show an error message to the user
        }
    };

    const handleUpdate = async () => {
        if (!taskTitle.trim()) {
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
                // due_date: typeof due_date === 'string' ? due_date : null,
            };

            await updateTask(taskId as string, updatedTask);
            // Navigate back to the goal details page after successful update
            router.replace(`/goal/${goalId}`);
        } catch (error) {
            console.error('Error updating task:', error);
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
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <AntDesign name="close" size={24} color={theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary} />
                        </TouchableOpacity>
                        <Text style={[
                            styles.headerText,
                            theme === 'dark' ? styles.headerTextDark : styles.headerTextLight
                        ]}>
                            Add Task
                        </Text>
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
                        </View>
                    </View>

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
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 12,
        top: 24,
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
}); 