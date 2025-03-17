import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "@/lib/colors";
import { ThemeContext } from "@/contexts/ThemeContext";
import { useContext, useState } from "react";
import React from "react";
import GoalCard from "@/components/GoalCard";
const testData = [
    {
        id: 1,
        createdAt: "2025-01-01",
        updatedAt: "2025-02-01",
        title: "Become a UI/UX Designer",
        habits: [
            {
                id: 1,
                title: "Habit 1",
                completed: false,
            },
            {
                id: 2,
                title: "Habit 2",
                completed: true,
            },
            {
                id: 3,
                title: "Habit 3",
                completed: true,
            },
        ],
        tasks: [
            {
                id: 1,
                title: "Task 1",
                completed: false,
            },
            {
                id: 2,
                title: "Task 2",
                completed: true,
            },
            {
                id: 3,
                title: "Task 3",
                completed: false,
            },
        ],
        dueDate: "2026-01-01",
        completed: false,
        imageSmall: "https://picsum.photos/200/300",
        imageLarge: "https://picsum.photos/600/800",
    },
    {
        id: 2,
        createdAt: "2025-01-01",
        updatedAt: "2025-02-01",
        title: "Goal 2",
        habits: [
            {
                id: 1,
                title: "Habit 1",
                completed: true,
            },
            {
                id: 2,
                title: "Habit 2",
                completed: true,
            },
            {
                id: 3,
                title: "Habit 3",
                completed: true,
            },
        ],
        tasks: [
            {
                id: 1,
                title: "Task 1",
                completed: false,
            },
            {
                id: 2,
                title: "Task 2",
                completed: true,
            },
            {
                id: 3,
                title: "Task 3",
                completed: true,
            },
        ],
        dueDate: "2025-06-21",
        completed: true,
        imageSmall: "https://picsum.photos/200/300",
        imageLarge: "https://picsum.photos/600/800",
    },
    {
        id: 3,
        createdAt: "2025-01-01",
        updatedAt: "2025-02-01",
        title: "Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua",
        completed: false,
        habits: [],
        tasks: [],
        dueDate: "2025-06-21",
        imageSmall: "https://picsum.photos/200/300",
        imageLarge: "https://picsum.photos/600/800",
    },
    {
        id: 4,
        createdAt: "2025-01-01",
        updatedAt: "2025-02-01",
        title: "Learn How to Play Guitar",
        completed: false,
        habits: [],
        tasks: [],
        dueDate: "2025-06-21",
        imageSmall: "https://picsum.photos/200/300",
        imageLarge: "https://picsum.photos/600/800",
    },
    {
        id: 5,
        createdAt: "2025-01-01",
        updatedAt: "2025-02-01",
        title: "Learn How to Play Guitar",
        completed: false,
        habits: [],
        tasks: [],
        dueDate: "2025-06-21",
        imageSmall: "https://picsum.photos/200/300",
        imageLarge: "https://picsum.photos/600/800",
    },
    {
        id: 6,
        createdAt: "2025-01-01",
        updatedAt: "2025-02-01",
        title: "Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua",
        completed: false,
        habits: [],
        tasks: [],
        dueDate: "2025-06-21",
        imageSmall: "https://picsum.photos/200/300",
        imageLarge: "https://picsum.photos/600/800",
    },
];

export default function Home() {
    const [selectedButton, setSelectedButton] = useState<'ongoing' | 'achieved'>('ongoing');
    const { theme } = useContext(ThemeContext);

    return (
        <SafeAreaView style={[styles.container, theme === 'light' ? styles.containerLight : styles.containerDark]}>
            <View style={[styles.buttonsContainer, theme === 'light' ? styles.buttonsContainerLight : styles.buttonsContainerDark]}>
                <TouchableOpacity style={[styles.button, theme === 'light' ? styles.buttonLight : styles.buttonDark, selectedButton !== 'ongoing' && styles.buttonInactive]} onPress={() => setSelectedButton('ongoing')}>
                    <Text style={[styles.buttonText, selectedButton === 'ongoing' ? (theme === 'light' ? styles.buttonTextLight : styles.buttonTextDark) : {color: theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary}]}>Ongoing</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, theme === 'light' ? styles.buttonLight : styles.buttonDark, selectedButton !== 'achieved' && styles.buttonInactive]} onPress={() => setSelectedButton('achieved')}>
                    <Text style={[styles.buttonText, selectedButton === 'achieved' ? (theme === 'light' ? styles.buttonTextLight : styles.buttonTextDark) : {color: theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary}]}>Achieved</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.goalsContainer}>
                {
                    selectedButton === 'ongoing' ? (
                        testData.filter((item) => !item.completed).map((item, index) => (
                            <React.Fragment key={item.id}>
                                <GoalCard goal={item} theme={theme} />
                                {index < testData.length - 1 && (
                                    <View style={[styles.divider, theme === 'light' ? styles.dividerLight : styles.dividerDark]} />
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        testData.filter((item) => item.completed).map((item, index) => (
                            <React.Fragment key={item.id}>
                                <GoalCard goal={item} theme={theme} />
                                {index < testData.length - 1 && (
                                    <View style={[styles.divider, theme === 'light' ? styles.dividerLight : styles.dividerDark]} />
                                )}
                            </React.Fragment>
                        ))
                    )
                }
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    containerLight: {
        backgroundColor: colors.light_theme.background,
    },
    containerDark: {
        backgroundColor: colors.dark_theme.background,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: 62,
        height: 52,
        minHeight: 42,
        alignSelf: "stretch",
        marginHorizontal: 24,
        marginBottom: 24,
        marginTop: 8,
        borderRadius: 6,
    },
    buttonsContainerLight: {
        backgroundColor: colors.light_theme.secondary_background,
    },
    buttonsContainerDark: {
        backgroundColor: colors.dark_theme.secondary_background,
    },
    button: {
        width: "50%",
        height: "100%",
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonLight: {
        backgroundColor: colors.light_theme.button_primary_bg,
    },
    buttonDark: {
        backgroundColor: colors.dark_theme.button_primary_bg,
    },
    buttonText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonTextLight: {
        color: colors.light_theme.button_primary_text,
    },
    buttonTextDark: {
        color: colors.dark_theme.button_primary_text,
    },
    buttonInactive: {
        backgroundColor: "transparent",
    },
    divider: {
        width: "100%",
        height: 1,
        marginVertical: 16,
    },
    dividerLight: {
        backgroundColor: colors.light_theme.border_input,
    },
    dividerDark: {
        backgroundColor: colors.dark_theme.border_input,
    },
    goalsContainer: {
        alignSelf: "stretch",
        flex: 1,
        gap: 16,
        marginHorizontal: 24,
    },
})
