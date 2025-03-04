import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, Pressable, Dimensions, LayoutChangeEvent, TouchableOpacity } from "react-native";
// import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring } from 'react-native-reanimated';
// import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { Modal, Portal, Button, PaperProvider } from 'react-native-paper';
import { colors } from '../lib/colors';
import { DefaultModalProps } from '../types/defaultModalProps';
import { useModal } from '@/hooks/useModal';
interface Props extends DefaultModalProps {
    isVisible: boolean;
}

export default function AddGoalModal({ theme = 'dark', isVisible, }: Props) {
    if (!isVisible) return null;
    const { closeModal, openModal } = useModal();

    const handleSelfMadeGoalPress = () => {
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
        })
    }

    // // Manage the modal visibility
    // const [visible, setVisible] = useState(false);
    // We'll store the button's position so that we know where to position the modal
    // const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })
    // // Ref to access the button layout
    // const buttonRef = useRef<View>(null);
    // // Shared values for animation:
    // // translateX: will control horizontal movement.
    // // translateY: will control vertical placement.
    // // overlayOpacity: controls the background overlay fade.
    // const translateX = useSharedValue(width); // Start completely off-screen to the right.
    // const translateY = useSharedValue(0); // We'll update this based on the button's y position.
    // const overlayOpacity = useSharedValue(0);

    // // WHen the button is laid out, we capture its position.
    // const handleButtonLayout = (event: LayoutChangeEvent) => {
    //     const { x, y, width, height } = event.nativeEvent.layout;
    //     setButtonPosition({ x, y, width, height });
    // };

    // const openModal = () => {
    //     // Measuure the button's position on the screen.
    //     buttonRef.current?.measure((fx: number, fy: number, w: number, h: number, px: number, py: number) => {
    //         console.log('fx', fx);
    //         console.log('fy', fy);
    //         console.log('w', w);
    //         console.log('h', h);
    //         console.log('px', px);
    //         console.log('py', py);
    //         //  Updade the buttonPosition state (in case onLayout wasn't enough).
    //         setButtonPosition({ x: px, y: py, width: w, height: h });

    //         // Make the modal visible.
    //         setVisible(true);

    //         // Set the  starting position for the modal.
    //         // We want the modal to come in from the right, and position it above the button.
    //         translateX.value = width; // Off-screen to the right.
    //         translateY.value = py - 10; // 10 pixels above the button.

    //         // Animate the background overlay to fade in.
    //         overlayOpacity.value = withTiming(1, { duration: 300 });

    //         // Animate the modal sliding in horizontally.
    //         // Here, we choose a target position that alligns realtive to the button.
    //         translateX.value = withSpring(px + w * 0.5 - 100, { damping: 15 });
    //     });
    // };

    // The closeModal functions reversees the animations sliding the modal back off-screen.
    // const closeModal = () => {
    //     overlayOpacity.value = withTiming(0, { duration: 300 });
    //     translateX.value = withTiming(width, { duration: 300 }, () => {
    //         //  Once the animation is complete, hide the modal.
    //         setVisible(false);
    //     });
    // };

    // // Create a tap gesture that triggers closing the modal.
    // const tapGesture = Gesture.Tap().onEnd(() => {
    //     closeModal();
    // });

    // const overlayStyle = useAnimatedStyle(() => ({
    //     backgroundColor: theme === 'light' ? colors.light_theme.overlay_background : colors.dark_theme.overlay_background,
    // }));

    // // Modal animated style (positioning).
    // const modalStyle = useAnimatedStyle(() => ({
    //     transform: [
    //         { translateX: translateX.value },
    //         { translateY: translateY.value }
    //     ],
    // }));

    // // Temporary test handlers.
    // const handleGoalTemplatePress = () => {
    //     console.log('Goal Template Pressed');
    // };

    // const handleSelfMadeGoalPress = () => {
    //     console.log('Self-made Goal Pressed');
    // };

    return (
        // <View style={styles.container}>
        //     {/* The button that triggers the modal */}
        //     <Pressable
        //         ref={buttonRef}
        //         style={[
        //             styles.button,
        //             theme === 'light' ? styles.buttonLight : styles.buttonDark,
        //         ]}
        //         onPress={openModal}
        //         onLayout={handleButtonLayout}
        //     >
        //         <Feather name="plus" size={24} color={theme === 'light' ? colors.light_theme.button_primary_text : colors.dark_theme.button_primary_text} />
        //     </Pressable>

        //     {/* Render the modal if it's visible */}
        //     {visible && (
        //         <Animated.View style={[styles.overlay, overlayStyle]}>
        //             <Animated.View style={[styles.modal, theme === 'light' ? styles.modalLight : styles.modalDark, modalStyle]}>
        //                 <Pressable style={[styles.button, theme === 'light' ? styles.buttonLight : styles.buttonDark]} onPress={handleGoalTemplatePress}>
        //                     <Feather name='file-text' size={24} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
        //                     <Text style={[styles.modalText, theme === 'light' ? styles.modalTextLight : styles.modalTextDark]}>Goal Templates</Text>
        //                 </Pressable>
        //                 <View style={styles.modalDivider} />
        //                 <Pressable style={[styles.button, theme === 'light' ? styles.buttonLight : styles.buttonDark]} onPress={handleSelfMadeGoalPress}>
        //                     <FontAwesome5 name={theme === 'light' ? 'user' : 'user-alt'} size={24} color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
        //                     <Text style={[styles.modalText, theme === 'light' ? styles.modalTextLight : styles.modalTextDark]}>Self-made Goal</Text>
        //                 </Pressable>
        //             </Animated.View>
        //         </Animated.View>
        //     )}
        // </View>

        <Modal visible={isVisible} onDismiss={() => { closeModal() }} contentContainerStyle={styles.modal} style={{ marginTop: 0 }}>
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
        </Modal>
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
        // backgroundColor: 'red',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 18,
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
