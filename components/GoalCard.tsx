import { colors } from "@/lib/colors";
import { View, Text, Image, StyleSheet, useWindowDimensions } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Pressable } from "react-native";
import React, { useContext } from "react";
import { GoalCardPressContext } from "@/contexts/GoalCardPressedContext";
import { Goal, Habit, Task } from "@/types/database";


interface GoalCardProps {
    goal: Goal;
    habits: Habit[];
    tasks: Task[];
    theme: 'light' | 'dark';
    lastCard?: boolean;
}

const daysRemaining = (dueDate: string) => {
    if (!dueDate) return 'No due date';
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const diffTime = Math.abs(dueDateObj.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GoalCard({ goal, habits, tasks, theme, lastCard = false }: GoalCardProps) {
    // Calculate completed habits and tasks
    const completedHabits = habits?.filter((habit: Habit) => habit.completed).length || 0;
    const completedTasks = tasks?.filter((task: Task) => task.completed).length || 0;
    const totalHabits = habits?.length || 0;
    const totalTasks = tasks?.length || 0;
    const { width } = useWindowDimensions();

    // Access the context to track active cards
    const { activeCardId, setActiveCardId } = useContext(GoalCardPressContext);
    
    // Animation shared value
    const pressed = useSharedValue(0);
    
    // Animated style for background color transition
    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = theme === 'light' 
            ? `rgba(240, 240, 240, ${pressed.value})` 
            : `rgba(48, 48, 48, ${pressed.value})`;
        
        return {
            backgroundColor
        };
    });

    // Determine if this card can respond to touch events
    const isInteractionBlocked = activeCardId !== null && activeCardId !== goal.id;
    
    return (
        <AnimatedPressable
            onPress={() => {
                if (!isInteractionBlocked) {
                    router.push(`/goal/${goal.id}`);
                    // router.push(`/goal/0`);
                }
            }}
            onPressIn={() => {
                if (!isInteractionBlocked) {
                    pressed.value = withTiming(1, { duration: 150 });
                    setActiveCardId(goal.id);
                }
            }}
            onPressOut={() => {
                pressed.value = withTiming(0, { duration: 200 });
                setActiveCardId(null);
            }}
            style={[styles.goalContainer, animatedStyle, lastCard ? styles.lastCard : null]}
        >
            <Image source={{ uri: goal.image_small || goal.image_large || undefined }} style={styles.goalContainerImage} />
            <View style={styles.goalContainerInfo}>
                <Text 
                    numberOfLines={2} 
                    ellipsizeMode="tail" 
                    style={[styles.goalContainerInfoTitle, theme === 'light' ? styles.goalContainerInfoTitleLight : styles.goalContainerInfoTitleDark]}
                >
                    {goal.title}
                </Text>
                <View style={[styles.goalContainerInfoPills, {gap: width >= 390 ? 12 : 2}]}>
                    <View style={[styles.goalContainerInfoPill, theme === 'light' ? styles.goalContainerInfoPillLight : styles.goalContainerInfoPillDark]}>
                        <Text style={[styles.goalContainerInfoPillText, theme === 'light' ? styles.goalContainerInfoPillTextLight : styles.goalContainerInfoPillTextDark]}>Habits {completedHabits}/{totalHabits}</Text>
                    </View>
                    <View style={[styles.goalContainerInfoPill, {borderColor: "#1A96F0"}]}>
                        <Text style={[styles.goalContainerInfoPillText, {color: "#1A96F0"}]}>Tasks {completedTasks}/{totalTasks}</Text>
                    </View>
                </View>
                <View style={styles.goalContainerInfoDueDate}>
                    <Ionicons name="calendar-outline" size={16} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                    <Text style={[styles.goalContainerInfoDueDateText, theme === 'light' ? styles.goalContainerInfoDueDateTextLight : styles.goalContainerInfoDueDateTextDark]}>{daysRemaining(goal.due_date || '')} {goal.due_date ? 'days remaining' : ''}</Text>
                </View>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    goalsContainer: {
        alignSelf: "stretch",
        flex: 1,
        gap: 16,
        marginHorizontal: 24,
    },
    goalContainer: {
        flexDirection: "row",
        alignSelf: "stretch",
        height: 120,
        gap: 16,
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    goalContainerImage: {
        width: 120,
        height: 120,
        borderRadius: 6,
    },
    goalContainerInfo: {
        flex: 1,
        gap: 14,
    },
    goalContainerInfoTitle: {
        fontSize: 20,
        fontWeight: "bold",
        lineHeight: 24,
    },
    goalContainerInfoTitleLight: {
        color: colors.light_theme.text_primary,
    },
    goalContainerInfoTitleDark: {
        color: colors.dark_theme.text_primary,
    },
    goalContainerInfoPills: {
        flexDirection: "row",
        gap: 12,
    },
    goalContainerInfoPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        margin: 1,
    },
    goalContainerInfoPillLight: {
        borderColor: colors.light_theme.text_accent,
    },
    goalContainerInfoPillDark: {
        borderColor: colors.dark_theme.text_accent,
    },
    goalContainerInfoPillText: {
        fontSize: 12,
        fontWeight: "600",
    },
    goalContainerInfoPillTextLight: {
        color: colors.light_theme.text_accent,
    },
    goalContainerInfoPillTextDark: {
        color: colors.dark_theme.text_accent,
    },
    goalContainerInfoDueDate: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    goalContainerInfoDueDateText: {
        fontSize: 12,
        fontWeight: "400",
    },
    goalContainerInfoDueDateTextLight: {
        color: colors.light_theme.text_primary,
    },
    goalContainerInfoDueDateTextDark: {
        color: colors.dark_theme.text_primary,
    },
    lastCard: {
        marginBottom: 60,
    },
})
