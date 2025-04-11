import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "@/lib/colors";
import { ThemeContext } from "@/contexts/ThemeContext";
import { useContext, useState, useEffect } from "react";
import React from "react";
import GoalCard from "@/components/GoalCard";
import { GoalCardPressProvider } from "@/contexts/GoalCardPressedContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { Goal } from "@/types/database";

export default function Home() {
    const [selectedButton, setSelectedButton] = useState<'ongoing' | 'achieved'>('ongoing');
    const { goals = [], habits = {}, tasks = {}, getGoals } = useDatabase();
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        getGoals();
    }, []);

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
                <GoalCardPressProvider>
                    {
                        selectedButton === 'ongoing' ? (
                            goals.filter((item) => !item.achieved).map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <GoalCard goal={item} theme={theme} habits={habits[item.id]} tasks={tasks[item.id]} />
                                    {index < goals.length - 1 && (
                                        <View style={[styles.divider, theme === 'light' ? styles.dividerLight : styles.dividerDark]} />
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            goals.filter((item) => item.achieved).map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <GoalCard goal={item} theme={theme} habits={habits[item.id]} tasks={tasks[item.id]} />
                                    {index < goals.length - 1 && (
                                        <View style={[styles.divider, theme === 'light' ? styles.dividerLight : styles.dividerDark]} />
                                    )}
                                </React.Fragment>
                            ))
                        )
                    }
                </GoalCardPressProvider>
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
