import React, { useState, useRef, useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions, PanResponder } from "react-native";
import { useDatabase } from "@/hooks/useDatabase";
import { useModal } from "@/hooks/useModal";
import * as Haptics from 'expo-haptics';
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/lib/colors";
import { Habit, HabitWithReminderOccurrence, Task } from "@/types/database";
import { DEFAULT_MODAL } from "@/lib/modals";
import { navigationLock } from "@/lib/navigationLock";

interface props {
    item: Task | HabitWithReminderOccurrence,
    theme: 'dark' | 'light',
    displayCheckbox: boolean,
    displayBorders: boolean,
    scrollEnabler?: (scrollEnabled: boolean) => void,
    onPress: ((itemId: string, goalId: string) => void) | (() => void),
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ItemCard({ item, theme, displayCheckbox, displayBorders, scrollEnabler, onPress }: props) {
    const [isLongPressed, setIsLongPressed] = useState(false);
    const [isCompleted, setIsCompleted] = useState('reminder_occurrence_status' in item ? item.reminder_occurrence_status === 'completed' : item.completed);

    const { width } = useWindowDimensions();
    const { updateHabit, updateTask, deleteHabit, deleteTask, updateReminderOccurrence } = useDatabase();
    const { openModal, closeModal } = useModal();
    let timer: NodeJS.Timeout;

    const mainButtonRef = useRef<View>(null);

    const longPressRef = useRef(false);
        let isCompletedMemo = useMemo(() => 'reminder_occurrence_status' in item ? item.reminder_occurrence_status === 'completed' : item.completed, [item]);
        const mainButtonLayoutRef = useRef<{
        localX: number,
        localY: number,
        localWidth: number,
        localHeight: number,
        pageX: number,
        pageY: number
    }>({ localX: 0, localY: 0, localWidth: 0, localHeight: 0, pageX: 0, pageY: 0 });
    const greenButtonPosRef = useRef<{
        x: number,
        y: number,
        width: number,
        height: number
    }>({ x: 0, y: 0, width: 0, height: 0 });
    const redButtonPosRef = useRef<{
        x: number,
        y: number,
        width: number,
        height: number
    }>({ x: 0, y: 0, width: 0, height: 0 });

    let prevTouchX: number | null = null;
    let prevTouchY: number | null = null;

    const isInsideBounds = (x: number, y: number, buttonPos: { x: number, y: number, width: number, height: number }) => {
        return x > buttonPos.x && x < buttonPos.x + buttonPos.width && y > buttonPos.y && y < buttonPos.y + buttonPos.height;
    }

    const handleOpenDeletionModal = (itemType: 'habit' | 'task', itemId: string, goalId: string) => {
        openModal({
            modalName: DEFAULT_MODAL,
            props: {
                theme,
                title: `Delete ${itemType}`,
                content: '',
                description: 'Are you sure you want to delete this ' + itemType + '? \n This action cannot be undone.',
                primaryCTA: 'Delete',
                secondaryCTA: 'Cancel',
                onConfirm: async () => {
                    if (itemType === 'habit') {
                        await deleteHabit(itemId, goalId);
                    } else {
                        await deleteTask(itemId, goalId);
                    }
                    closeModal();
                },
                onCancel: () => {
                    closeModal();
                },
                onClose: () => { },
            }
        });
    }

    const handleToggleCompletion = async (itemType: 'habit' | 'task') => {
        console.log('isCompleted start', isCompleted);
        setIsCompleted(!isCompletedMemo);
        isCompletedMemo = !isCompletedMemo;
        try {
            if (itemType === 'habit' && 'reminder_occurrence_id' in item && item.reminder_occurrence_id) {
                const occurrence = await updateReminderOccurrence(item.reminder_occurrence_id, item.id, item.goal_id, isCompletedMemo ? 'completed' : 'pending');
                console.log('occurrence after update', occurrence);
            } else {
                await updateTask(item.id, { completed: isCompletedMemo });
            }
            console.log('isCompleted end', isCompleted);
        } catch (error) {
            console.error('Error toggling completion:', error);
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onShouldBlockNativeResponder: () => false,
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                if (navigationLock.isNavigating) {
                    return;
                }
                timer = setTimeout(() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsLongPressed(true);
                    longPressRef.current = true;
                    scrollEnabler?.(false);
                    mainButtonRef.current?.measure((localX, localY, localWidth, localHeight, pageX, pageY) => {
                        console.log('Measure result inside:', { localX, localY, localWidth, localHeight, pageX, pageY });
                        mainButtonLayoutRef.current = { localX, localY, localWidth, localHeight, pageX, pageY };
                        greenButtonPosRef.current = { x: pageX + localWidth / 2, y: pageY, width: localWidth / 2, height: localHeight };
                        redButtonPosRef.current = { x: pageX, y: pageY, width: localWidth / 2, height: localHeight };
                    });
                }, 250);
            },
            onPanResponderMove: (event, gestureState) => {
                if (gestureState.dx > 4 || gestureState.dx < -4 || gestureState.dy > 4 || gestureState.dy < -4) {
                    clearTimeout(timer);
                }

                const touchX = event.nativeEvent.pageX;
                const touchY = event.nativeEvent.pageY;

                if (prevTouchX && prevTouchY) {
                    const isInsideGreen = isInsideBounds(touchX, touchY, greenButtonPosRef.current);
                    const isInsideRed = isInsideBounds(touchX, touchY, redButtonPosRef.current);

                    const isPrevInsideGreen = isInsideBounds(prevTouchX, prevTouchY, greenButtonPosRef.current);
                    const isPrevInsideRed = isInsideBounds(prevTouchX, prevTouchY, redButtonPosRef.current);

                    if (isInsideGreen && !isPrevInsideGreen) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        console.log('Haptic feedback for green button');
                    } else if (isInsideRed && !isPrevInsideRed) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        console.log('Haptic feedback for red button');
                    }
                }

                prevTouchX = touchX;
                prevTouchY = touchY;
            },
            onPanResponderRelease: (event, gestureState) => {
                if ((Math.abs(gestureState.dx) < 0.5 || Math.abs(gestureState.dy) < 0.5) && !longPressRef.current && !navigationLock.isNavigating) {
                    navigationLock.lock();
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
                            }
                        })
                    )
                }

                if (longPressRef.current) {
                    const touchX = event.nativeEvent.pageX;
                    const touchY = event.nativeEvent.pageY;

                    console.log('Touch position:', { touchX, touchY });

                    if (mainButtonLayoutRef.current.localWidth > 0) {
                        const isInsideGreen = isInsideBounds(touchX, touchY, greenButtonPosRef.current);
                        const isInsideRed = isInsideBounds(touchX, touchY, redButtonPosRef.current);

                        let itemType: 'habit' | 'task' = 'habit';

                        'reminder_days' in item ? itemType = 'habit' : itemType = 'task';

                        if (isInsideGreen) {
                            console.log('✅ Over green button!');
                            console.log('current title:', item.title);
                            console.log('current isCompleted:', isCompletedMemo);
                            console.log('current item:', item);

                            handleToggleCompletion(itemType);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            console.log('current isCompleted after toggle:', isCompletedMemo);
                        }
                        if (isInsideRed) {
                            console.log('❌ Over red button!');
                            handleOpenDeletionModal(itemType, item.id, item.goal_id);
                        }
                    } else {
                        console.log('⚠️ Layout not set in ref!');
                    }
                }

                setIsLongPressed(false);
                longPressRef.current = false;
                scrollEnabler?.(true);
                clearTimeout(timer);
                mainButtonLayoutRef.current = { localX: 0, localY: 0, localWidth: 0, localHeight: 0, pageX: 0, pageY: 0 };
                greenButtonPosRef.current = { x: 0, y: 0, width: 0, height: 0 };
                redButtonPosRef.current = { x: 0, y: 0, width: 0, height: 0 };
            },
            onPanResponderTerminate: () => {
                clearTimeout(timer);
                setIsLongPressed(false);
                longPressRef.current = false;
                scrollEnabler?.(true);
                mainButtonLayoutRef.current = { localX: 0, localY: 0, localWidth: 0, localHeight: 0, pageX: 0, pageY: 0 };
                greenButtonPosRef.current = { x: 0, y: 0, width: 0, height: 0 };
                redButtonPosRef.current = { x: 0, y: 0, width: 0, height: 0 };
            }
        })
    ).current;

    return (
        <View
            {...panResponder.panHandlers}
            ref={mainButtonRef}
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
                    isCompleted ? styles.checkboxCompleted : styles.checkboxUncompleted
                ]}>
                    {isCompleted ? (
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
                    isCompleted ? styles.itemTitleCompleted : theme === 'dark' ? styles.textDark : styles.textLight
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
            {isLongPressed && (
                <View style={[styles.longPressedContent]}>
                    <View
                        style={[styles.longPressedContentLeft]}
                    >
                        <Text>
                            <Feather name="trash" size={'reminder_days' in item ? 64 : 32} color="#FFFFFF" />
                        </Text>
                    </View>
                    <View
                        style={[styles.longPressedContentRight]}
                    >
                        <Text>
                            {isCompleted ? (
                                <Feather name="x" size={'reminder_days' in item ? 64 : 32} color="#FFFFFF" />
                            ) : (
                                <Feather name="check" size={'reminder_days' in item ? 64 : 32} color="#FFFFFF" />
                            )}
                        </Text>
                    </View>
                </View>
            )}

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
