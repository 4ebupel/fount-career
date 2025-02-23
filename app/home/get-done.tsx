import { useState, useContext } from "react";
import { View, Text, StyleSheet, Image, SafeAreaView } from "react-native";
import WeeklyCalendarHeader from "@/components/WeeklyCalendarHeader";
import { colors } from "@/lib/colors";
import { ThemeContext } from "@/contexts/ThemeContext";

export default function MyGoals() {
    const [progressData, setProgressData] = useState([45, 20, 33, 40, 12, 90, 70]);
    const { theme } = useContext(ThemeContext);
    return (
        <SafeAreaView style={[
            styles.container,
            theme === 'dark' ? styles.containerDark : styles.containerLight
        ]}>
            <WeeklyCalendarHeader progressData={progressData} />
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
        </SafeAreaView>
    )
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
});
