import { View, Text, SafeAreaView, StyleSheet, Image, Pressable, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, router } from 'expo-router';
import { ThemeContext } from "@/contexts/ThemeContext";
import { useContext, useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useDatabase } from "@/contexts/DatabaseContext";
import { useModal } from "@/hooks/useModal";
import { Goal as GoalType, Task, Habit } from "@/types/database";
import React from "react";
import ItemCard from "@/components/ItemCard";

export default function Goal() {
    const { id } = useLocalSearchParams();
    const { theme } = useContext(ThemeContext);
    const { getGoalById, getTasksByGoalId, getHabitsByGoalId, updateGoal, hasError, errorMessage, clearError } = useDatabase();

    const [loading, setLoading] = useState(true);
    const [goal, setGoal] = useState<GoalType | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [localError, setLocalError] = useState<string | null>(null);
    const { openModal, closeModal } = useModal();
    useEffect(() => {
        const fetchGoalData = async () => {
            if (!id || typeof id !== 'string') {
                setLocalError('Invalid goal ID');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setLocalError(null);
                clearError(); // Clear any previous database errors
                console.log(`Fetching goal data for ID: ${id}`);

                // Fetch goal
                const goalData = await getGoalById(id);

                if (!goalData) {
                    console.error('Goal not found');
                    setLocalError(`Goal with ID ${id} not found`);
                    setLoading(false);
                    return;
                }

                setGoal(goalData);

                // Fetch tasks and habits
                try {
                    const goalTasks = await getTasksByGoalId(id);
                    setTasks(goalTasks);
                } catch (error) {
                    console.error('Failed to fetch tasks:', error);
                    // Continue with empty tasks
                    setTasks([]);
                }

                try {
                    const goalHabits = await getHabitsByGoalId(id);
                    setHabits(goalHabits);
                } catch (error) {
                    console.error('Failed to fetch habits:', error);
                    // Continue with empty habits
                    setHabits([]);
                }
            } catch (error) {
                console.error('Failed to fetch goal data:', error);
                setLocalError('Error loading goal data. Please try again.');

                // Show alert for database errors
                Alert.alert(
                    'Error Loading Goal',
                    'There was a problem loading the goal data. Do you want to go back?',
                    [
                        { text: 'Try Again', onPress: () => fetchGoalData() },
                        { text: 'Go Back', onPress: () => router.back() }
                    ]
                );
            } finally {
                setLoading(false);
            }
        };

        fetchGoalData();
    }, [id]);

    const handleEditGoal = () => {
        console.log('goal', goal);
        if (goal) {  // Only open modal if goal exists
            openModal({
                modalName: "EditGoalModal",
                props: {
                    goal: goal,
                    theme: theme,
                    onClose: () => closeModal(),
                    onConfirm: (data: any) => {
                        updateGoal(goal.id, data);
                    },
                    onCancel: () => closeModal(),
                }
            });
        }
    };
    // Handle back navigation
    const handleGoBack = () => {
        router.back();
    };

    // Show loading indicator
    if (loading) {
        return (
            <View style={[styles.container, theme === 'light' ? styles.containerLight : styles.containerDark, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={theme === 'light' ? colors.light_theme.button_primary_bg : colors.dark_theme.button_primary_bg} />
                <Text style={[styles.loadingText, theme === 'light' ? styles.textLight : styles.textDark]}>
                    Loading goal...
                </Text>
            </View>
        );
    }

    // Show error state
    if (localError || hasError) {
        return (
            <View style={[styles.container, theme === 'light' ? styles.containerLight : styles.containerDark, styles.loadingContainer]}>
                <Text style={[styles.errorText, theme === 'light' ? styles.errorTextLight : styles.errorTextDark]}>
                    {localError || errorMessage || 'An error occurred'}
                </Text>
                <TouchableOpacity onPress={handleGoBack} style={styles.goBackButton}>
                    <Text style={[styles.goBackButtonText, theme === 'light' ? styles.goBackButtonTextLight : styles.goBackButtonTextDark]}>
                        Go Back
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Show goal not found state
    if (!goal) {
        return (
            <View style={[styles.container, theme === 'light' ? styles.containerLight : styles.containerDark, styles.loadingContainer]}>
                <Text style={[styles.errorText, theme === 'light' ? styles.errorTextLight : styles.errorTextDark]}>
                    Goal not found
                </Text>
                <TouchableOpacity onPress={handleGoBack} style={styles.goBackButton}>
                    <Text style={[styles.goBackButtonText, theme === 'light' ? styles.goBackButtonTextLight : styles.goBackButtonTextDark]}>
                        Go Back
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Main goal view
    return (
        <View style={[styles.container, theme === 'light' ? styles.containerLight : styles.containerDark]}>
            <View style={styles.goalImageContainer}>
                <Image
                    source={goal.image_large ? { uri: goal.image_large } : require('@/assets/goalCreationTutorialFinal.png')}
                    style={styles.goalImage}
                />
                <Pressable onPress={handleGoBack} style={[styles.backButton, theme === 'light' ? styles.backButtonLight : styles.backButtonDark]}>
                    <FontAwesome name="arrow-left" size={24} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                </Pressable>
                <Pressable style={[styles.imageButton, theme === 'light' ? styles.imageButtonLight : styles.imageButtonDark]}>
                    <FontAwesome name="image" size={24} color={theme === 'light' ? colors.light_theme.button_primary_text : colors.dark_theme.button_primary_text} />
                </Pressable>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.goalHeadingContainer}>
                    <View style={styles.goalTitleContainer}>
                        <Text
                            numberOfLines={2}
                            ellipsizeMode="tail"
                            style={[
                                styles.goalTitle,
                                theme === 'light' ? styles.goalTitleLight : styles.goalTitleDark,
                                goal.title ? styles.goalTitle : styles.goalTitlePlaceholder
                            ]}
                        >
                            {goal.title || 'Add a Goal Title'}
                        </Text>
                        {/* Edit Goal button */}
                        <TouchableOpacity onPress={handleEditGoal} style={[styles.editGoalTitleButton, theme === 'light' ? styles.editGoalTitleButtonLight : styles.editGoalTitleButtonDark]}>
                            <FontAwesome name="pencil" size={18} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.goalHeadingSubContainer}>
                        <View style={[styles.goalHeadingCategoryContainer, theme === 'light' ? styles.goalHeadingCategoryContainerLight : styles.goalHeadingCategoryContainerDark]}>
                            <Text style={[styles.categoryText, theme === 'light' ? styles.categoryTextLight : styles.categoryTextDark]}>
                                {goal.category || 'Category'}
                            </Text>
                        </View>
                        <View style={styles.goalHeadingDateContainer}>
                            <FontAwesome name="calendar" size={14} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                            <Text style={[styles.dueDateText, theme === 'light' ? styles.dueDateTextLight : styles.dueDateTextDark]}>
                                {goal.due_date || 'No due date'}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.divider, theme === 'light' ? styles.dividerLight : styles.dividerDark]} />
                <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                    <View style={styles.sectionsContainer}>
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeadingContainer}>
                                <Text style={[styles.sectionHeadingTitle, theme === 'light' ? styles.sectionHeadingTitleLight : styles.sectionHeadingTitleDark]}>
                                    Tasks ({tasks.length})
                                </Text>
                                <Pressable style={[styles.infoButton, theme === 'light' ? styles.infoButtonLight : styles.infoButtonDark]}>
                                    <FontAwesome name="info" size={12} color={theme === 'light' ? colors.light_theme.text_secondary : colors.dark_theme.text_secondary} />
                                </Pressable>
                            </View>

                            {/* Tasks List */}

                            {tasks.length > 0 && (
                                <ScrollView showsVerticalScrollIndicator={false} style={styles.tasksList}>
                                    {tasks.map((task) => (
                                        <ItemCard
                                            key={task.id}
                                            item={task}
                                            theme={theme}
                                            displayCheckbox={false}
                                            displayBorders={true}
                                            onPress={() => {}}
                                        />
                                    ))}
                                </ScrollView>
                            )}

                            <TouchableOpacity
                                style={[styles.addButton, styles.addTaskButtonBgColor]}
                                onPress={() => router.push({
                                    pathname: '/addTask',
                                    params: { goalId: id }
                                })}
                            >
                                <FontAwesome name="plus" size={16} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                                <Text style={[styles.addButtonText, theme === 'light' ? styles.addButtonTextLight : styles.addButtonTextDark]}>Add Task</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeadingContainer}>
                                <Text style={[styles.sectionHeadingTitle, theme === 'light' ? styles.sectionHeadingTitleLight : styles.sectionHeadingTitleDark]}>
                                    Habits ({habits.length})
                                </Text>
                                <Pressable style={[styles.infoButton, theme === 'light' ? styles.infoButtonLight : styles.infoButtonDark]}>
                                    <FontAwesome name="info" size={12} color={theme === 'light' ? colors.light_theme.text_secondary : colors.dark_theme.text_secondary} />
                                </Pressable>
                            </View>

                            {/* Habits List */}

                            {habits.length > 0 && (
                                <ScrollView showsVerticalScrollIndicator={false} style={styles.habitsList}>
                                    {habits.map((habit) => (
                                        <ItemCard
                                            key={habit.id}
                                            item={habit}
                                            theme={theme}
                                            displayCheckbox={false}
                                            displayBorders={true}
                                            onPress={() => {}}
                                        />
                                    ))}
                                </ScrollView>
                            )}

                            <TouchableOpacity 
                                style={[styles.addButton, styles.addHabitButtonBgColor]}
                                onPress={() => router.push({
                                    pathname: '/addHabit',
                                    params: { goalId: id }
                                })}
                            >
                                <FontAwesome name="plus" size={16} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                                <Text style={[styles.addButtonText, theme === 'light' ? styles.addButtonTextLight : styles.addButtonTextDark]}>Add Habit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLight: {
        backgroundColor: colors.light_theme.background,
    },
    containerDark: {
        backgroundColor: colors.dark_theme.background,
    },
    goalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        flexShrink: 1,
    },
    goalTitlePlaceholder: {
        color: colors.light_theme.text_disabled,
    },
    goalTitleLight: {
        color: colors.light_theme.text_primary,
    },
    goalTitleDark: {
        color: colors.dark_theme.text_primary,
    },
    goalTitleContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'stretch',
        flexWrap: 'nowrap',
    },
    goalHeadingContainer: {
        gap: 12,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    goalImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
        alignSelf: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 44,
        left: 24,
        width: 45,
        height: 45,
        paddingVertical: 10,
        paddingRight: 12,
        paddingLeft: 8,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonLight: {
        backgroundColor: colors.light_theme.background,
    },
    backButtonDark: {
        backgroundColor: colors.dark_theme.background,
    },
    goalImageContainer: {
        position: 'relative',
    },
    imageButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 45,
        height: 45,
        padding: 10,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageButtonLight: {
        backgroundColor: colors.light_theme.button_primary_bg,
    },
    imageButtonDark: {
        backgroundColor: colors.dark_theme.button_primary_bg,
    },
    contentContainer: {
        flex: 1,
        padding: 24,
        gap: 20,
    },
    divider: {
        height: 1,
    },
    dividerLight: {
        backgroundColor: colors.light_theme.border_input,
    },
    dividerDark: {
        backgroundColor: colors.dark_theme.border_input,
    },
    editGoalTitleButton: {
        width: 40,
        height: 40,
        padding: 10,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    editGoalTitleButtonLight: {
        borderColor: colors.light_theme.border_input,
    },
    editGoalTitleButtonDark: {
        borderColor: colors.dark_theme.border_input,
    },
    goalHeadingSubContainer: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    goalHeadingCategoryContainer: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalHeadingCategoryContainerLight: {
        backgroundColor: colors.light_theme.secondary_background,
    },
    goalHeadingCategoryContainerDark: {
        backgroundColor: colors.dark_theme.secondary_background,
    },
    goalHeadingDateContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryText: {
        fontSize: 14,
    },
    categoryTextLight: {
        color: colors.light_theme.text_tertiary,
    },
    categoryTextDark: {
        color: colors.dark_theme.text_tertiary,
    },
    dueDateText: {
        fontSize: 14,
    },
    dueDateTextLight: {
        color: colors.light_theme.text_tertiary,
    },
    dueDateTextDark: {
        color: colors.dark_theme.text_tertiary,
    },
    infoButton: {
        marginTop: 2,
        width: 20,
        height: 20,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    infoButtonLight: {
        borderColor: colors.light_theme.border_input,
    },
    infoButtonDark: {
        borderColor: colors.dark_theme.border_input,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        gap: 20,
    },
    sectionsContainer: {
        gap: 24,
    },
    sectionContainer: {
        gap: 16,
    },
    sectionHeadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 8,
    },
    sectionHeadingTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    sectionHeadingTitleLight: {
        color: colors.light_theme.text_primary,
    },
    sectionHeadingTitleDark: {
        color: colors.dark_theme.text_primary,
    },
    addButton: {
        padding: 16,
        borderRadius: 8,
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addTaskButtonBgColor: {
        backgroundColor: 'rgba(26, 153, 142, 0.08)',
    },
    addHabitButtonBgColor: {
        backgroundColor: "rgba(44, 1, 102, 0.08)",
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    addButtonTextLight: {
        color: colors.light_theme.text_primary,
    },
    addButtonTextDark: {
        color: colors.dark_theme.text_primary,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        marginBottom: 20,
    },
    errorTextLight: {
        color: colors.light_theme.text_primary,
    },
    errorTextDark: {
        color: colors.dark_theme.text_primary,
    },
    goBackButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    goBackButtonLight: {
        borderColor: colors.light_theme.border_button,
    },
    goBackButtonDark: {
        borderColor: colors.dark_theme.border_button,
    },
    goBackButtonText: {
        fontSize: 16,
    },
    goBackButtonTextLight: {
        color: colors.light_theme.text_primary,
    },
    goBackButtonTextDark: {
        color: colors.dark_theme.text_primary,
    },
    tasksList: {
        marginBottom: 16,
    },
    habitsList: {
        marginBottom: 16,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginRight: 12,
        gap: 8,
    },
    taskItemLight: {
        backgroundColor: colors.light_theme.tertiary_background,
    },
    taskItemDark: {
        backgroundColor: colors.dark_theme.tertiary_background,
    },
    habitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginRight: 12,
        gap: 8,
    },
    habitItemLight: {
        backgroundColor: colors.light_theme.tertiary_background,
    },
    habitItemDark: {
        backgroundColor: colors.dark_theme.tertiary_background,
    },
    taskEmoji: {
        fontSize: 16,
    },
    habitEmoji: {
        fontSize: 16,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '500',
        maxWidth: 150,
    },
    taskTitleLight: {
        color: colors.light_theme.text_primary,
    },
    taskTitleDark: {
        color: colors.dark_theme.text_primary,
    },
    habitTitle: {
        fontSize: 14,
        fontWeight: '500',
        maxWidth: 150,
    },
    habitTitleLight: {
        color: colors.light_theme.text_primary,
    },
    habitTitleDark: {
        color: colors.dark_theme.text_primary,
    },
    loadingText: {
        fontSize: 18,
        marginTop: 20,
    },
    textLight: {
        color: colors.light_theme.text_primary,
    },
    textDark: {
        color: colors.dark_theme.text_primary,
    },
    emptyStateText: {
        fontSize: 18,
        textAlign: 'center',
    },
    textSecondaryLight: {
        color: colors.light_theme.text_secondary,
    },
    textSecondaryDark: {
        color: colors.dark_theme.text_secondary,
    },
});
