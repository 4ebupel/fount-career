import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/lib/colors";
import { ReminderRelativeTimeType } from "@/types/database";
import { CATEGORY_SELECTOR_MODAL } from "@/lib/modals";
import { useModal } from "@/hooks/useModal";
import { isValidRelativeReminderTime } from "@/lib/database-utils";

interface Props {
    isDisabled: boolean;
    selectedTime: string;
    theme: 'dark' | 'light';
    timeType?: 'rel' | 'abs';
    setSelectedTime: (value: ReminderRelativeTimeType | string) => void;
}


export default function TimePickerButton({ isDisabled, selectedTime, theme, timeType = 'abs', setSelectedTime }: Props) {
    const [showTimePicker, setShowTimePicker] = useState(false);
    const { openModal, closeModal } = useModal();

    const reminderTimes: ReminderRelativeTimeType[] = useMemo(() => [
        'Two weeks before the deadline',
        'One week before the deadline',
        'Two days before the deadline',
        'One day before the deadline',
        'On the deadline',
        'Never',
    ], []);

    const onChangeTime = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        if (!selectedDate) {
            return;
        }
        const currentDate = selectedDate;
        const time = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        setShowTimePicker(false);
        setSelectedTime(time);
        console.log('onChangeTime', event, 'selectedDate', selectedDate, 'currentDate', currentDate, 'time', time);
    };

    const handleReminderTimePress = () => {
        openModal({
            modalName: CATEGORY_SELECTOR_MODAL,
            props: {
                theme,
                categories: reminderTimes,
                onSelectCategory: (selectedCategory: string) => {
                    if (isValidRelativeReminderTime(selectedCategory)) {
                        setSelectedTime(selectedCategory);
                    } else {
                        setSelectedTime('Never');
                    }
                },
                title: 'Remind me...',
                onConfirm: (category: string) => {
                    if (isValidRelativeReminderTime(category)) {
                        setSelectedTime(category);
                    } else {
                        setSelectedTime('Never');
                    }
                },
                onCancel: () => { },
                onClose: () => closeModal(),
            }
        });
    };

    return (
        <View>
            <TouchableOpacity
                disabled={isDisabled}
                onPress={() => !isDisabled && timeType === 'abs' ? setShowTimePicker(true) : handleReminderTimePress()}
                style={[
                    styles.categoryContainer,
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
                    styles.text,
                    theme === 'dark' ? styles.textDark : styles.textLight,
                ]}>
                    {selectedTime}
                </Text>
                <AntDesign
                    name="clockcircleo"
                    size={20}
                    color={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary}
                />
            </TouchableOpacity>

            {showTimePicker ? (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={new Date()}
                    mode={'time'}
                    display='default'
                    is24Hour={true}
                    onChange={onChangeTime}
                />
            ) : null}
        </View>
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