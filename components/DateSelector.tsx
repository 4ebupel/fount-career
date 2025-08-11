import { colors } from "@/lib/colors";
import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useModal } from "@/hooks/useModal";
import { DATE_SELECTOR_MODAL } from "@/lib/modals";

interface Props {
    theme: 'dark' | 'light',
    date: string,
    isDisabled: boolean,
    onSelectDate: (date: string) => void,
    onConfirm?: () => void,
}

export default function DateSelector({ theme, date, isDisabled, onSelectDate, onConfirm = () => { } }: Props) {
    const { openModal, closeModal } = useModal();
    const handleDatePress = () => {
        openModal({
            modalName: DATE_SELECTOR_MODAL,
            props: {
                theme,
                onSelectDate,
                content: '',
                description: '',
                title: 'Choose Due Date',
                primaryCTA: '',
                secondaryCTA: '',
                onConfirm: onConfirm,
                onCancel: () => { },
                onClose: () => closeModal(),
            }
        });
    };

    return (
        <TouchableOpacity
            style={[styles.categoryContainer, theme === 'light' ? styles.containerLight : styles.containerDark]}
            onPress={!isDisabled ? handleDatePress : undefined}
            disabled={isDisabled}
        >
            <Text style={[
                styles.text,
                theme === 'light' ? styles.textLight : styles.textDark,
                date === 'Select a date' && (theme === 'light' ? styles.placeholderTextLight : styles.placeholderTextDark)
            ]}>
                {date}
            </Text>
            {date !== 'Select a date' && (
                <AntDesign
                    name="checkcircleo"
                    size={18}
                    color={theme === 'light'
                        ? colors.light_theme.text_accent
                        : colors.dark_theme.text_accent}
                />
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    containerLight: {
        backgroundColor: colors.light_theme.secondary_background,
    },
    containerDark: {
        backgroundColor: colors.dark_theme.secondary_background,
    },
    categoryContainer: {
        minHeight: 70,
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    textLight: {
        color: colors.light_theme.text_primary,
    },
    textDark: {
        color: colors.dark_theme.text_primary,
    },
    placeholderTextLight: {
        color: colors.light_theme.text_secondary,
        fontWeight: '400',
    },
    placeholderTextDark: {
        color: colors.dark_theme.text_secondary,
        fontWeight: '400',
    },
});