import { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, Image, SafeAreaView, Pressable, FlatList, ActivityIndicator } from "react-native";
import WeeklyCalendarHeader from "@/components/WeeklyCalendarHeader";
import { colors } from "@/lib/colors";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Feather } from '@expo/vector-icons';
import { useModal } from "@/hooks/useModal";
import { useDatabase } from "@/contexts/DatabaseContext";
import { Goal } from "@/types/database";
import { useRouter } from "expo-router";

// Define a type for the onConfirm function in the modal
interface AddGoalData {
    title?: string;
    category?: string;
    dueDate?: string | null;
}

export default function MyGoals() {
    const [progressData, setProgressData] = useState([45, 20, 33, 40, 12, 90, 70]);
    const { theme } = useContext(ThemeContext);
    const { openModal } = useModal();
    const router = useRouter();
    const { goals, createGoal, isLoading, refreshData, getGoals } = useDatabase();

    // Refresh goals data when component mounts
    useEffect(() => {
        getGoals().catch(err => {
            console.error("Failed to refresh data:", err);
        });
    }, []);

    const handleAddGoal = () => {
        openModal({
            modalName: 'GoalCreationTutorialModal',
            props: {
                title: 'Add Goal',
                description: 'Create a new goal to track your progress.',
                primaryCTA: 'Add Goal',
                secondaryCTA: 'Cancel',
                theme: theme,
                content: '',
                onClose: () => { },
                onConfirm: (data: AddGoalData = {}) => {
                    // Create a new goal with the data from the modal
                    const newGoal: Omit<Goal, 'id' | 'created_at' | 'updated_at'> = {
                        title: data.title || 'Untitled Goal',
                        category: data.category || 'General',
                        due_date: data.dueDate || null,
                        achieved: false,
                        image_small: null,
                        image_large: null,
                    };
                    
                    createGoal(newGoal).then(createdGoal => {
                        console.log('Goal created:', createdGoal);
                        refreshData(); // Refresh the goals list
                    }).catch(error => {
                        console.error('Failed to create goal:', error);
                    });
                },
                onCancel: () => {
                    console.log('Goal creation cancelled');
                },
            }
        });
    };

    const renderGoalItem = ({ item }: { item: Goal }) => (
        <Pressable
            style={[
                styles.goalItem,
                theme === 'light' ? styles.goalItemLight : styles.goalItemDark
            ]}
            onPress={() => router.push(`/goal/${item.id}`)}
        >
            <View style={styles.goalItemContent}>
                <Text style={[
                    styles.goalTitle,
                    theme === 'light' ? styles.textLight : styles.textDark
                ]}>
                    {item.title}
                </Text>
                <Text style={[
                    styles.goalCategory,
                    theme === 'light' ? styles.textSecondaryLight : styles.textSecondaryDark
                ]}>
                    {item.category}
                </Text>
                {item.due_date && (
                    <Text style={[
                        styles.goalDueDate,
                        theme === 'light' ? styles.textSecondaryLight : styles.textSecondaryDark
                    ]}>
                        Due: {new Date(item.due_date).toLocaleDateString()}
                    </Text>
                )}
            </View>
            <View style={styles.goalItemAction}>
                <Feather
                    name="chevron-right"
                    size={24}
                    color={theme === 'light' ? colors.light_theme.text_secondary : colors.dark_theme.text_secondary}
                />
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={[
            styles.container,
            theme === 'dark' ? styles.containerDark : styles.containerLight
        ]}>
            <WeeklyCalendarHeader progressData={progressData} />
            
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme === 'light' ? colors.light_theme.button_primary_bg : colors.dark_theme.button_primary_bg} />
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
                <FlatList
                    data={goals}
                    renderItem={renderGoalItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.goalsList}
                />
            )}
            
            <Pressable
                onPress={handleAddGoal}
                style={[
                    styles.button,
                    theme === 'light' ? styles.buttonLight : styles.buttonDark,
                ]}
            >
                <Feather name="plus" size={24} color={theme === 'light' ? colors.light_theme.button_primary_text : colors.dark_theme.button_primary_text} />
            </Pressable>
        </SafeAreaView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalsList: {
        padding: 16,
    },
    goalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    goalItemLight: {
        backgroundColor: colors.light_theme.background,
    },
    goalItemDark: {
        backgroundColor: colors.dark_theme.background,
    },
    goalItemContent: {
        flex: 1,
    },
    goalItemAction: {
        marginLeft: 8,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    goalCategory: {
        fontSize: 14,
        marginBottom: 4,
    },
    goalDueDate: {
        fontSize: 14,
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
