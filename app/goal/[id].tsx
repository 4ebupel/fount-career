import { View, Text, SafeAreaView, StyleSheet, Image, Pressable } from "react-native";
import { useLocalSearchParams, router } from 'expo-router';
import { mockData } from "@/lib/mock-data";
import { ThemeContext } from "@/contexts/ThemeContext";
import { useContext } from "react";
import { colors } from "@/lib/colors";
import FontAwesome from '@expo/vector-icons/FontAwesome';
export default function Goal() {
    const { id } = useLocalSearchParams();
    const goal = mockData.find((item) => item.id === parseInt(id as string));
    const { theme } = useContext(ThemeContext);

    const handleGoBack = () => {
        router.back();
    }

    return (
        <View style={[styles.container, theme === 'light' ? styles.containerLight : styles.containerDark]}>
            <View style={styles.goalImageContainer}>
                <Image source={goal?.imageLarge ? { uri: goal.imageLarge } : require('@/assets/goalCreationTutorialFinal.png')} style={styles.goalImage} />
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
                        <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.goalTitle, theme === 'light' ? styles.goalTitleLight : styles.goalTitleDark, goal?.title ? styles.goalTitle : styles.goalTitlePlaceholder]}>{goal?.title || 'Add a Goal Title'}</Text>
                        <Pressable style={[styles.editGoalTitleButton, theme === 'light' ? styles.editGoalTitleButtonLight : styles.editGoalTitleButtonDark]}>
                            <FontAwesome name="pencil" size={18} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                        </Pressable>
                    </View>
                    <View style={styles.goalHeadingSubContainer}>
                        <View style={[styles.goalHeadingCategoryContainer, theme === 'light' ? styles.goalHeadingCategoryContainerLight : styles.goalHeadingCategoryContainerDark]}>
                            <Text style={[styles.categoryText, theme === 'light' ? styles.categoryTextLight : styles.categoryTextDark]}>{goal?.category || 'Category'}</Text>
                        </View>
                        <View style={styles.goalHeadingDateContainer}>
                            <FontAwesome name="calendar" size={14} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                            <Text style={[styles.dueDateText, theme === 'light' ? styles.dueDateTextLight : styles.dueDateTextDark]}>{goal?.dueDate || 'No due date'}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.divider, theme === 'light' ? styles.dividerLight : styles.dividerDark]} />
                <View>
                    <View>
                        <Text>Tasks ({goal?.tasks.length || 0})</Text>
                        <FontAwesome />
                    </View>
                    <Pressable>
                        <FontAwesome />
                        <Text>Add Task</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
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
});
