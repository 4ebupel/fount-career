import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, ActivityIndicator, Image, Dimensions, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";
import { ThemeContext } from "@/contexts/ThemeContext";
import { useContext, useState, useEffect } from "react";
import React from "react";
import GoalCard from "@/components/GoalCard";
import { GoalCardPressProvider } from "@/contexts/GoalCardPressedContext";
import { useDatabase } from "@/hooks/useDatabase";
import { useModal } from "@/hooks/useModal";
import { Feather } from '@expo/vector-icons';
import { Goal, Task, Habit } from "@/types/database";
import { goalCategories } from "@/lib/goalCategories";

export default function Explore() {
    const categories = ['Popular', ...goalCategories];

    const [selectedButton, setSelectedButton] = useState<string>(categories[0]);
    const { getPremadeGoals, getPremadeTasksForGoalIds, getPremadeHabitsForGoalIds } = useDatabase();
    const [premadeGoals, setPremadeGoals] = useState<Goal[]>([]);
    const [premadeTasks, setPremadeTasks] = useState<Task[]>([]);
    const [premadeHabits, setPremadeHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { theme } = useContext(ThemeContext);
    const { openModal, closeModal } = useModal();

    const banner = theme === 'light' ? require('@/assets/exploreBannerLight.png') : require('@/assets/exploreBannerDark.png');
    const { width } = useWindowDimensions();


    useEffect(() => {
        const fetchPremadeGoals = async () => {
            try {
                const premadeGoals = await getPremadeGoals();
                const premadeTasks = await getPremadeTasksForGoalIds(premadeGoals.goals.map((goal) => goal.id));
                const premadeHabits = await getPremadeHabitsForGoalIds(premadeGoals.goals.map((goal) => goal.id));

                setPremadeGoals(premadeGoals.goals);
                setPremadeTasks(premadeTasks);
                setPremadeHabits(premadeHabits);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPremadeGoals();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, theme === 'light' ? styles.containerLight : styles.containerDark]}>
            <View style={styles.bannerContainer}>
                <View style={styles.bannerOverlay}>
                    <Image
                        source={banner}
                        style={styles.banner}
                    />
                    <Text style={[styles.bannerText, { fontSize: width < 390 ? 18 : 20 }, { color: theme === 'light' ? colors.light_theme.button_primary_text : colors.dark_theme.button_primary_text }]}>
                        {'Explore thousands \nof amazing goals \ntoday!'}
                    </Text>
                </View>
            </View>
            <ScrollView
                horizontal
                style={styles.buttonsContainer}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                {categories.map((category, index) => (
                    <TouchableOpacity key={index} style={[styles.button, theme === 'light' ? styles.buttonLight : styles.buttonDark, selectedButton !== category && styles.buttonInactive]} onPress={() => setSelectedButton(category)}>
                        <Text
                            style={[styles.buttonText, selectedButton === category ? (theme === 'light' ? styles.buttonTextLight : styles.buttonTextDark) : { color: theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary }]}
                        >
                            {category.split(' ')[0]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <ScrollView style={styles.goalsContainer}>
                <GoalCardPressProvider>
                    {premadeGoals.filter((item) => selectedButton === 'Popular' ? true : item.category === selectedButton).map((item, index) => (
                        <React.Fragment key={item.id}>
                            <GoalCard
                                goal={item}
                                theme={theme}
                                habits={
                                    premadeHabits.filter((habit) => habit.goal_id === item.id)
                                }
                                tasks={
                                    premadeTasks.filter((task) => task.goal_id === item.id)
                                }
                                lastCard={index === premadeGoals.length - 1}
                                isPremade={true}
                            />
                            {index < premadeGoals.length - 1 && (
                                <View style={[styles.divider, theme === 'light' ? styles.dividerLight : styles.dividerDark]} />
                            )}
                        </React.Fragment>
                    ))}
                </GoalCardPressProvider>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "flex-start",
        // justifyContent: "flex-start",
        paddingHorizontal: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    containerLight: {
        backgroundColor: colors.light_theme.background,
    },
    containerDark: {
        backgroundColor: colors.dark_theme.background,
    },
    buttonsContainer: {
        maxHeight: 62,
        height: 52,
        minHeight: 42,
        marginBottom: 24,
        marginTop: 8,
        borderRadius: 6,
    },
    button: {
        flex: 1,
        height: 42,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    floatingButton: {
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
    },
    banner: {
        width: "100%",
        height: "100%",
        borderRadius: 6,
        alignSelf: 'center',
        resizeMode: 'cover',
        backgroundColor: colors.light_theme.button_primary_bg,
    },
    bannerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxHeight: 180,
    },
    bannerOverlay: {
        position: 'relative',
        width: "100%",
        height: "100%",
        backgroundColor: colors.light_theme.overlay_background,
        borderRadius: 6,
    },
    bannerText: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 0,
        bottom: 0,
        color: colors.light_theme.button_primary_text,
        fontSize: 20,
        fontWeight: "bold",
    }
})
