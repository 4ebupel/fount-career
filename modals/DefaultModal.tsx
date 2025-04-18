import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors } from '../lib/colors';
import { DefaultModalProps } from '../types/defaultModalProps';
import { useModal } from '@/hooks/useModal';
import Button from '@/components/Button';
interface Props extends DefaultModalProps {
    isVisible: boolean;
}

export default function DefaultModal({ theme = 'dark', isVisible, ...props }: Props) {
    if (!isVisible) return null;
    const { closeModal } = useModal();

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
                    <Text style={styles.modalTitle}>{props.title || 'Are you sure?'}</Text>
                    <Text style={styles.modalDescription}>{props.description || 'Some serious stuff here'}</Text>
                    <View style={styles.buttonRow}>
                        <View style={styles.buttonContainer}>
                            <Button
                                label={props.primaryCTA || 'Confirm'}
                                theme={theme}
                                onPress={props.onConfirm}
                                variant="primary"
                                disabled={!props.primaryCTA}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button
                                label={props.secondaryCTA || 'Cancel'}
                                theme={theme}
                                onPress={props.onCancel}
                                variant="secondary"
                            />
                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: colors.light_theme.overlay_background,
        justifyContent: 'center',
        alignItems: 'center',
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
    buttonRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        marginTop: 10,
    },
    buttonContainer: {
        maxWidth: '100%',
        width: 'auto',
        flexGrow: 1,
        flex: 1,
    },
    button: {
        width: 100,
        flexDirection: 'row',
        gap: 10,
        padding: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLight: {
        backgroundColor: 'transparent',
    },
    buttonDark: {
        backgroundColor: colors.dark_theme.button_primary_bg,
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
    modalLight: {
        backgroundColor: colors.light_theme.background,
    },
    modalDark: {
        backgroundColor: colors.dark_theme.background,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    modalDescription: {
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'center',
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
