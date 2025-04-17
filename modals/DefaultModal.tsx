import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Pressable, Modal } from "react-native";
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { colors } from '../lib/colors';
import { DefaultModalProps } from '../types/defaultModalProps';
import { useModal } from '@/hooks/useModal';
interface Props extends DefaultModalProps {
    isVisible: boolean;
}

export default function DefaultModal({ theme = 'dark', isVisible, ...props }: Props) {
    if (!isVisible) return null;
    const { closeModal } = useModal();

    return (
        <Pressable style={styles.container} onPress={() => { props.onClose() }}>
            {/* <Modal visible={isVisible} animationType='fade'> */}
                <View style={styles.contentContainer}>
                    <TouchableOpacity style={[styles.button, theme === 'light' ? styles.buttonLight : styles.buttonDark]} onPress={() => { props.onConfirm() }}>
                        <Feather name='check' size={24} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                        <Text style={[styles.modalText, theme === 'light' ? styles.modalTextLight : styles.modalTextDark]}>{props.primaryCTA}</Text>
                    </TouchableOpacity>
                    <View style={styles.modalDivider} />
                    <TouchableOpacity style={[styles.button, theme === 'light' ? styles.buttonLight : styles.buttonDark]} onPress={() => { props.onCancel() }}>
                        <Feather name='x' size={24} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
                        <Text style={[styles.modalText, theme === 'light' ? styles.modalTextLight : styles.modalTextDark]}>{props.secondaryCTA}</Text>
                    </TouchableOpacity>
                </View>
            {/* </Modal> */}
        </Pressable>
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
        // height: 150,
        position: 'absolute',
        // bottom: 0,
        // left: 0,
        // right: 0,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.light_theme.background,
        borderRadius: 16,
    },
    button: {
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
