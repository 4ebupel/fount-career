import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/lib/colors";

export default function TimePickerButton({ isDisabled, setShowTimePicker, selectedTime, theme }: { isDisabled: boolean, setShowTimePicker: (show: boolean) => void, selectedTime: string, theme: string }) {
    return !isDisabled ? (
        <TouchableOpacity
            style={[
                styles.timePickerButton,
                theme === 'dark'
                    ? {
                        backgroundColor: colors.dark_theme.secondary_background,
                        borderColor: colors.dark_theme.border_input
                    }
                    : {
                        backgroundColor: colors.light_theme.secondary_background,
                        borderColor: colors.light_theme.border_input
                    }
            ]}
            onPress={() => setShowTimePicker(true)}
        >
            <Text style={[
                styles.timeText,
                theme === 'dark'
                    ? { color: colors.dark_theme.text_primary }
                    : { color: colors.light_theme.text_primary }
            ]}>
                {selectedTime}
            </Text>
            <AntDesign
                name="clockcircleo"
                size={20}
                color={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary}
            />
        </TouchableOpacity>
    ) : (
        <View
            style={[
                styles.timePickerButton,
                theme === 'dark'
                    ? {
                        backgroundColor: colors.dark_theme.secondary_background,
                        borderColor: colors.dark_theme.border_input
                    }
                    : {
                        backgroundColor: colors.light_theme.secondary_background,
                        borderColor: colors.light_theme.border_input
                    }
            ]}
        >
            <Text style={[
                styles.timeText,
                theme === 'dark'
                    ? { color: colors.dark_theme.text_primary }
                    : { color: colors.light_theme.text_primary }
            ]}>
                {selectedTime}
            </Text>
            <AntDesign
                name="clockcircleo"
                size={20}
                color={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    timePickerButton: {
        height: 65,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeText: {
        fontSize: 18,
    },
});