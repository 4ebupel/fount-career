import { colors } from "@/lib/colors";
import { View, Text, Image, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface GoalCardProps {
    goal: any;
    theme: 'light' | 'dark';
}

const daysRemaining = (dueDate: string) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const diffTime = Math.abs(dueDateObj.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}


export default function GoalCard({ goal, theme }: GoalCardProps) {
    // Calculate completed habits and tasks
    const completedHabits = goal.habits.filter((habit: any) => habit.completed).length;
    const completedTasks = goal.tasks.filter((task: any) => task.completed).length;
    
    return (
        <View style={styles.goalContainer}>
            <Image source={{ uri: goal.imageSmall }} style={styles.goalContainerImage} />
            <View style={styles.goalContainerInfo}>
                <Text 
                    numberOfLines={2} 
                    ellipsizeMode="tail" 
                    style={[styles.goalContainerInfoTitle, theme === 'light' ? styles.goalContainerInfoTitleLight : styles.goalContainerInfoTitleDark]}
                >
                    {goal.title}
                </Text>
                <View style={styles.goalContainerInfoPills}>
                    <View style={[styles.goalContainerInfoPill, theme === 'light' ? styles.goalContainerInfoPillLight : styles.goalContainerInfoPillDark]}>
                        <Text style={[styles.goalContainerInfoPillText, theme === 'light' ? styles.goalContainerInfoPillTextLight : styles.goalContainerInfoPillTextDark]}>Habits {completedHabits}/{goal.habits.length}</Text>
                    </View>
                    <View style={[styles.goalContainerInfoPill, {borderColor: "#1A96F0"}]}>
                        <Text style={[styles.goalContainerInfoPillText, {color: "#1A96F0"}]}>Tasks {completedTasks}/{goal.tasks.length}</Text>
                    </View>
                </View>
                <View style={styles.goalContainerInfoDueDate}>
                    <Ionicons name="calendar-outline" size={16} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                    <Text style={[styles.goalContainerInfoDueDateText, theme === 'light' ? styles.goalContainerInfoDueDateTextLight : styles.goalContainerInfoDueDateTextDark]}>{daysRemaining(goal.dueDate)} days remaining</Text>
                </View>
            </View>
        </View>
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
})
