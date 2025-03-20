import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { colors } from '@/lib/colors';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useModal } from '@/hooks/useModal';
import { EMOJI_SELECTOR_MODAL } from '@/components/CustomModal';
import Button from '@/components/Button';
import { ThemeContext } from '@/contexts/ThemeContext';
import { mockData } from '@/lib/mock-data';

export default function AddTask() {
    const { goalId } = useLocalSearchParams();
    const { theme } = useContext(ThemeContext);
    const [title, setTitle] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [selectedEmoji, setSelectedEmoji] = useState<string>('📝');
    const router = useRouter();
    const { openModal } = useModal();

    // Find the goal that this task belongs to
    const goal = mockData.find((item) => item.id === parseInt(goalId as string));

    const handleEmojiSelect = () => {
        openModal({
            modalName: EMOJI_SELECTOR_MODAL,
            props: {
                theme,
                title: 'Select Emoji',
                content: '',
                description: '',
                primaryCTA: 'Select',
                secondaryCTA: 'Cancel',
                onSelectEmoji: (emoji: string) => {
                    setSelectedEmoji(emoji);
                },
                onConfirm: () => { },
                onCancel: () => { },
                onClose: () => { },
            }
        });
    };

    const handleSave = () => {
        // In a real app, you would create a new task and add it to the goal
        // This is just a mock implementation

        // Create the new task object
        const newTask = {
            id: Date.now(), // Generate a temporary ID
            title,
            note,
            emoji: selectedEmoji,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        // In a real app with a backend, you would make an API call here
        // For now, just go back to the goal details page
        router.back();
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
                                    value={title}
                                    onChangeText={setTitle}
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
                                value={note}
                                onChangeText={setNote}
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
                            label="Save Task"
                            variant="primary"
                            theme={theme}
                            onPress={handleSave}
                            disabled={!title.trim()}
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