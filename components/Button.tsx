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
    variant?: 'primary' | 'secondary';
    theme?: 'dark' | 'light';
    onPress?: () => void;
};

export default function Button({ label, icon, onPress, variant = 'secondary', theme = 'dark' }: Props) {
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
        backgroundColor: variant === 'primary'
            ? interpolateColor(
                pressProgress.value,
                [0, 1],
                theme === 'dark' ? [colors.dark_theme.button_primary_bg, colors.dark_theme.button_disabled_bg] : [colors.light_theme.button_primary_bg, colors.light_theme.button_disabled_bg]
            )
            : undefined,
    }));

    const primaryTextStyle = useAnimatedStyle(() => ({
        color: variant === 'primary'
            ? interpolateColor(
                pressProgress.value,
                [0, 1],
                theme === 'dark' ? [colors.dark_theme.button_primary_text, '#FFF'] : [colors.light_theme.button_primary_text, colors.light_theme.button_primary_text]
            )
            : undefined,
    }));

    // For a secondary button:
    // - The background color transitions from the default to a much lighter gray.
    // - The text color is also adjusted to a lighter gray.
    const secondaryBackgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: variant === 'secondary'
            ? interpolateColor(
                pressProgress.value,
                [0, 1],
                theme === 'dark' ? [colors.dark_theme.secondary_background, colors.dark_theme.tertiary_background] : [colors.light_theme.secondary_background, colors.light_theme.tertiary_background]
            )
            : undefined,
    }));

    const secondaryTextStyle = useAnimatedStyle(() => ({
        color: variant === 'secondary'
            ? interpolateColor(
                pressProgress.value,
                [0, 1],
                theme === 'dark' ? [colors.dark_theme.button_secondary_text, colors.dark_theme.text_secondary] : [colors.light_theme.button_secondary_text, colors.light_theme.text_secondary]
            )
            : undefined,
    }));

    // Choose animated styles based on variant.
    const animatedBackgroundStyle = variant === 'primary' ? primaryBackgroundStyle : secondaryBackgroundStyle;
    const animatedTextStyle = variant === 'primary' ? primaryTextStyle : secondaryTextStyle;

    // Combine styles with static ones.
    const buttonStyles = [
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
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
                    {icon && (
                        <FontAwesome
                            name={icon as keyof typeof FontAwesome.glyphMap}
                            size={18}
                            // Use the default text color for rendering icons.
                            color={variant === 'primary' ? theme === 'dark' ? colors.dark_theme.button_primary_text : colors.light_theme.button_primary_text : theme === 'dark' ? colors.dark_theme.button_secondary_text : colors.light_theme.button_secondary_text}
                            style={styles.buttonIcon}
                        />
                    )}
                    <Animated.Text style={[styles.buttonLabel, animatedTextStyle]}>
                        {label}
                    </Animated.Text>
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
        paddingHorizontal: 12,
    },
    // A full-size pressable container.
    pressable: {
        width: '100%',
        height: '100%',
    },
    primaryButton: {
        // Static styles for primary buttons.
        borderRadius: 40,
    },
    secondaryButton: {
        // Static styles for secondary buttons.
        borderRadius: 40,
        borderWidth: 1,
        borderColor: colors.dark_theme.tertiary_background,
    },
    button: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
});
