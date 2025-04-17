import { colors } from "@/lib/colors";
import { StyleSheet, View, Image, TextInput, Text, Platform, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { CATEGORY_SELECTOR_MODAL, DATE_SELECTOR_MODAL } from "@/components/CustomModal";
import { AntDesign } from '@expo/vector-icons';
import { Goal } from "@/types/database";
import React from "react";

interface Props {
    theme: 'dark' | 'light',
    goal: Goal,
    isTitleEditable?: boolean,
    setGoal: (goal: Goal) => void,
}

export default function LastDetails({ theme, goal, isTitleEditable = false, setGoal }: Props) {
    const [title, setTitle] = useState(goal.title || '');
    const [category, setCategory] = useState(goal.category || 'Select a category');
    const [dueDate, setDueDate] = useState(goal.due_date || 'Select a due date');
    const { openModal, closeModal } = useModal();
    
    // Sample categories
    const categories = [
        'Career Development',
        'Health & Fitness',
        'Personal Growth',
        'Financial',
        'Education',
        'Relationships',
        'Creativity',
        'Travel',
        'Other',
    ];

    const handleCategoryPress = () => {
        openModal({
            modalName: CATEGORY_SELECTOR_MODAL,
            props: {
                theme,
                categories,
                onSelectCategory: (selectedCategory: string) => {
                    setCategory(selectedCategory);
                },
                // Required props for DefaultModalProps
                content: '',
                description: '',
                title: 'Choose Goal Category',
                primaryCTA: '',
                secondaryCTA: '',
                onConfirm: (category: string) => {
                    setGoal({ ...goal, category: category });
                },
                onCancel: () => {},
                onClose: () => closeModal(),
            }
        });
    };
    
    const handleDueDatePress = () => {
        openModal({
            modalName: DATE_SELECTOR_MODAL,
            props: {
                theme,
                onSelectDate: (selectedDate: string) => {
                    // Format date to be more readable: YYYY-MM-DD -> Month DD, YYYY
                    const date = new Date(selectedDate);
                    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                    const formattedDate = date.toLocaleDateString('en-US', options);
                    setDueDate(formattedDate);
                },
                // Required props for DefaultModalProps
                content: '',
                description: '',
                title: 'Choose Due Date',
                primaryCTA: '',
                secondaryCTA: '',
                onConfirm: (dueDate: string) => {
                    setGoal({ ...goal, due_date: dueDate });
                },
                onCancel: () => {},
                onClose: () => closeModal(),
            }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, theme === 'light' ? styles.textLight : styles.textDark]}>
                Let's see the last details
            </Text>
            <View style={[styles.divider, theme === 'light' ? styles.dividerLight : styles.dividerDark]} />
            <View style={styles.columnContainer}>
                <Text style={[styles.text, theme === 'light' ? styles.textLight : styles.textDark]}>
                    Goal
                </Text>
                <View style={[styles.goalTextContainer, theme === 'light' ? styles.containerLight : styles.containerDark]}>
                    {isTitleEditable ? (
                        <TextInput
                            style={[styles.input, theme === 'light' ? styles.textLight : styles.textDark]}
                            value={title}
                            onChangeText={(text) => {setTitle(text); setGoal({ ...goal, title: text })}}
                        />
                    ) : (
                        <Text style={[styles.text, theme === 'light' ? styles.textLight : styles.textDark]}>
                            {goal.title}
                        </Text>
                    )}
                </View>
            </View>
            <View style={styles.columnContainer}>
                <Text style={[styles.text, theme === 'light' ? styles.textLight : styles.textDark]}>
                    Category
                </Text>
                <TouchableOpacity 
                    style={[styles.categoryContainer, theme === 'light' ? styles.containerLight : styles.containerDark]}
                    onPress={handleCategoryPress}
                >
                    <Text style={[
                        styles.text,
                        theme === 'light' ? styles.textLight : styles.textDark,
                        category === 'Select a category' && (theme === 'light' ? styles.placeholderTextLight : styles.placeholderTextDark)
                    ]}>
                        {category}
                    </Text>
                    {category !== 'Select a category' && (
                        <AntDesign 
                            name="checkcircleo" 
                            size={18} 
                            color={theme === 'light' 
                                ? colors.light_theme.text_accent 
                                : colors.dark_theme.text_accent} 
                        />
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.columnContainer}>
                <Text style={[styles.text, theme === 'light' ? styles.textLight : styles.textDark]}>
                    Due Date
                </Text>
                <TouchableOpacity 
                    style={[styles.categoryContainer, theme === 'light' ? styles.containerLight : styles.containerDark]}
                    onPress={handleDueDatePress}
                >
                    <Text style={[
                        styles.text,
                        theme === 'light' ? styles.textLight : styles.textDark,
                        dueDate === 'Select a due date' && (theme === 'light' ? styles.placeholderTextLight : styles.placeholderTextDark)
                    ]}>
                        {dueDate}
                    </Text>
                    {dueDate !== 'Select a due date' && (
                        <AntDesign 
                            name="checkcircleo" 
                            size={18} 
                            color={theme === 'light' 
                                ? colors.light_theme.text_accent 
                                : colors.dark_theme.text_accent} 
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxHeight: '100%',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    textLight: {
        color: colors.light_theme.text_primary,
    },
    textDark: {
        color: colors.dark_theme.text_primary,
    },
    input: {
        width: '100%',
        height: 50,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    placeholderTextLight: {
        color: colors.light_theme.text_secondary,
        fontWeight: '400',
    },
    placeholderTextDark: {
        color: colors.dark_theme.text_secondary,
        fontWeight: '400',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: colors.light_theme.tertiary_background,
    },
    dividerLight: {
        backgroundColor: colors.light_theme.tertiary_background,
    },
    dividerDark: {
        backgroundColor: colors.dark_theme.tertiary_background,
    },
    columnContainer: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
    },
    goalTextContainer: {
        minHeight: 70,
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    containerLight: {
        backgroundColor: colors.light_theme.secondary_background,
    },
    containerDark: {
        backgroundColor: colors.dark_theme.secondary_background,
    },
    categoryContainer: {
        minHeight: 70,
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
    },
});
