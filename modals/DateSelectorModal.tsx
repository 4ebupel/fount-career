import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { colors } from '@/lib/colors';
import { DefaultModalProps } from '@/types/defaultModalProps';
import Button from '@/components/Button';
import { AntDesign } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    runOnJS,
    FadeIn, 
    FadeOut, 
    SlideInDown 
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const paddingHorizontal = 24;
const SWIPE_THRESHOLD = 100; // Minimum downward drag required to close the modal

// Create an Animated version of the View for the container
const AnimatedView = Animated.createAnimatedComponent(View);

interface Props extends DefaultModalProps {
    isVisible: boolean;
    onSelectDate?: (date: string) => void; // Format: YYYY-MM-DD
}

export default function DateSelectorModal({ 
    theme = 'dark', 
    isVisible, 
    onSelectDate = () => {},
    onClose,
    onConfirm,
    title,
}: Props) {
    if (!isVisible) return null;
    
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Prepare marked dates for the calendar
    const markedDates = selectedDate 
        ? { 
            [selectedDate]: { 
                selected: true, 
                selectedColor: theme === 'light' 
                    ? colors.light_theme.text_accent 
                    : colors.dark_theme.text_accent 
            } 
        } 
        : {};
    
    // Calculate dynamic height
    const getContainerHeight = () => {
        // Calendar needs more space than the category list
        return Math.min(height * 0.7, height * 0.9);
    };
    
    // Shared value for container height
    const containerHeight = useSharedValue(getContainerHeight());
    
    // Shared value for vertical translation
    const translateY = useSharedValue(0);
    
    // Track if we're in a vertical swipe
    const isSwipingVertically = useSharedValue(false);
    
    // Animated style for vertical translation
    const gestureAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));
    
    // Safe close function that can be called from the JS thread
    const safeCloseModal = () => {
        if (onClose) {
            onClose();
        }
    };
    
    // Function to animate modal closure
    const animateClose = () => {
        translateY.value = withTiming(height, { duration: 300 }, (finished) => {
            if (finished) {
                runOnJS(safeCloseModal)();
            }
        });
    };
    
    // Define the vertical pan gesture for the header area - EXACTLY like in GoalCreationTutorialModal
    const headerPanGesture = Gesture.Pan()
        .onBegin(() => {
            isSwipingVertically.value = true;
        })
        .onUpdate((event) => {
            // Only allow downward movement
            translateY.value = event.translationY < 0 ? 0 : event.translationY;
        })
        .onEnd(() => {
            if (translateY.value > SWIPE_THRESHOLD) {
                // If dragged down enough, close the modal
                translateY.value = withTiming(height, { duration: 300 }, (finished) => {
                    if (finished) {
                        runOnJS(safeCloseModal)();
                    }
                });
            } else {
                // Otherwise, snap back to the original position
                translateY.value = withTiming(0, { duration: 200 });
            }
            isSwipingVertically.value = false;
        });
    
    const handleSelectDate = (date: DateData) => {
        setSelectedDate(date.dateString);
    };
    
    const handleConfirm = () => {
        if (onSelectDate && selectedDate) {
            onSelectDate(selectedDate);
            onConfirm(selectedDate);
        }
        safeCloseModal();
    };
    
    const handleCancel = () => {
        safeCloseModal();
    };
    
    return (
        <Animated.View 
            style={styles.overlay} 
            exiting={FadeOut.duration(200)} 
            entering={FadeIn.duration(200)}
        >
            <AnimatedView 
                style={[
                    styles.container, 
                    gestureAnimatedStyle, 
                    { height: getContainerHeight() },
                    theme === 'light' 
                        ? { backgroundColor: colors.light_theme.background } 
                        : { backgroundColor: colors.dark_theme.background }
                ]} 
                entering={SlideInDown.duration(300)}
            >
                {/* Header with pill - ONLY this part has gesture detection */}
                <GestureDetector gesture={headerPanGesture}>
                    <View style={styles.header}>
                        <View style={styles.headerCloseIcon} />
                        <View style={[
                            styles.headerBar,
                            theme === 'light' 
                                ? { backgroundColor: colors.light_theme.tertiary_background } 
                                : { backgroundColor: colors.dark_theme.tertiary_background }
                        ]} />
                        <View style={styles.headerCloseIcon} />
                    </View>
                </GestureDetector>

                <View style={styles.contentContainer}>
                    {/* Title */}
                    <Text style={[
                        styles.headerText,
                        theme === 'light' 
                            ? { color: colors.light_theme.text_primary } 
                            : { color: colors.dark_theme.text_primary }
                    ]}>
                        {title || 'Select a Due Date'}
                    </Text>
                    
                    {/* Calendar */}
                    <View style={styles.calendarContainer}>
                        <Calendar
                            minDate={today}
                            onDayPress={handleSelectDate}
                            markedDates={markedDates}
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: theme === 'light' 
                                    ? colors.light_theme.text_secondary 
                                    : colors.dark_theme.text_secondary,
                                selectedDayBackgroundColor: theme === 'light' 
                                    ? colors.light_theme.text_accent 
                                    : colors.dark_theme.text_accent,
                                selectedDayTextColor: theme === 'light' 
                                    ? colors.light_theme.background 
                                    : colors.dark_theme.background,
                                todayTextColor: theme === 'light' 
                                    ? colors.light_theme.text_accent 
                                    : colors.dark_theme.text_accent,
                                dayTextColor: theme === 'light' 
                                    ? colors.light_theme.text_primary 
                                    : colors.dark_theme.text_primary,
                                textDisabledColor: theme === 'light' 
                                    ? colors.light_theme.text_disabled 
                                    : colors.dark_theme.text_disabled,
                                dotColor: theme === 'light' 
                                    ? colors.light_theme.text_accent 
                                    : colors.dark_theme.text_accent,
                                selectedDotColor: theme === 'light' 
                                    ? colors.light_theme.background 
                                    : colors.dark_theme.background,
                                arrowColor: theme === 'light' 
                                    ? colors.light_theme.text_accent 
                                    : colors.dark_theme.text_accent,
                                monthTextColor: theme === 'light' 
                                    ? colors.light_theme.text_primary 
                                    : colors.dark_theme.text_primary,
                                textMonthFontWeight: '700',
                                textDayFontSize: 16,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 14
                            }}
                        />
                    </View>
                    
                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={[
                            styles.divider,
                            theme === 'light' 
                                ? { backgroundColor: colors.light_theme.tertiary_background }
                                : { backgroundColor: colors.dark_theme.tertiary_background }
                        ]} />
                    </View>
                    
                    {/* Button row */}
                    <View style={styles.buttonRow}>
                        <View style={styles.buttonContainer}>
                            <Button 
                                label="Select" 
                                theme={theme} 
                                onPress={handleConfirm} 
                                variant="primary" 
                                disabled={!selectedDate}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button 
                                label="Cancel" 
                                theme={theme} 
                                onPress={handleCancel} 
                                variant="secondary" 
                            />
                        </View>
                    </View>
                </View>
            </AnimatedView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: colors.light_theme.overlay_background,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        flexDirection: 'column',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal,
        paddingTop: 15,
        paddingBottom: 20,
        gap: 20,
    },
    header: {
        minHeight: 32,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal,
        paddingTop: 10,
        paddingBottom: 5,
    },
    headerBar: {
        width: '15%',
        height: 3,
        borderRadius: 32,
    },
    headerCloseIcon: {
        width: 24,
    },
    headerText: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
    },
    calendarContainer: {
        flex: 1,
        width: '100%',
    },
    dividerContainer: {
        width: '100%',
    },
    divider: {
        width: '100%',
        height: 1,
    },
    buttonRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        gap: 16,
        marginTop: 10,
    },
    buttonContainer: {
        maxWidth: '100%',
        width: 'auto',
        flexGrow: 1,
        flex: 1,
    },
}); 