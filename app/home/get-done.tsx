import { useState, useContext } from "react";
import { View, Text, StyleSheet, Image, SafeAreaView, Pressable } from "react-native";
import WeeklyCalendarHeader from "@/components/WeeklyCalendarHeader";
import { colors } from "@/lib/colors";
import { ThemeContext } from "@/contexts/ThemeContext";
import { PaperProvider } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useModal } from "@/hooks/useModal";
export default function MyGoals() {
    const [progressData, setProgressData] = useState([45, 20, 33, 40, 12, 90, 70]);
    const { theme } = useContext(ThemeContext);
    const { openModal } = useModal();

    const onPress = () => {
        openModal({
            modalName: 'AddGoalModal',
            props: {
                title: 'Add Goal',
                description: 'Add a goal by clicking the (+) button below.',
                primaryCTA: 'Add Goal',
                secondaryCTA: 'Cancel',
                theme: theme,
                content: '',
                onClose: () => { },
                onConfirm: () => {
                    console.log('Confirm');
                },
                onCancel: () => {
                    console.log('Cancel');
                },
            }
        });
    }

    return (
        <PaperProvider>
            <SafeAreaView style={[
                styles.container,
                theme === 'dark' ? styles.containerDark : styles.containerLight
            ]}>
                <WeeklyCalendarHeader progressData={progressData} />
                <View style={styles.backgroundImageContainer}>
                    <Image
                        source={theme === 'dark'
                            ? require("@/assets/get-done-background-image-dark.png")
                            : require("@/assets/get-done-background-image-light.png")
                        }
                        style={styles.backgroundImage}
                        resizeMode="contain"
                    />
                    <View style={styles.backgroundTitleContainer}>
                        <Text style={[styles.backgroundTitle, theme === 'dark' ? styles.backgroundTitleDark : styles.backgroundTitleLight]}>You have no goals</Text>
                        <Text style={[styles.backgroundDescription, theme === 'dark' ? styles.backgroundDescriptionDark : styles.backgroundDescriptionLight]}>Add a goal by clicking the (+) button below.</Text>
                    </View>
                </View>
                {/* <Portal>
                    <AddGoalModal theme={theme} visible={visible} setVisible={setVisible} />
                </Portal> */}
                <Pressable
                    onPress={() => {
                        console.log('Pressed');
                        onPress();
                    }}
                    style={[
                        styles.button,
                        theme === 'light' ? styles.buttonLight : styles.buttonDark,
                    ]}
                >
                    <Feather name="plus" size={24} color={theme === 'light' ? colors.light_theme.button_primary_text : colors.dark_theme.button_primary_text} />
                </Pressable>
            </SafeAreaView>
        </PaperProvider >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLight: {
        backgroundColor: colors.light_theme.secondary_background,
    },
    containerDark: {
        backgroundColor: colors.dark_theme.background,
    },
    backgroundImageContainer: {
        flex: 1,
        gap: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        width: 160,
        height: 160,
    },
    backgroundTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    backgroundTitleLight: {
        color: colors.light_theme.text_primary,
    },
    backgroundTitleDark: {
        color: colors.dark_theme.text_primary,
    },
    backgroundDescription: {
        fontSize: 18,
        fontWeight: '400',
    },
    backgroundDescriptionLight: {
        color: colors.light_theme.text_primary,
    },
    backgroundDescriptionDark: {
        color: colors.dark_theme.text_primary,
    },
    backgroundTitleContainer: {
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        padding: 14,
        borderRadius: 100,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLight: {
        backgroundColor: colors.light_theme.button_primary_bg,
    },
    buttonDark: {
        backgroundColor: colors.dark_theme.button_primary_bg,
    },
    buttonIconContainer: {
        padding: 6,
    },
});
