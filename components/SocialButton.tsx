import React from 'react';
import { StyleSheet, View, Pressable } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolateColor
} from 'react-native-reanimated';
import { colors } from "@/lib/colors";

type Props = {
    label: string;
    icon?: string;
    theme?: 'dark' | 'light';
    onPress?: () => void;
};

export default function SocialButton({ label, icon, onPress, theme = 'dark' }: Props) {
    // One shared value to track the press state (0 = unpressed, 1 = pressed)
    const pressProgress = useSharedValue(0);

    const handlePressIn = () => {
        pressProgress.value = withTiming(1, { duration: 200 });
    };

    const handlePressOut = () => {
        pressProgress.value = withTiming(0, { duration: 200 });
    };

    // For a primary button:
    // - The background color transitions from the default to a dimmed color.
    // - The text color transitions from its default to pure white.
    const primaryBackgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            pressProgress.value,
            [0, 1],
            theme === 'dark' ? [colors.dark_theme.secondary_background, colors.dark_theme.tertiary_background] : [colors.light_theme.background, colors.light_theme.tertiary_background]
        )
    }));

    const primaryTextStyle = useAnimatedStyle(() => ({
        color: interpolateColor(
            pressProgress.value,
            [0, 1],
            theme === 'dark' ? [colors.dark_theme.text_primary, colors.dark_theme.text_secondary] : [colors.light_theme.text_primary, colors.light_theme.text_secondary]
        )
    }));

    // Choose animated styles based on variant.
    const animatedBackgroundStyle = primaryBackgroundStyle;
    const animatedTextStyle = primaryTextStyle;

    // Combine styles with static ones.
    const buttonStyles = [
        styles.button,
        theme === 'dark' ? { borderColor: colors.dark_theme.tertiary_background } : { borderColor: colors.light_theme.tertiary_background },
        animatedBackgroundStyle,
    ];

    return (
        <View style={styles.buttonContainer}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                style={styles.pressable}
            >
                <Animated.View style={buttonStyles}>
                    <View style={styles.contentContainer}>
                        {icon && (
                            <FontAwesome
                                name={icon as keyof typeof FontAwesome.glyphMap}
                                size={24}
                                color={theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary}
                                style={styles.buttonIcon}
                            />
                        )}
                        <Animated.Text style={[styles.buttonLabel, animatedTextStyle]}>
                            {label}
                        </Animated.Text>
                    </View>
                </Animated.View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: '100%',
        height: 58,
        alignItems: 'center',
        justifyContent: 'center',
        // paddingHorizontal: 12,
    },
    pressable: {
        width: '100%',
        height: '100%',
    },
    button: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        borderWidth: 1,
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        paddingHorizontal: 16,
    },
    buttonIcon: {
        position: 'absolute',
        left: 16,
    },
    buttonLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
});
