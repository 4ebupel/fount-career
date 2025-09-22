import { useState, useContext, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator, ScrollView, TouchableOpacity, SectionList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WeeklyCalendarHeader from "@/components/WeeklyCalendarHeader";
import { colors } from "@/lib/colors";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Feather, Ionicons } from '@expo/vector-icons';
import { getAllHabitsWithRemindersByDate, getReminderOccurrencesByDate } from "@/lib/database";
import { useDatabase } from "@/hooks/useDatabase";
import { Goal, Habit, HabitWithReminderOccurrence, ReminderOccurrence, Task } from "@/types/database";
import { useModal } from "@/hooks/useModal";
import React from "react";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    FadeOut,
    FadeIn,
    SlideInDown,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { format } from "date-fns";
import { WeekdaysInNumbers } from "@/lib/scheduleWeeklyReminders";
import SectionListTestComponent from "@/components/SectionListTestComponent";
import { daysInWeek } from "date-fns/constants";

const WeekdayNumbers = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
};

const dayLists = [
    SectionListTestComponent,
    SectionListTestComponent,
    SectionListTestComponent,
    SectionListTestComponent,
    SectionListTestComponent,
    SectionListTestComponent,
    SectionListTestComponent,
];

const { height, width } = Dimensions.get('window');

const HORIZONTAL_SWIPE_THRESHOLD = 100;

export default function GetDone() {
    const [progressData, setProgressData] = useState([45, 20, 33, 40, 12, 90, 70]);
    const { theme } = useContext(ThemeContext);
    const { goals = [], tasks = {}, isLoading, getGoals, updateHabit, updateTask, createGoal } = useDatabase();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'habits' | 'tasks'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
    const [localHabits, setLocalHabits] = useState<HabitWithReminderOccurrence[]>([]);
    const [localTasks, setLocalTasks] = useState<Task[]>([]);
    const [reminderOccurrences, setReminderOccurrences] = useState<ReminderOccurrence[]>([]);
    const [selectedDay, setSelectedDay] = useState<string>(format(new Date(), 'EEEE'));
    const [sectionListInnards, setSectionListInnards] = useState<{ title: string, data: (HabitWithReminderOccurrence | Task)[] }[]>([]);
    // Scroll enabled is used to disable the scroll when the user is long pressing an item card.
    // TODO: This is a hacky solution and should be improved.
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const { openModal } = useModal();
    const getThisWeeksWeekDay = (dayName: string) => {
        let day = WeekdaysInNumbers[dayName as keyof typeof WeekdaysInNumbers];
        const actualDay = day === 1 ? 8 : day;
        console.log(day, 'day');
        if (!day) {
            return null;
        }
        const date = new Date();
        const today = date.getDay() + 1;
        const diff = actualDay <= today ? today - actualDay : actualDay - today;
        date.setDate(actualDay <= today ? date.getDate() - diff : date.getDate() + diff);

        return date.toISOString();
    };

    // Load data when the component mounts
    useEffect(() => {
        console.log("Component mounted");
        setDataLoaded(false);

        const loadData = async () => {
            try {
                const thisWeeksWeekDay = getThisWeeksWeekDay(selectedDay);
                if (!thisWeeksWeekDay) {
                    setDataLoaded(true);
                    return;
                }
                console.log("This weeks week day:", thisWeeksWeekDay);

                const [habitsData, tasksData] = await Promise.all([
                    getAllHabitsWithRemindersByDate(new Date(thisWeeksWeekDay)),
                    Promise.resolve(Object.values(tasks).flat()),
                    // getReminderOccurrencesByDate(thisWeeksWeekDay)
                ]);

                setLocalHabits(habitsData);
                setLocalTasks(tasksData);
                // setReminderOccurrences(reminderOccurrences);

                console.log("Local habits:", habitsData.length);
                console.log("Local tasks:", tasksData.length);
                console.log("Habits:", habitsData || 'No habits');

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

    // Reload Habits when the selected day changes
    useEffect(() => {
        setDataLoaded(false);
        const loadData = async () => {
            try {
                const thisWeeksWeekDay = getThisWeeksWeekDay(selectedDay);
                if (!thisWeeksWeekDay) {
                    setDataLoaded(true);
                    return;
                }
                const habitsData = await getAllHabitsWithRemindersByDate(new Date(thisWeeksWeekDay));
                setLocalHabits(habitsData);
            } catch (error) {
                console.error("Error loading data:", error);
                setDataLoaded(true);
            }
        };
        loadData();
    }, [selectedDay]);

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
    };

    const translateX = useSharedValue(0);
    const horizontalSwipeOffset = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value + horizontalSwipeOffset.value },
        ],
    }));

    const goNext = () => {
        if (selectedDay !== Object.keys(WeekdayNumbers)[6]) {
            const newDay = format(new Date(new Date().getDate() + 1), 'EEEE');
            const n = Object.keys(WeekdayNumbers).findIndex((e) => e === newDay);
            translateX.value = withTiming(-n * width, { duration: 300 }, () => {
                runOnJS(setSelectedDay)(newDay);
            });
        }
    };

    const goBack = () => {
        if (selectedDay !== Object.keys(WeekdayNumbers)[0]) {
            const newDay = format(new Date(new Date().getDate() - 1), 'EEEE');
            const n = Object.keys(WeekdayNumbers).findIndex((e) => e === newDay);
            translateX.value = withTiming(-n * width, { duration: 300 }, () => {
                runOnJS(setSelectedDay)(newDay);
            });
        }
    };

    const daysPanGesture = Gesture.Pan()
        //   .onBegin(() => {
        //     if (scrollEnabled) {}
        //   })
        .onUpdate((event) => {
            const dampFactor = 0.8;
            horizontalSwipeOffset.value = event.translationX * dampFactor;
        })
        .onEnd((event) => {
            horizontalSwipeOffset.value = withTiming(0, { duration: 300 });
            if (event.translationX > HORIZONTAL_SWIPE_THRESHOLD && Object.keys(WeekdayNumbers).findIndex((e) => e === selectedDay) > 0) {
                runOnJS(goBack)();
            } else if (event.translationX < -HORIZONTAL_SWIPE_THRESHOLD && Object.keys(WeekdayNumbers).findIndex((e) => e === selectedDay) < 6) {
                runOnJS(goNext)();
            }
        })
        .minDistance(10)
        .enabled(scrollEnabled);

    // Get total tasks and habits
    const totalHabits = useMemo(() =>
        localHabits.filter(habit => habit.reminder_days.includes(selectedDay)).length,
        [localHabits]
    );

    const totalTasks = useMemo(() =>
        localTasks.filter(task => task.due_date && new Date(task.due_date) > new Date()).length,
        [localTasks]
    );

    // Get completed tasks and habits
    const completedHabits = useMemo(() =>
        localHabits.filter(habit => habit.reminder_occurrence_status === 'completed').length,
        [localHabits]
    );

    const completedTasks = useMemo(() =>
        localTasks.filter(task => task.completed).length,
        [localTasks]
    );

    // Total for today
    let totalItems = totalHabits + totalTasks;
    const completedItems = completedHabits + completedTasks;

    // Simplified progress indicator style
    const progressBarWidth = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    useEffect(() => {
        setDataLoaded(false);
        const processInnards = async () => {
            const displayGoals = [...goals].filter(goal => {
                const goalTasks = tasks[goal.id];
                const goalHabits = localHabits.filter(habit => habit.goal_id === goal.id);
                console.log("display goals filter ran");

                // Check if this goal has any items matching our filters
                const hasMatchingItems = (() => {
                    if (filterType === 'all') return goalTasks.length > 0 || goalHabits.length > 0;
                    if (filterType === 'tasks') return goalTasks.length > 0;
                    if (filterType === 'habits') return goalHabits.length > 0;

                    if (filterStatus === 'completed') {
                        if (filterType === 'tasks' || filterType === 'all') {
                            if (goalTasks.some(task => task.completed)) return true;
                        }
                        if (filterType === 'habits' || filterType === 'all') {
                            if (goalHabits.some(habit => habit.reminder_occurrence_status === 'completed')) return true;
                        }
                        return false;
                    }

                    if (filterStatus === 'pending') {
                        if (filterType === 'tasks' || filterType === 'all') {
                            if (goalTasks.some(task => !task.completed)) return true;
                        }
                        if (filterType === 'habits' || filterType === 'all') {
                            if (goalHabits.some(habit => habit.reminder_occurrence_status !== 'completed')) return true;
                        }
                        return false;
                    }

                    return true;
                })();

                return hasMatchingItems;
            });

            const processedGoals = [...displayGoals].map(goal => {
                const goalTasks = tasks[goal.id];
                const goalHabits = localHabits.filter(habit => habit.goal_id === goal.id);

                const filteredTasks = [...goalTasks].filter(task => {
                    if (filterType === 'habits') return false;
                    if (filterStatus === 'completed' && !task.completed) return false;
                    if (filterStatus === 'pending' && task.completed) return false;
                    return true;
                });

                const filteredHabits = [...goalHabits].filter(habit => {
                    if (filterType === 'tasks') return false;
                    if (filterStatus === 'completed' && habit.reminder_occurrence_status !== 'completed') return false;
                    if (filterStatus === 'pending' && habit.reminder_occurrence_status === 'completed') return false;
                    if (!habit.reminder_days.includes(selectedDay)) return false;
                    return true;
                });

                const res = {
                    title: goal.title,
                    data: [
                        ...filteredHabits,
                        ...filteredTasks
                    ]
                }

                return { ...res }
            });

            setSectionListInnards([...processedGoals]);
            setDataLoaded(true);
        }
        processInnards();
    }, [goals, tasks, localHabits, filterType, filterStatus]);

    return (
        <View style={[
            styles.container,
            theme === 'dark' ? styles.containerDark : styles.containerLight
        ]}>
            <View style={{ maxHeight: 150 }}>
                <WeeklyCalendarHeader progressData={progressData} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
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
            ) : totalItems <= 0 ? (
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
                        <Text style={[styles.backgroundTitle, theme === 'dark' ? styles.backgroundTitleDark : styles.backgroundTitleLight]}>{goals.length === 0 ? "You have no goals" : "You have no tasks or habits"}</Text>
                        <Text style={[styles.backgroundDescription, theme === 'dark' ? styles.backgroundDescriptionDark : styles.backgroundDescriptionLight]}>{goals.length === 0 ? "Add a goal by clicking the (+) button below." : "Add a task or habit by editing your goal."}</Text>
                    </View>
                </View>
            ) : (
                <View style={[styles.scrollView, { overflow: 'hidden' }]}>
                    {/* Today's progress */}
                    <View style={styles.todayProgressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={[styles.progressText, theme === 'dark' ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                                Today you have {totalHabits} {totalHabits === 1 ? "habit" : "habits"} and {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
                            </Text>
                            <Text style={[styles.progressCounter, theme === 'dark' ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                                {completedItems} / {totalItems}
                            </Text>
                        </View>

                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${progressBarWidth}%` }]} />
                        </View>
                    </View>
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
                    <GestureDetector gesture={daysPanGesture}>
                        <Animated.View style={[styles.stepsWrapper, animatedStyle]}>
                            {dayLists.map((DayList, index) => (
                                <View style={[ {width: width}, {alignItems: 'center'}, {justifyContent: 'flex-start'} ]} key={index}>
                                    <DayList
                                        theme={theme}
                                        loading={Object.keys(WeekdayNumbers)[index] === selectedDay ? !dataLoaded : true}
                                        scrollEnabled={scrollEnabled}
                                        sectionListInnards={sectionListInnards}
                                        setScrollEnabled={setScrollEnabled}
                                    />
                                </View>
                            ))}
                        </Animated.View>
                    </GestureDetector>
                </View>
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
        width: '100%',
        // paddingHorizontal: 16,
        paddingTop: 20,
    },
    stepsWrapper: {
        flexDirection: 'row',
        width: width * dayLists.length,
        alignSelf: 'flex-start',
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
