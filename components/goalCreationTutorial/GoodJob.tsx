import { colors } from "@/lib/colors";
import React from "react";
import { StyleSheet, View, Image, Text, Platform } from "react-native";

const image = require('@/assets/goalCreationTutorialFinal.png')

interface Props {
    theme: 'dark' | 'light',
}

export default function GoodJob({ theme }: Props) {
    return (
        <View style={styles.container}>
            <Text style={[styles.title, theme === 'light' ? styles.textLight : styles.textDark]}>
                Good Job!
            </Text>
            <Text style={[styles.description, theme === 'light' ? styles.textLight : styles.textDark]}>
                Your goal is now SMART!
            </Text>
            <Text style={[styles.description, theme === 'light' ? styles.textLight : styles.textDark]}>
                Let's make it even more achievable by <Text style={[styles.description_bold, theme === 'light' ? styles.textLight : styles.textDark]}>breaking it into smaller, actionable steps.</Text>
            </Text>
            <View style={[styles.divider, theme === 'light' ? styles.dividerLight : styles.dividerDark]} />
            <View style={styles.pictureContainer}>
                <Image style={styles.picture} source={image} />
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
    description_bold: {
        fontWeight: '700',
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
    pictureContainer: {
        width: '100%',
        height: 300, // Set fixed height instead of 100%
        alignItems: 'center',
        justifyContent: 'center',
    },
    picture: {
        height: '100%', // Use fixed height
        width: '100%',
        resizeMode: 'contain',
    },
});
