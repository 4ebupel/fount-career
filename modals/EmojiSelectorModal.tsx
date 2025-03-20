import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, FlatList, Keyboard, TouchableWithoutFeedback } from "react-native";
import { colors } from '@/lib/colors';
import { DefaultModalProps } from '@/types/defaultModalProps';
import Button from '@/components/Button';
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

const { height, width } = Dimensions.get('window');
const paddingHorizontal = 24;
const SWIPE_THRESHOLD = 100; // Minimum downward drag required to close the modal

// Create an Animated version of the View for the container
const AnimatedView = Animated.createAnimatedComponent(View);

// Define emoji categories with emoji icons instead of icon components
const emojiCategories = [
    { id: 'recent', name: 'Recent', emoji: '🕒' },
    { id: 'smileys', name: 'Smileys', emoji: '😊' },
    { id: 'people', name: 'People', emoji: '👥' },
    { id: 'animals', name: 'Animals', emoji: '🐶' },
    { id: 'food', name: 'Food', emoji: '🍔' },
    { id: 'travel', name: 'Travel', emoji: '✈️' },
    { id: 'activities', name: 'Activities', emoji: '⚽' },
    { id: 'objects', name: 'Objects', emoji: '💡' },
    { id: 'symbols', name: 'Symbols', emoji: '❤️' },
    { id: 'flags', name: 'Flags', emoji: '🏁' }
];

// Common emojis grouped by category
const emojis = {
    recent: ['😀', '😍', '👍', '🎉', '🔥', '⭐', '❤️', '🙏', '🤔', '👋'],
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
    people: ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👵', '🧓', '👴', '👲', '👳‍♀️', '👳‍♂️', '🧕', '👮‍♀️', '👮‍♂️', '👷‍♀️', '👷‍♂️'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊'],
    food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆'],
    travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍', '🚨'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅'],
    objects: ['⌚', '📱', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    flags: ['🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸']
};

interface Props extends DefaultModalProps {
    isVisible: boolean;
    onSelectEmoji?: (emoji: string) => void;
    initialEmoji?: string; // Added to support pre-selected emoji
}

export default function EmojiSelectorModal({
    theme = 'dark',
    isVisible,
    onSelectEmoji = () => { },
    onClose,
    title = 'Select Emoji',
    initialEmoji = '',
}: Props) {
    if (!isVisible) return null;

    const [selectedEmoji, setSelectedEmoji] = useState<string>(initialEmoji);
    const [activeCategory, setActiveCategory] = useState('smileys');
    const floatingOpacity = useSharedValue(initialEmoji ? 1 : 0); // Show preview immediately if initialEmoji is provided
    const categoryScrollRef = useRef<ScrollView>(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [contentWidth, setContentWidth] = useState(0);
    
    // Calculate container height - slightly increased from previous value
    const getContainerHeight = () => {
        return Math.min(height * 0.7, height * 0.8); // Increased height
    };

    // Shared value for vertical translation
    const translateY = useSharedValue(0);

    // Track if we're in a vertical swipe
    const isSwipingVertically = useSharedValue(false);

    // If initial emoji is provided, show it immediately
    useEffect(() => {
        if (initialEmoji) {
            setSelectedEmoji(initialEmoji);
            floatingOpacity.value = 1;
        }
    }, [initialEmoji]);

    // Animated style for vertical translation
    const gestureAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    // Animated style for floating emoji preview
    const floatingEmojiStyle = useAnimatedStyle(() => {
        return {
            opacity: floatingOpacity.value,
            transform: [
                { scale: 0.8 + (floatingOpacity.value * 0.2) }
            ]
        };
    });

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

    // Setup the pan gesture handler for the header bar
    const headerPanGesture = Gesture.Pan()
        .onStart(() => {
            isSwipingVertically.value = true;
        })
        .onUpdate((event) => {
            // Only allow downward swipe
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > SWIPE_THRESHOLD) {
                // If dragged far enough, close the modal
                runOnJS(animateClose)();
            } else {
                // Otherwise snap back to original position
                translateY.value = withTiming(0, { duration: 200 });
            }
            isSwipingVertically.value = false;
        });

    const handleEmojiSelect = (emoji: string) => {
        setSelectedEmoji(emoji);
        // Add to recent emojis
        if (!emojis.recent.includes(emoji)) {
            emojis.recent = [emoji, ...emojis.recent.slice(0, 9)];
        }
        // Animate the floating emoji appearance
        floatingOpacity.value = withTiming(1, { duration: 300 });
    };

    const handleConfirm = () => {
        if (selectedEmoji) {
            onSelectEmoji(selectedEmoji);
        }
        safeCloseModal();
    };

    // Scroll to category
    const scrollToCategory = (index: number) => {
        if (categoryScrollRef.current) {
            categoryScrollRef.current.scrollTo({
                x: index * 100, // Approximate width of category button
                animated: true,
            });
        }
    };

    // Handle scroll event to update the scroll indicator position
    const handleScroll = (event: any) => {
        const xPos = event.nativeEvent.contentOffset.x;
        setScrollPosition(xPos);
    };

    // Calculate position and width of the scroll indicator
    const calculateScrollIndicator = () => {
        if (contentWidth === 0) return { left: 0, width: 30 };

        const containerWidth = width - (paddingHorizontal * 2);
        const indicatorContainerWidth = containerWidth * 0.5; // 50% of container width
        const ratio = indicatorContainerWidth / contentWidth;
        const indicatorWidth = Math.max(indicatorContainerWidth * ratio, 30); // Min width 30px
        
        // Calculate position (left offset)
        const maxScrollPosition = contentWidth - containerWidth;
        const percentScrolled = maxScrollPosition > 0 ? scrollPosition / maxScrollPosition : 0;
        const trackWidth = indicatorContainerWidth - indicatorWidth;
        const leftOffset = trackWidth * percentScrolled;
        
        return {
            left: leftOffset,
            width: indicatorWidth,
        };
    };

    const indicatorStyle = calculateScrollIndicator();
    
    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <Animated.View
                style={styles.overlay}
                exiting={FadeOut.duration(200)}
                entering={FadeIn.duration(200)}
            >
                {/* Floating emoji preview - positioned ABOVE the modal */}
                {selectedEmoji && (
                    <Animated.View style={[styles.floatingEmoji, floatingEmojiStyle]}>
                        <Text style={styles.floatingEmojiText}>{selectedEmoji}</Text>
                    </Animated.View>
                )}
                
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
                    <SafeAreaView style={{ flex: 1 }}>
                        {/* Header with pill - ONLY this part has gesture detection */}
                        <GestureDetector gesture={headerPanGesture}>
                            <View style={styles.header}>
                                <View style={[
                                    styles.headerBar,
                                    theme === 'light'
                                        ? { backgroundColor: colors.light_theme.tertiary_background }
                                        : { backgroundColor: colors.dark_theme.tertiary_background }
                                ]} />
                            </View>
                        </GestureDetector>
                        
                        {/* Title in its own row */}
                        <View style={styles.titleContainer}>
                            <Text style={[
                                styles.headerText,
                                theme === 'light'
                                    ? { color: colors.light_theme.text_primary }
                                    : { color: colors.dark_theme.text_primary }
                            ]}>
                                {title}
                            </Text>
                        </View>

                        <View style={styles.contentContainer}>
                            {/* Category tabs */}
                            <View style={styles.categoryWrapper}>
                                <ScrollView 
                                    ref={categoryScrollRef}
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.categoryContainer}
                                    contentContainerStyle={styles.categoryContentContainer}
                                    onScroll={handleScroll}
                                    scrollEventThrottle={16}
                                    onContentSizeChange={(width) => setContentWidth(width)}
                                >
                                    {emojiCategories.map((category, index) => {
                                        const isActive = activeCategory === category.id;
                                        return (
                                            <TouchableOpacity 
                                                key={category.id}
                                                style={[
                                                    styles.categoryButton,
                                                    isActive && styles.categoryButtonActive,
                                                    isActive && (
                                                        theme === 'light' 
                                                            ? { borderColor: colors.light_theme.text_accent }
                                                            : { borderColor: colors.dark_theme.text_accent }
                                                    )
                                                ]}
                                                onPress={() => {
                                                    setActiveCategory(category.id);
                                                    scrollToCategory(index);
                                                }}
                                            >
                                                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                                <Text 
                                                    style={[
                                                        styles.categoryText,
                                                        isActive && styles.categoryTextActive,
                                                        theme === 'light'
                                                            ? { color: colors.light_theme.text_secondary }
                                                            : { color: colors.dark_theme.text_secondary },
                                                        isActive && (
                                                            theme === 'light'
                                                                ? { color: colors.light_theme.text_accent }
                                                                : { color: colors.dark_theme.text_accent }
                                                        )
                                                    ]}
                                                >
                                                    {category.name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                                
                                {/* Dynamic scroll indicator below categories */}
                                <View style={[
                                    styles.scrollIndicatorBar,
                                    theme === 'light'
                                        ? { backgroundColor: colors.light_theme.tertiary_background }
                                        : { backgroundColor: colors.dark_theme.tertiary_background }
                                ]}>
                                    <View 
                                        style={[
                                            styles.activeScrollIndicator,
                                            {
                                                left: indicatorStyle.left,
                                                width: indicatorStyle.width
                                            },
                                            theme === 'light'
                                                ? { backgroundColor: colors.light_theme.text_accent }
                                                : { backgroundColor: colors.dark_theme.text_accent }
                                        ]}
                                    />
                                </View>
                            </View>

                            {/* Emoji grid */}
                            <FlatList
                                data={emojis[activeCategory as keyof typeof emojis]}
                                keyExtractor={(item, index) => `emoji-${index}`}
                                numColumns={7} // Reduced from 8 to make emojis larger
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        style={styles.emojiButton}
                                        onPress={() => handleEmojiSelect(item)}
                                    >
                                        <Text style={styles.emoji}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                style={styles.emojiGrid}
                            />

                            {/* Button Row */}
                            <View style={styles.buttonRow}>
                                <View style={styles.buttonContainer}>
                                    <Button
                                        label="Select"
                                        variant="primary"
                                        theme={theme}
                                        onPress={handleConfirm}
                                        disabled={!selectedEmoji}
                                    />
                                </View>
                                <View style={styles.buttonContainer}>
                                    <Button
                                        label="Cancel"
                                        variant="secondary"
                                        theme={theme}
                                        onPress={safeCloseModal}
                                    />
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </AnimatedView>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        zIndex: 1001, // Ensure modal is above other content
    },
    floatingEmoji: {
        position: 'absolute',
        top: height * 0.08, // Position much higher - less than 10% from the top
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 24,
        borderRadius: 24,
        zIndex: 1002, // Ensure floating emoji is above the modal
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 13,
    },
    floatingEmojiText: {
        fontSize: 64,
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal,
        paddingBottom: 20,
        gap: 15,
    },
    header: {
        height: 36,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    headerBar: {
        width: '15%',
        height: 4,
        borderRadius: 32,
    },
    titleContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        marginBottom: 4,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    categoryWrapper: {
        position: 'relative',
        height: 100, // Increased to accommodate the scroll indicator
    },
    categoryContainer: {
        flexDirection: 'row',
        maxHeight: 90,
    },
    categoryContentContainer: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    categoryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryButtonActive: {
        borderWidth: 2,
    },
    categoryEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
    },
    categoryTextActive: {
        fontWeight: '700',
    },
    scrollIndicatorBar: {
        height: 4,
        width: '50%', // Only show indicator for part of the width to indicate scrolling
        alignSelf: 'center',
        borderRadius: 2,
        marginTop: 4,
    },
    activeScrollIndicator: {
        height: '100%',
        position: 'absolute',
        borderRadius: 2,
    },
    emojiGrid: {
        flex: 1,
    },
    emojiButton: {
        width: (width - (paddingHorizontal * 2)) / 7, // Adjusted width for fewer columns
        height: 50, // Increased from 45
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 28, // Increased from 24
    },
    buttonRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        gap: 16,
        width: '100%',
        marginTop: 10,
        paddingBottom: 8,
    },
    buttonContainer: {
        maxWidth: '100%',
        width: 'auto',
        flexGrow: 1,
        flex: 1,
    }
}); 