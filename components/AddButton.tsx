import { TouchableOpacity, StyleSheet } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { colors } from "../lib/colors";
import React from "react";

type Props = {
    onPress: () => void;
    theme?: 'dark' | 'light';
}

export default function AddButton({ onPress, theme = 'dark' }: Props) {
    return (
        <TouchableOpacity style={[styles.button, theme === 'dark' ? styles.button_dark : styles.button_light]} onPress={onPress}>
            <Feather name="plus" size={28} color={theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderRadius: 100,
        padding: 14,
    },
    button_dark: {
        backgroundColor: colors.dark_theme.button_primary_bg,
    },
    button_light: {
        backgroundColor: colors.light_theme.button_primary_bg,
    }
})
