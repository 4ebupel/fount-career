import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, useWindowDimensions, PanResponder } from "react-native";
import * as Haptics from 'expo-haptics';
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/lib/colors";
import { Habit, Task } from "@/types/database";

interface props {
    item: Task | Habit,
    theme: 'dark' | 'light',
    displayCheckbox: boolean,
    displayBorders: boolean,
    scrollEnabler?: (scrollEnabled: boolean) => void,
    onPress: ((itemId: string, goalId: string) => void) | (() => void),
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ItemCard({ item, theme, displayCheckbox, displayBorders, scrollEnabler, onPress }: props) {
    const [isLongPressed, setIsLongPressed] = useState(false);
    const { width } = useWindowDimensions();

    const testGreenButtonRef = useRef<View>(null);
    const testRedButtonRef = useRef<View>(null);
    const testMainButtonRef = useRef<View>(null);

    let timer: NodeJS.Timeout;

    const panResponder = useRef(
        PanResponder.create({
            onShouldBlockNativeResponder: () => false,
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (event, gestureState) => true,
            onPanResponderGrant: (event, gestureState) => {
                // Use Animated to darken the item card.
                timer = setTimeout(() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsLongPressed(true);
                    scrollEnabler?.(false);
                }, 250);
            },
            onPanResponderMove: (event, gestureState) => {
                if (gestureState.dx > 4 || gestureState.dx < -4 || gestureState.dy > 4 || gestureState.dy < -4) {
                    clearTimeout(timer);

                }
                // I guess check if we "passed" through the border of either button and trigger haptic feedback if so.
                console.log('event prop', event.nativeEvent.locationX, event.nativeEvent.locationY);
                console.log('gestureState prop', gestureState.dx, gestureState.dy);
            },
            onPanResponderRelease: (event, gestureState) => {
                if ((Math.abs(gestureState.dx) < 0.5 || Math.abs(gestureState.dy) < 0.5) && !isLongPressed) {
                    'reminder_days' in item ? (
                        router.push({
                            pathname: '/habit',
                            params: {
                                goalId: item.goal_id,
                                habitId: item.id,
                                title: item.title,
                                emoji: item.selected_emoji,
                                reminder_days: item.reminder_days,
                                reminder_time: item.reminder_time
                            }
                        })
                    ) : (
                        router.push({
                            pathname: '/task',
                            params: {
                                goalId: item.goal_id,
                                taskId: item.id,
                                title: item.title,
                                description: item.description,
                                emoji: item.selected_emoji,
                                due_date: item.due_date,
                                reminder_time: item.reminder_time
                            }
                        })
                    )

                }
                clearTimeout(timer);
                setIsLongPressed(false);
                scrollEnabler?.(true);
                // Check if we are currently over the green or red button and trigger the appropriate action.
                console.log('onPanResponderRelease');
            },
            onPanResponderTerminate: () => {
                clearTimeout(timer);
                setIsLongPressed(false);
                scrollEnabler?.(true);
                console.log('onPanResponderTerminate');
            }
        })
    ).current;

    return (
        <View
            {...panResponder.panHandlers}
            ref={testMainButtonRef}
            style={[
                styles.itemCard,
                theme === 'dark' ? styles.itemCardDark : styles.itemCardLight,
                displayBorders ? theme === 'dark' ? styles.itemCardWithBordersDark : styles.itemCardWithBordersLight : null
            ]}
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

                {'reminder_days' in item ? (
                    <View style={{ flexDirection: width >= 390 ? 'row' : 'column', alignItems: 'center', justifyContent: 'flex-start', gap: width >= 390 ? 0 : 4 }}>
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

            {/* Long pressed content */}
            {/* {beenLongPressed && ( */}
            <View style={[styles.longPressedContent]}>
                <View
                    id="red-button"
                    ref={testRedButtonRef}
                    style={[styles.longPressedContentLeft, !isLongPressed && { backgroundColor: 'transparent' }]}
                >
                    <Text style={[{ display: isLongPressed ? 'flex' : 'none' }]}>
                        <Feather name="trash" size={'reminder_days' in item ? 64 : 32} color="#FFFFFF" />
                    </Text>
                </View>
                <View
                    id="green-button"
                    ref={testGreenButtonRef}
                    style={[styles.longPressedContentRight, !isLongPressed && { backgroundColor: 'transparent' }]}
                >
                    <Text style={[{ display: isLongPressed ? 'flex' : 'none' }]}>
                        {item.completed ? (
                            <Feather name="x" size={'reminder_days' in item ? 64 : 32} color="#FFFFFF" />
                        ) : (
                            <Feather name="check" size={'reminder_days' in item ? 64 : 32} color="#FFFFFF" />
                        )}
                    </Text>
                </View>
            </View>

            {/* Colored stripe */}
            <View style={[styles.colorStripe, 'reminder_days' in item ? (theme === 'dark' ? { backgroundColor: colors.dark_theme.text_accent } : { backgroundColor: colors.light_theme.text_accent }) : { backgroundColor: '#1A96F0' }]} />
        </View>
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
    longPressedContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
    },
    longPressedContentLeft: {
        width: '50%',
        height: '100%',
        backgroundColor: 'rgba(221, 119, 119, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    longPressedContentLeftActive: {
        backgroundColor: 'rgba(221, 119, 119, 0.8)',
    },
    longPressedContentRight: {
        width: '50%',
        height: '100%',
        backgroundColor: 'rgba(145, 221, 119, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    longPressedContentRightActive: {
        backgroundColor: 'rgba(145, 221, 119, 0.8)',
    },
})
