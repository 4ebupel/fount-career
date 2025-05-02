import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Pressable } from "react-native";
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { colors } from '../lib/colors';
import { DefaultModalProps } from '../types/defaultModalProps';
import { useModal } from '@/hooks/useModal';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
interface Props extends DefaultModalProps {
    isVisible: boolean;
}

export default function AddGoalModal({ theme = 'dark', isVisible, ...props }: Props) {
    if (!isVisible) return null;
    const { closeModal, openModal } = useModal();

    const handleSelfMadeGoalPress = () => {
        closeModal();
        openModal({
            modalName: 'GoalCreationTutorialModal',
            props: {
                content: '',
                description: '',
                title: '',
                primaryCTA: '',
                secondaryCTA: '',
                theme,
                onClose: function (): void {
                    console.log('Function not implemented.');
                },
                onConfirm: function (): void {
                    console.log('Function not implemented.');
                },
                onCancel: function (): void {
                    console.log('Function not implemented.');
                }
            }
        });
    }

    return (
        <Animated.View
            style={styles.container}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
        >
            <Pressable style={styles.overlay} onPress={() => { props.onClose() }}>
                <Animated.View
                    style={[styles.contentContainer, theme === 'light' ? styles.modalLight : styles.modalDark]}
                    entering={FadeIn.duration(200).delay(100)}
                    exiting={FadeOut.duration(200)}
                >
                    <View style={[styles.container, theme === 'light' ? { backgroundColor: colors.light_theme.background } : { backgroundColor: colors.dark_theme.background }]}>
                        <TouchableOpacity style={[styles.button, theme === 'light' ? styles.buttonLight : styles.buttonDark]} onPress={() => { console.log('Goal Templates Pressed') }}>
                            <Feather name='file-text' size={24} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                            <Text style={[styles.modalText, theme === 'light' ? styles.modalTextLight : styles.modalTextDark]}>Goal Templates</Text>
                        </TouchableOpacity>
                        <View style={styles.modalDivider} />
                        <TouchableOpacity style={[styles.button, theme === 'light' ? styles.buttonLight : styles.buttonDark]} onPress={handleSelfMadeGoalPress}>
                            <FontAwesome5 name={theme === 'light' ? 'user' : 'user-alt'} size={24} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                            <Text style={[styles.modalText, theme === 'light' ? styles.modalTextLight : styles.modalTextDark]}>Self-made Goal</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Pressable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: -200,
        left: 120,
        right: -120,
        flex: 1,
        gap: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 18,
    },
    contentContainer: {
        flex: 1,
        flexGrow: 1,
        position: 'absolute',
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        width: 350,
        gap: 16,
        backgroundColor: colors.light_theme.background,
        borderRadius: 16,
    },
    button: {
        flexDirection: 'row',
        gap: 16,
        padding: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLight: {
        backgroundColor: 'transparent',
    },
    buttonDark: {
        backgroundColor: 'transparent',
    },
    buttonIconContainer: {
        padding: 6,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal1: {
        position: 'absolute',
        gap: 16,
        padding: 24,
        borderRadius: 16,
        width: 250,
        elevation: 5,
    },
    modal: {
        gap: 16,
        padding: 24,
        borderRadius: 16,
        width: 250,
        height: 150,
        elevation: 5,
    },
    modalLight: {
        backgroundColor: colors.light_theme.background,
    },
    modalDark: {
        backgroundColor: colors.dark_theme.background,
    },
    modalText: {
        fontSize: 18,
        fontWeight: '600'
    },
    modalTextLight: {
        color: colors.light_theme.text_primary,
    },
    modalTextDark: {
        color: colors.dark_theme.text_primary,
    },
    modalDivider: {
        height: 1,
        width: '100%',
    },
    modalDividerLight: {
        backgroundColor: colors.light_theme.border_input,
    },
    modalDividerDark: {
        backgroundColor: colors.dark_theme.border_input,
    },
});
