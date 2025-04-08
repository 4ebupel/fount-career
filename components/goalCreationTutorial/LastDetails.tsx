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
    const [title, setTitle] = useState(goal.title);
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
            <Text style={styles.title}>
                Let's see the last details
            </Text>
            <View style={styles.divider} />
            <View style={styles.columnContainer}>
                <Text style={styles.text}>
                    Goal
                </Text>
                <View style={styles.goalTextContainer}>
                    {isTitleEditable ? (
                        <TextInput
                            style={styles.text}
                            value={title}
                            onChangeText={(text) => setTitle(text)}
                            onBlur={() => setGoal({ ...goal, title: title })}
                        />
                    ) : (
                        <Text style={styles.text}>
                            {goal.title}
                        </Text>
                    )}
                </View>
            </View>
            <View style={styles.columnContainer}>
                <Text style={styles.text}>
                    Category
                </Text>
                <TouchableOpacity 
                    style={styles.categoryContainer}
                    onPress={handleCategoryPress}
                >
                    <Text style={[
                        styles.text, 
                        category === 'Select a category' && styles.placeholderText
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
                <Text style={styles.text}>
                    Due Date
                </Text>
                <TouchableOpacity 
                    style={styles.categoryContainer}
                    onPress={handleDueDatePress}
                >
                    <Text style={[
                        styles.text, 
                        dueDate === 'Select a due date' && styles.placeholderText
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
    placeholderText: {
        color: colors.light_theme.text_secondary,
        fontWeight: '400',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: colors.light_theme.tertiary_background,
    },
    picture: {
        maxHeight: '35%',
        maxWidth: '40%',
        resizeMode: 'contain',
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
        backgroundColor: colors.light_theme.secondary_background,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    categoryContainer: {
        minHeight: 70,
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: colors.light_theme.secondary_background,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
    },
});
