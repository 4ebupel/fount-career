import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { colors } from '@/lib/colors';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useModal } from '@/hooks/useModal';
import { EMOJI_SELECTOR_MODAL, TIME_PICKER_MODAL } from '@/components/CustomModal';
import Button from '@/components/Button';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useDatabase } from '@/contexts/DatabaseContext';

// Days of the week for habit reminders
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AddHabit() {
    const { goalId, habitId, title, emoji, reminder_days, reminder_time } = useLocalSearchParams();
    const { theme } = useContext(ThemeContext);
    const [habitTitle, setHabitTitle] = useState<string>(title as string || '');
    const [selectedEmoji, setSelectedEmoji] = useState<string>(emoji as string || '🔄');
    const [habitReminderDays, setHabitReminderDays] = useState<string[]>(reminder_days as string[] || []);
    const [hour, setHour] = useState<string>('10');
    const [minute, setMinute] = useState<string>('00');
    const [period, setPeriod] = useState<string>('AM');
    const router = useRouter();
    const { openModal } = useModal();
    const { createHabit, updateHabit } = useDatabase();

    // Format the time for display and storage
    const habitReminderTime = `${hour}:${minute} ${period}`;

    // Handle emoji selection
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

    // Toggle reminder day selection
    const toggleReminderDay = (day: string) => {
        if (habitReminderDays.includes(day)) {
            setHabitReminderDays(habitReminderDays.filter(d => d !== day));
        } else {
            setHabitReminderDays([...habitReminderDays, day]);
        }
    };

    // Handle time picker for reminder time
    const handleTimeSelection = () => {
        Keyboard.dismiss();
        openModal({
            modalName: TIME_PICKER_MODAL,
            props: {
                theme,
                title: 'Reminder Time',
                content: '',
                description: '',
                primaryCTA: 'OK',
                secondaryCTA: 'Cancel',
                initialHour: hour,
                initialMinute: minute,
                onTimeSelected: (selectedHour, selectedMinute) => {
                    setHour(selectedHour);
                    setMinute(selectedMinute);
                },
                onConfirm: () => { },
                onCancel: () => { },
                onClose: () => { },
            }
        });
    };

    // Save the habit
    const handleSave = async () => {
        if (!habitTitle.trim()) {
            // Don't create habits without a title
            return;
        }
        
        try {
            // Create the new habit using the database context
            await createHabit({
                goal_id: goalId as string,
                title: habitTitle.trim(),
                selected_emoji: selectedEmoji,
                reminder_days: JSON.stringify(habitReminderDays), // Store as JSON string
                reminder_time: habitReminderTime,
                completed: false,
            });
            
            // Navigate back to the goal details page after successful creation
            router.replace(`/goal/${goalId}`);
        } catch (error) {
            console.error('Error creating habit:', error);
            // In a production app, you would show an error message to the user
        }
    };

    const handleUpdate = async () => {
        if (!habitTitle.trim()) {
            // Don't update habits without a title
            return;
        }
        
        try {
            // Prepare the updated habit data
            const updatedHabit = {
                title: habitTitle.trim(),
                selected_emoji: selectedEmoji,
                reminder_days: JSON.stringify(habitReminderDays),
                reminder_time: habitReminderTime,
            };
            
            if (habitId) {
                await updateHabit(habitId as string, updatedHabit);
            }

            // Navigate back to the goal details page after successful creation
            router.replace(`/goal/${goalId}`);
        } catch (error) {
            console.error('Error creating habit:', error);
            // In a production app, you would show an error message to the user
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
                            Add Habit
                        </Text>
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
                                    placeholder="What habit will you build?"
                                    placeholderTextColor={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary}
                                    value={habitTitle}
                                    onChangeText={setHabitTitle}
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
                                Repeat Days
                            </Text>
                            <View style={styles.daysContainer}>
                                {DAYS_OF_WEEK.map((day, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.dayButton,
                                            habitReminderDays.includes(day) && (
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
                                            !habitReminderDays.includes(day) && (
                                                theme === 'dark'
                                                    ? { borderColor: colors.dark_theme.border_input }
                                                    : { borderColor: colors.light_theme.border_input }
                                            )
                                        ]}
                                        onPress={() => toggleReminderDay(day)}
                                    >
                                        <Text style={[
                                            styles.dayText,
                                            habitReminderDays.includes(day)
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
                                onPress={handleTimeSelection}
                            >
                                <Text style={[
                                    styles.timeText,
                                    theme === 'dark'
                                        ? { color: colors.dark_theme.text_primary }
                                        : { color: colors.light_theme.text_primary }
                                ]}>
                                    {habitReminderTime}
                                </Text>
                                <AntDesign 
                                    name="clockcircleo" 
                                    size={20} 
                                    color={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary} 
                                />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <Button
                            label={habitId ? 'Update Habit' : 'Save Habit'}
                            variant="primary"
                            theme={theme}
                            onPress={habitId ? handleUpdate : handleSave}
                            disabled={!habitTitle.trim()}
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