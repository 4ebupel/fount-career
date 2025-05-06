import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/lib/colors";
import { Habit, Task } from "@/types/database";

interface props {
    item: Task | Habit,
    theme: 'dark' | 'light',
    displayCheckbox: boolean,
    displayBorders: boolean,
    onPress: ((itemId: string, goalId: string) => void) | (() => void),
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ItemCard({ item, theme, displayCheckbox, displayBorders, onPress }: props) {
    const { width } = useWindowDimensions();

    return (
        <TouchableOpacity
            style={[
                styles.itemCard,
                theme === 'dark' ? styles.itemCardDark : styles.itemCardLight,
                displayBorders ? theme === 'dark' ? styles.itemCardWithBordersDark : styles.itemCardWithBordersLight : null
            ]}
            onPress={() => onPress(item.id, item.goal_id)}
        >
            {/* Checkbox */}
            {displayCheckbox && (
                <View style={[
                    styles.checkbox,
                    item.completed ? styles.checkboxCompleted : styles.checkboxUncompleted
                ]}>
                    {item.completed ? (
                        <Text>
                            <Feather name="check" size={16} color="#FFFFFF" />
                        </Text>
                    ) : (null)}
                </View>
            )}

            {/* Content */}
            <View style={styles.itemContent}>
                <Text style={[
                    styles.itemTitle,
                    item.completed ? styles.itemTitleCompleted : theme === 'dark' ? styles.textDark : styles.textLight
                ]}>
                    {item.selected_emoji} {item.title}
                </Text>

                {item.reminder_time ? (
                    <View style={{ flexDirection: width >= 390 ? 'row' : 'column', alignItems: 'flex-start', justifyContent: 'center', gap: width >= 390 ? 0 : 4 }}>
                        <View style={styles.daysContainer}>
                            {DAYS_OF_WEEK.map((day, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dayButton,
                                        'reminder_days' in item && item.reminder_days ?
                                            item.reminder_days.includes(day) && (
                                                theme === 'dark'
                                                    ? {
                                                        backgroundColor: colors.dark_theme.button_primary_bg,
                                                        borderColor: colors.dark_theme.button_primary_bg
                                                    }
                                                    : {
                                                        backgroundColor: colors.light_theme.button_primary_bg,
                                                        borderColor: colors.light_theme.button_primary_bg
                                                    }
                                            )
                                            : (
                                                theme === 'dark'
                                                    ? { borderColor: colors.dark_theme.border_input }
                                                    : { borderColor: colors.light_theme.border_input }
                                            )
                                    ]}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        'reminder_days' in item && item.reminder_days ?
                                            item.reminder_days.includes(day)
                                                ? theme === 'dark'
                                                    ? { color: colors.dark_theme.button_primary_text }
                                                    : { color: colors.light_theme.button_primary_text }
                                                : theme === 'dark'
                                                    ? { color: colors.dark_theme.text_primary }
                                                    : { color: colors.light_theme.text_primary }
                                            : { color: colors.light_theme.text_primary }
                                    ]}>
                                        {day.charAt(0)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.timeContainer}>
                            <Text>
                                <Feather name="clock" size={12} color={theme === 'dark' ? '#9E9E9E' : '#616161'} />
                            </Text>
                            <Text style={styles.timeText}>
                                {item.reminder_time}
                            </Text>
                        </View>
                    </View>
                ) : (null)}
            </View>

            {/* Colored stripe */}
            <View style={[styles.colorStripe, item.reminder_time ? ( theme === 'dark' ? { backgroundColor: colors.dark_theme.text_accent } : { backgroundColor: colors.light_theme.text_accent }) : { backgroundColor: '#1A96F0' }]} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 6,
        padding: 12,
        paddingLeft: 20,
        marginBottom: 16,
        overflow: 'hidden',
    },
    itemCardWithBordersDark: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.dark_theme.border_input,
    },
    itemCardWithBordersLight: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.light_theme.border_input,
    },
    itemCardLight: {
        backgroundColor: colors.light_theme.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemCardDark: {
        backgroundColor: colors.dark_theme.secondary_background,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    checkboxUncompleted: {
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
    },
    checkboxCompleted: {
        backgroundColor: '#12D18E',
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    itemTitleCompleted: {
        color: '#9E9E9E',
        textDecorationLine: 'line-through',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        color: '#616161',
        marginLeft: 6,
    },
    colorStripe: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    textLight: {
        color: colors.light_theme.text_primary,
    },
    textDark: {
        color: colors.dark_theme.text_primary,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
        marginRight: 16,
    },
    dayButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 12,
        fontWeight: '500',
    },
})
