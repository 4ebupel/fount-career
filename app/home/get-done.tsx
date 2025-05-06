import { useState, useContext, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WeeklyCalendarHeader from "@/components/WeeklyCalendarHeader";
import { colors } from "@/lib/colors";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useDatabase } from "@/hooks/useDatabase";
import { Goal, Habit, Task } from "@/types/database";
import { useModal } from "@/hooks/useModal";
import React from "react";
import ItemCard from "@/components/ItemCard";

export default function GetDone() {
    const [progressData, setProgressData] = useState([45, 20, 33, 40, 12, 90, 70]);
    const { theme } = useContext(ThemeContext);
    const { goals = [], tasks = {}, habits = {}, isLoading, getGoals, updateHabit, updateTask, createGoal } = useDatabase();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'habits' | 'tasks'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
    const { openModal } = useModal();

    const handleFloatingButtonPress = () => {
        openModal({
            modalName: "GoalCreationTutorialModal",
            props: {
                theme,
                title: "Goal Creation Tutorial",
                content: "This is a tutorial for creating a goal.",
                description: "This is a tutorial for creating a goal.",
                primaryCTA: "Create Goal",
                secondaryCTA: "Cancel",
                onClose: () => { },
                onConfirm: (data: any) => { createGoal(data) },
                onCancel: () => { },
            }
        })
    }

    // Get total tasks and habits
    const totalHabits = useMemo(() =>
        Object.values(habits).flat().length,
        [habits]
    );

    const totalTasks = useMemo(() =>
        Object.values(tasks).flat().length,
        [tasks]
    );

    // Get completed tasks and habits
    const completedHabits = useMemo(() =>
        Object.values(habits).flat().filter(habit => habit.completed).length,
        [habits]
    );

    const completedTasks = useMemo(() =>
        Object.values(tasks).flat().filter(task => task.completed).length,
        [tasks]
    );

    // Total for today
    const totalItems = totalHabits + totalTasks;
    const completedItems = completedHabits + completedTasks;

    // Toggle habit completion
    const toggleHabitCompletion = async (habitId: string, goalId: string) => {
        const habitList = habits[goalId] || [];
        const habit = habitList.find(h => h.id === habitId);
        if (habit) {
            await updateHabit(habitId, { completed: !habit.completed });
        }
    };

    const toggleTaskCompletion = async (taskId: string, goalId: string) => {
        const taskList = tasks[goalId] || [];
        const task = taskList.find(t => t.id === taskId);
        if (task) {
            await updateTask(taskId, { completed: !task.completed });
        }
    };

    // Use getGoals instead of refreshData since it's more reliable
    useEffect(() => {
        console.log("Component mounted, starting async data loading");

        const loadData = async () => {
            try {
                console.log("Fetching goals directly...");
                const fetchedGoals = await getGoals();
                console.log(`Fetched ${fetchedGoals.length} goals successfully`);


                setDataLoaded(true);
            } catch (error) {
                console.error("Error loading data:", error);
                setDataLoaded(true); // Still mark as loaded to show content
            }
        };

        loadData();

        return () => {
            console.log("Component unmounting");
        };
    }, []);

    // Simplified progress indicator style
    const progressBarWidth = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Filtering and sorting logic
    const filteredGoals = useMemo(() => {
        return goals.filter(goal => {
            const goalTasks = tasks[goal.id] || [];
            const goalHabits = habits[goal.id] || [];

            // Check if this goal has any items matching our filters
            const hasMatchingItems = (() => {
                if (filterType === 'tasks' && goalTasks.length === 0) return false;
                if (filterType === 'habits' && goalHabits.length === 0) return false;

                if (filterStatus === 'completed') {
                    if (filterType === 'tasks' || filterType === 'all') {
                        if (goalTasks.some(task => task.completed)) return true;
                    }
                    if (filterType === 'habits' || filterType === 'all') {
                        if (goalHabits.some(habit => habit.completed)) return true;
                    }
                    return false;
                }

                if (filterStatus === 'pending') {
                    if (filterType === 'tasks' || filterType === 'all') {
                        if (goalTasks.some(task => !task.completed)) return true;
                    }
                    if (filterType === 'habits' || filterType === 'all') {
                        if (goalHabits.some(habit => !habit.completed)) return true;
                    }
                    return false;
                }

                return true;
            })();

            return hasMatchingItems;
        });
    }, [goals, tasks, habits, filterType, filterStatus]);

    const renderItemsList = () => {
        return filteredGoals.map(goal => {
            const goalTasks = tasks[goal.id] || [];
            const goalHabits = habits[goal.id] || [];

            // Apply filters to tasks and habits
            const filteredTasks = goalTasks.filter(task => {
                if (filterType === 'habits') return false;
                if (filterStatus === 'completed' && !task.completed) return false;
                if (filterStatus === 'pending' && task.completed) return false;
                return true;
            });

            const filteredHabits = goalHabits.filter(habit => {
                if (filterType === 'tasks') return false;
                if (filterStatus === 'completed' && !habit.completed) return false;
                if (filterStatus === 'pending' && habit.completed) return false;
                return true;
            });

            // Skip rendering this section if there are no items to show
            if (filteredTasks.length === 0 && filteredHabits.length === 0) {
                return null;
            }

            return (
                <View key={goal.id} style={styles.goalSection}>
                    {/* Section Header with Goal Title */}
                    <View style={styles.sectionHeader}>
                        <Text style={[
                            styles.sectionTitle,
                            theme === 'dark' ? styles.sectionTitleDark : styles.sectionTitleLight
                        ]}>
                            {goal.title}
                        </Text>
                        <View style={styles.divider} />
                    </View>

                    {/* Filtered Habits */}
                    {filteredHabits.map(habit => (
                        <ItemCard
                            key={`habit-${habit.id}`}
                            item={habit}
                            theme={theme}
                            displayCheckbox={true}
                            displayBorders={false}
                            onPress={() => toggleHabitCompletion(habit.id, goal.id)}
                        />
                    ))}

                    {/* Filtered Tasks */}
                    {filteredTasks.map(task => (
                        <ItemCard
                            key={`task-${task.id}`}
                            item={task}
                            theme={theme}
                            displayCheckbox={true}
                            displayBorders={false}
                            onPress={() => toggleTaskCompletion(task.id, goal.id)}
                        />
                    ))}
                </View>
            );
        });
    };

    return (
        <View style={[
            styles.container,
            theme === 'dark' ? styles.containerDark : styles.containerLight
        ]}>
            <View style={{ maxHeight: 150 }}>
                <WeeklyCalendarHeader progressData={progressData} />
            </View>

            {isLoading && !dataLoaded ? (
                <View style={styles.backgroundImageContainer}>
                    <Image
                        source={theme === 'dark'
                            ? require("@/assets/get-done-background-image-dark.png")
                            : require("@/assets/get-done-background-image-light.png")
                        }
                        style={styles.backgroundImage}
                        resizeMode="contain"
                    />
                    <View style={styles.backgroundTitleContainer}>
                        <Text style={[styles.backgroundTitle, theme === 'dark' ? styles.backgroundTitleDark : styles.backgroundTitleLight]}>Loading data...</Text>
                        <Text style={[styles.backgroundDescription, theme === 'dark' ? styles.backgroundDescriptionDark : styles.backgroundDescriptionLight]}>Please wait while we fetch your goals.</Text>
                        <ActivityIndicator
                            size="large"
                            color={theme === 'light' ? colors.light_theme.button_primary_bg : colors.dark_theme.button_primary_bg}
                            style={{ marginTop: 20 }}
                        />
                    </View>
                </View>
            ) : goals.length === 0 ? (
                <View style={styles.backgroundImageContainer}>
                    <Image
                        source={theme === 'dark'
                            ? require("@/assets/get-done-background-image-dark.png")
                            : require("@/assets/get-done-background-image-light.png")
                        }
                        style={styles.backgroundImage}
                        resizeMode="contain"
                    />
                    <View style={styles.backgroundTitleContainer}>
                        <Text style={[styles.backgroundTitle, theme === 'dark' ? styles.backgroundTitleDark : styles.backgroundTitleLight]}>You have no goals</Text>
                        <Text style={[styles.backgroundDescription, theme === 'dark' ? styles.backgroundDescriptionDark : styles.backgroundDescriptionLight]}>Add a goal by clicking the (+) button below.</Text>
                    </View>
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    {/* Today's progress */}
                    <View style={styles.todayProgressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={[styles.progressText, theme === 'dark' ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                                Today you have {totalHabits} habits, {totalTasks} tasks
                            </Text>
                            <Text style={[styles.progressCounter, theme === 'dark' ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                                {completedItems} / {totalItems}
                            </Text>
                        </View>

                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${progressBarWidth}%` }]} />
                        </View>
                    </View>

                    {/* Filter controls */}
                    <View style={styles.filterContainer}>
                        <View style={styles.filterRow}>
                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    filterType === 'all' && styles.filterButtonActive
                                ]}
                                onPress={() => setFilterType('all')}
                            >
                                <Text style={[
                                    styles.filterButtonText,
                                    filterType === 'all' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                                ]}>All</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    filterType === 'habits' && styles.filterButtonActive
                                ]}
                                onPress={() => setFilterType('habits')}
                            >
                                <Text style={[
                                    styles.filterButtonText,
                                    filterType === 'habits' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                                ]}>Habits</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    filterType === 'tasks' && styles.filterButtonActive
                                ]}
                                onPress={() => setFilterType('tasks')}
                            >
                                <Text style={[
                                    styles.filterButtonText,
                                    filterType === 'tasks' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                                ]}>Tasks</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterRow}>
                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    filterStatus === 'all' && styles.filterButtonActive
                                ]}
                                onPress={() => setFilterStatus('all')}
                            >
                                <Text style={[
                                    styles.filterButtonText,
                                    filterStatus === 'all' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                                ]}>All</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    filterStatus === 'completed' && styles.filterButtonActive
                                ]}
                                onPress={() => setFilterStatus('completed')}
                            >
                                <Text style={[
                                    styles.filterButtonText,
                                    filterStatus === 'completed' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                                ]}>Completed</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    filterStatus === 'pending' && styles.filterButtonActive
                                ]}
                                onPress={() => setFilterStatus('pending')}
                            >
                                <Text style={[
                                    styles.filterButtonText,
                                    filterStatus === 'pending' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                                ]}>Pending</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Goals sections with tasks and habits */}
                    {renderItemsList()}
                </ScrollView>
            )}

            <Pressable
                style={[
                    styles.button,
                    theme === 'light' ? styles.buttonLight : styles.buttonDark,
                ]}
                onPress={handleFloatingButtonPress}
            >
                <Text>
                    <Feather name="plus" size={24} color={theme === 'light' ? colors.light_theme.button_primary_text : colors.dark_theme.button_primary_text} />
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLight: {
        backgroundColor: colors.light_theme.secondary_background,
    },
    containerDark: {
        backgroundColor: colors.dark_theme.background,
    },
    backgroundImageContainer: {
        flex: 1,
        gap: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        width: 160,
        height: 160,
    },
    backgroundTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    backgroundTitleLight: {
        color: colors.light_theme.text_primary,
    },
    backgroundTitleDark: {
        color: colors.dark_theme.text_primary,
    },
    backgroundDescription: {
        fontSize: 18,
        fontWeight: '400',
    },
    backgroundDescriptionLight: {
        color: colors.light_theme.text_primary,
    },
    backgroundDescriptionDark: {
        color: colors.dark_theme.text_primary,
    },
    backgroundTitleContainer: {
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    todayProgressContainer: {
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressText: {
        fontSize: 14,
        lineHeight: 22,
    },
    progressCounter: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'right',
    },
    progressBarContainer: {
        height: 8,
        borderRadius: 100,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#2C0166',
        borderRadius: 100,
    },
    filterContainer: {
        marginBottom: 20,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: colors.light_theme.button_primary_bg,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
    },
    filterButtonTextInactive: {
        color: '#616161',
    },
    goalSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 22,
        letterSpacing: 0.2,
        marginBottom: 8,
    },
    sectionTitleLight: {
        color: '#9E9E9E',
    },
    sectionTitleDark: {
        color: '#9E9E9E',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 6,
        padding: 12,
        paddingLeft: 20,
        marginBottom: 16,
        overflow: 'hidden',
    },
    itemCardLight: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemCardDark: {
        backgroundColor: colors.dark_theme.tertiary_background,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    checkboxUncompleted: {
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
    },
    checkboxCompleted: {
        backgroundColor: '#12D18E',
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    itemTitleCompleted: {
        color: '#9E9E9E',
        textDecorationLine: 'line-through',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        color: '#616161',
        marginLeft: 6,
    },
    colorStripe: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    textLight: {
        color: colors.light_theme.text_primary,
    },
    textDark: {
        color: colors.dark_theme.text_primary,
    },
    textSecondaryLight: {
        color: colors.light_theme.text_secondary,
    },
    textSecondaryDark: {
        color: colors.dark_theme.text_secondary,
    },
    button: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        padding: 14,
        borderRadius: 100,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLight: {
        backgroundColor: colors.light_theme.button_primary_bg,
    },
    buttonDark: {
        backgroundColor: colors.dark_theme.button_primary_bg,
    },
});
