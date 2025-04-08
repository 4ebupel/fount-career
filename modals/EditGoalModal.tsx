import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions, Keyboard, TouchableWithoutFeedback } from "react-native";
import { colors } from '@/lib/colors';
import { DefaultModalProps } from '@/types/defaultModalProps';
import Button from '@/components/Button';
import { AntDesign } from '@expo/vector-icons';
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
import LastDetails from '@/components/goalCreationTutorial/LastDetails';
import { Goal } from '@/types/database';
const { height } = Dimensions.get('window');
const paddingHorizontal = 24;
const SWIPE_THRESHOLD = 100; // Minimum downward drag required to close the modal

// Create an Animated version of the View for the container
const AnimatedView = Animated.createAnimatedComponent(View);

interface Props extends DefaultModalProps {
    isVisible: boolean,
    goal?: Goal,
}

export default function EditGoalModal({
    theme = 'light',
    isVisible,
    goal,
    onClose,
    onConfirm,
}: Props) {
    if (!isVisible) return null;

    const [editedGoal, setEditedGoal] = useState<Goal>(goal || {} as Goal);

    // Shared value for container height
    const containerHeight = useSharedValue(height * 0.8);

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

    const handleConfirm = () => {
        onConfirm(editedGoal);
        safeCloseModal();
    };

    const handleCancel = () => {
        safeCloseModal();
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
                        runOnJS(handleCancel)();
                    }
                });
            } else {
                // Otherwise, snap back to the original position
                translateY.value = withTiming(0, { duration: 200 });
            }
            isSwipingVertically.value = false;
        });

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
                    { height: containerHeight },
                    theme === 'light'
                        ? { backgroundColor: colors.light_theme.background }
                        : { backgroundColor: colors.dark_theme.background }
                ]}
                entering={SlideInDown.duration(300)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.dismissableContainer}>
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
                            <LastDetails
                                theme={theme}
                                goal={editedGoal}
                                setGoal={setEditedGoal}
                                isTitleEditable={true}
                            />
                            {/* Button row */}
                            <View style={styles.buttonRow}>
                                <View style={styles.buttonContainer}>
                                    <Button
                                        label="Save"
                                        theme={theme}
                                        onPress={handleConfirm}
                                        variant="primary"
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
                    </View>
                </TouchableWithoutFeedback>
            </AnimatedView>
        </Animated.View >
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
    dismissableContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        paddingHorizontal,
        // paddingTop: 15,
        // paddingBottom: 30,
        // gap: 20,
        alignItems: 'center',
        // justifyContent: 'space-between',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        // paddingHorizontal,
        paddingTop: 15,
        paddingBottom: 30,
        gap: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
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
    scrollContainer: {
        flex: 1,
    },
    categoryItem: {
        paddingVertical: 16,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    categoryText: {
        fontSize: 18,
        fontWeight: '500',
    },
    dividerContainer: {
        width: '100%',
    },
    divider: {
        width: '100%',
        height: 1,
    },
    buttonRow: {
        width: '100%',
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