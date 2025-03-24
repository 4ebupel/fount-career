import { colors } from "@/lib/colors";
import { StyleSheet, View, Image, TextInput, Text, Platform } from "react-native";
import { useState } from "react";
import { Goal } from "@/types/database";

const image = require('@/assets/goalCreationTutorialStepFive.png')

interface Props {
    theme: 'dark' | 'light',
    goal: Goal,
    setGoal: (goal: Goal) => void,
}

const inputPlaceholder = "e.g. 'Learn React Native and build 3 apps by end of 2025'";

export default function StepFive({ theme, goal, setGoal }: Props) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.headingContainer}>
                <Text style={styles.title}>
                    Step 5: Time-bound
                </Text>
                <Text style={styles.description}>
                    Did you set a deadline to create a sense of urgency?
                </Text>
            </View>
            <View style={styles.divider} />
            <Image style={styles.picture} source={image} />
            <View style={styles.divider} />
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, isFocused && styles.inputFocused]}
                    placeholder={inputPlaceholder}
                    multiline={true}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    value={goal.title}
                    onChangeText={(text) => setGoal({ ...goal, title: text })}
                />
            </View>
            <View style={styles.examplesContainer}>
                <Text style={styles.examplesTitle}>
                    Examples:
                </Text>
                <Text style={styles.examplesText}>
                    ❌ "Eventually learn Spanish"
                </Text>
                <Text style={styles.examplesText}>
                    ✅ "Reach B1 Spanish level by December"
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
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: colors.light_theme.tertiary_background,
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
        backgroundColor: colors.light_theme.secondary_background,
        textAlign: 'center',
        borderRadius: 8,
    },
    inputFocused: {
        borderWidth: 2,
        borderColor: colors.light_theme.text_accent,
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
