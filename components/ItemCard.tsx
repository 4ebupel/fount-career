import React, { useState, useRef, useEffect } from "react";
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
    const [greenButtonLayout, setGreenButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [redButtonLayout, setRedButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [mainButtonLayout, setMainButtonLayout] = useState({ pageX: 0, pageY: 0, width: 0, height: 0 });
    const [layoutSet, setLayoutSet] = useState(false);
    const { width } = useWindowDimensions();

    let timer: NodeJS.Timeout;

    const greenButtonRef = useRef<View>(null);
    const redButtonRef = useRef<View>(null);
    const mainButtonRef = useRef<View>(null);
    
    // Use refs to store layout information that persists across re-renders
    const layoutRef = useRef({
        mainButton: { pageX: 0, pageY: 0, width: 0, height: 0 },
        greenButton: { x: 0, y: 0, width: 0, height: 0 },
        redButton: { x: 0, y: 0, width: 0, height: 0 },
        isSet: false
    });
    
    // Use ref to track long press state that persists across re-renders
    const longPressRef = useRef(false);

    const handleMainButtonLayout = (event: any) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        console.log('onLayout event:', { x, y, width, height });
        
        // Use measure to get the actual page coordinates
        mainButtonRef.current?.measure((localX, localY, localWidth, localHeight, pageX, pageY) => {
            console.log('Measure result:', { localX, localY, localWidth, localHeight, pageX, pageY });
            
            // Store in both state (for UI updates) and ref (for persistent access)
            setMainButtonLayout({ pageX, pageY, width, height });
            
            // Calculate green and red button positions using page coordinates
            // Since they're positioned absolutely within the main button
            const greenButtonPos = {
                x: pageX + width / 2, // Right half of the main button
                y: pageY, // Use pageY for screen coordinates
                width: width / 2,
                height: height
            };
            
            const redButtonPos = {
                x: pageX, // Left half of the main button
                y: pageY, // Use pageY for screen coordinates
                width: width / 2,
                height: height
            };
            
            setGreenButtonLayout(greenButtonPos);
            setRedButtonLayout(redButtonPos);
            setLayoutSet(true);
            
            // Store in ref for persistent access
            layoutRef.current = {
                mainButton: { pageX, pageY, width, height },
                greenButton: greenButtonPos,
                redButton: redButtonPos,
                isSet: true
            };
            
            console.log('Calculated green button position (with page coords):', greenButtonPos);
            console.log('Calculated red button position (with page coords):', redButtonPos);
            console.log('Layout has been set!');
            console.log('Layout ref updated:', layoutRef.current);
        });
    };

    // // Monitor when mainButtonLayout changes
    // useEffect(() => {
    //     console.log('mainButtonLayout updated:', mainButtonLayout);
    // }, [mainButtonLayout]);

    // // Monitor when green button layout changes
    // useEffect(() => {
    //     console.log('greenButtonLayout updated:', greenButtonLayout);
    // }, [greenButtonLayout]);

    // // Monitor when red button layout changes
    // useEffect(() => {
    //     console.log('redButtonLayout updated:', redButtonLayout);
    // }, [redButtonLayout]);

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
                    longPressRef.current = true; // Set ref as well
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
                if ((Math.abs(gestureState.dx) < 0.5 || Math.abs(gestureState.dy) < 0.5) && !longPressRef.current) {
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
                
                // Check if we are currently over the green or red button and trigger the appropriate action.
                // Use ref for reliable long press state
                if (longPressRef.current) {
                    const touchX = event.nativeEvent.pageX;
                    const touchY = event.nativeEvent.pageY;
                    
                    // Use ref values for reliable access
                    const currentLayout = layoutRef.current;
                    
                    console.log('Touch position:', { touchX, touchY });
                    console.log('Layout ref state:', currentLayout);
                    console.log('Green button bounds (from ref):', currentLayout.greenButton);
                    console.log('Red button bounds (from ref):', currentLayout.redButton);
                    
                    if (currentLayout.isSet) {
                        // Debug the coordinate calculations
                        const greenXInRange = touchX > currentLayout.greenButton.x && touchX < currentLayout.greenButton.x + currentLayout.greenButton.width;
                        const greenYInRange = touchY > currentLayout.greenButton.y && touchY < currentLayout.greenButton.y + currentLayout.greenButton.height;
                        const redXInRange = touchX > currentLayout.redButton.x && touchX < currentLayout.redButton.x + currentLayout.redButton.width;
                        const redYInRange = touchY > currentLayout.redButton.y && touchY < currentLayout.redButton.y + currentLayout.redButton.height;
                        
                        // console.log('Coordinate checks:', {
                        //     greenXInRange,
                        //     greenYInRange,
                        //     redXInRange,
                        //     redYInRange,
                        //     greenXRange: [currentLayout.greenButton.x, currentLayout.greenButton.x + currentLayout.greenButton.width],
                        //     greenYRange: [currentLayout.greenButton.y, currentLayout.greenButton.y + currentLayout.greenButton.height],
                        //     redXRange: [currentLayout.redButton.x, currentLayout.redButton.x + currentLayout.redButton.width],
                        //     redYRange: [currentLayout.redButton.y, currentLayout.redButton.y + currentLayout.redButton.height]
                        // });
                        
                        if (greenXInRange && greenYInRange) {
                            console.log('✅ Over green button!');
                            onPress(item.id, item.goal_id);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        if (redXInRange && redYInRange) {
                            console.log('❌ Over red button!');
                        }
                    } else {
                        console.log('⚠️ Layout not set in ref!');
                    }
                }
                
                // Reset long press state
                setIsLongPressed(false);
                longPressRef.current = false;
                scrollEnabler?.(true);
                console.log('=== PAN RELEASE DEBUG ===');
                console.log('isLongPressed (state):', isLongPressed);
                console.log('isLongPressed (ref):', longPressRef.current);
                console.log('layoutSet:', layoutSet);
                console.log('mainButtonLayout on Release', mainButtonLayout);
                console.log('greenButtonLayout on Release', greenButtonLayout);
                console.log('redButtonLayout on Release', redButtonLayout);
                console.log('Layout ref state:', layoutRef.current);
                console.log('Layout values are zero?', {
                    mainZero: mainButtonLayout.width === 0,
                    greenZero: greenButtonLayout.width === 0,
                    redZero: redButtonLayout.width === 0,
                    refSet: layoutRef.current.isSet,
                    refMainZero: layoutRef.current.mainButton.width === 0
                });
                console.log('onPanResponderRelease');
            },
            onPanResponderTerminate: () => {
                clearTimeout(timer);
                setIsLongPressed(false);
                longPressRef.current = false;
                scrollEnabler?.(true);
                console.log('onPanResponderTerminate');
            }
        })
    ).current;

    return (
        <View
            {...panResponder.panHandlers}
            ref={mainButtonRef}
            onLayout={handleMainButtonLayout}
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
            {isLongPressed && (
                <View style={[styles.longPressedContent]}>
                    <View
                        ref={redButtonRef}
                        style={[styles.longPressedContentLeft]}
                    >
                        <Text>
                            <Feather name="trash" size={'reminder_days' in item ? 64 : 32} color="#FFFFFF" />
                        </Text>
                    </View>
                    <View
                        ref={greenButtonRef}
                        style={[styles.longPressedContentRight]}
                    >
                        <Text>
                            {item.completed ? (
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
