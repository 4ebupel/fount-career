import { colors } from "@/lib/colors";
import { StyleSheet, View, Image, TextInput, Text, Platform } from "react-native";
import { useState } from "react";
import { Goal } from "@/types/database";
import React from "react";
const image = require('@/assets/goalCreationTutorialStepOne.png')

interface Props {
    theme: 'dark' | 'light',
    goal: Goal,
    setGoal: (goal: Goal) => void,
}

const inputPlaceholder = "e.g. 'Learn React Native and build 3 apps by end of 2025'";

export default function StepOne({ theme, goal, setGoal }: Props) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.headingContainer}>
                <Text style={[styles.title, theme === 'light' ? styles.textLight : styles.textDark]}>
                    Step 1: Specific
                </Text>
                <Text style={[styles.description, theme === 'light' ? styles.textLight : styles.textDark]}>
                    Is your goal specific enough?
                </Text>
            </View>
            <View style={[styles.divider, theme === 'light' ? styles.dividerLight : styles.dividerDark]} />
            <Image style={styles.picture} source={image} />
            <View style={[styles.divider, theme === 'light' ? styles.dividerLight : styles.dividerDark]} />
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, theme === 'light' ? styles.inputLight : styles.inputDark, isFocused && (styles.inputFocused, theme === 'light' ? styles.inputFocusedLight : styles.inputFocusedDark)]}
                    placeholder={inputPlaceholder}
                    multiline={true}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    value={goal.title}
                    onChangeText={(text) => setGoal({ ...goal, title: text })}
                />
            </View>
            <View style={styles.examplesContainer}>
                <Text style={[styles.examplesTitle, theme === 'light' ? styles.textLight : styles.textDark]}>
                    Examples:
                </Text>
                <Text style={[styles.examplesText, theme === 'light' ? styles.textLight : styles.textDark]}>
                    ❌ "Get better at coding"
                </Text>
                <Text style={[styles.examplesText, theme === 'light' ? styles.textLight : styles.textDark]}>
                    ✅ "Learn React and build 3 projects"
                </Text>
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
    headingContainer: {
        gap: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'center',
    },
    textLight: {
        color: colors.light_theme.text_primary,
    },
    textDark: {
        color: colors.dark_theme.text_primary,
    },
    divider: {
        width: '100%',
        height: 1,
    },
    dividerLight: {
        backgroundColor: colors.light_theme.tertiary_background,
    },
    dividerDark: {
        backgroundColor: colors.dark_theme.tertiary_background,
    },
    picture: {
        maxHeight: '35%',
        maxWidth: '40%',
        resizeMode: 'contain',
    },
    inputContainer: {
        width: '100%',
        marginBottom: Platform.OS === 'ios' ? 8 : 4,
    },
    input: {
        minHeight: 90,
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 8,
        textAlign: 'center',
        borderRadius: 8,
    },
    inputLight: {
        backgroundColor: colors.light_theme.secondary_background,
        color: colors.light_theme.text_primary,
    },
    inputDark: {
        backgroundColor: colors.dark_theme.secondary_background,
        color: colors.dark_theme.text_primary,
    },
    inputFocused: {
        borderWidth: 2,
    },
    inputFocusedLight: {
        borderColor: colors.light_theme.text_accent,
    },
    inputFocusedDark: {
        borderColor: colors.dark_theme.text_accent,
    },
    examplesContainer: {
        width: '100%',
        gap: 4,
    },
    examplesTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    examplesText: {
        fontSize: 14,
        fontWeight: '400',
    },
});
