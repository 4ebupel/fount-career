import React, { useState, useRef } from 'react';
import { Modal, View, Text, Dimensions, useWindowDimensions, StyleSheet, SafeAreaView } from 'react-native';
import Button from '@/components/Button';
import { DefaultModalProps } from '@/types/defaultModalProps';
import { colors } from '@/lib/colors';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    FadeOut,
    FadeIn
} from 'react-native-reanimated';

interface Props extends DefaultModalProps {
    isVisible: boolean;
}

const { width } = Dimensions.get('window');

export default function GoalCreationTutorialModal({ theme = 'dark', ...props }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 3;
    const translateX = useSharedValue(0);  // animation value for slide transitions

    // Step content components (will be imported)
    const StepOne = () => <View><Text>Welcome! (Step 1 content)</Text></View>;
    const StepTwo = () => <View><Text>Profile Setup (Step 2 content)</Text></View>;
    const StepThree = () => <View><Text>Finish! (Step 3 content)</Text></View>;

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    // Navigate to next step with animation
    const goNext = () => {
        if (currentStep < totalSteps - 1) {
            const nextStep = currentStep + 1;
            translateX.value = withTiming(-(currentStep + 1) * width, { duration: 300 }, () => {
                runOnJS(setCurrentStep)(nextStep);
            });
        } else {
            props.onClose();
        }
    };

    // Navigate to previous step with animation
    const goBack = () => {
        if (currentStep > 0) {
            const prevStep = currentStep - 1;
            translateX.value = withTiming(-(currentStep - 1) * width, { duration: 300 }, () => {
                runOnJS(setCurrentStep)(prevStep);
            });
        }
    };

    return (
        <Animated.View style={styles.overlay} exiting={FadeOut.duration(200)} entering={FadeOut.duration(200)}>
            <Modal visible={props.isVisible} transparent animationType="slide">
                <SafeAreaView style={styles.container}>
                    <View style={styles.contentContainer}>
                        {/* Steps container with horizontal translation */}
                        <Animated.View
                            style={[styles.stepsWrapper, animatedStyle]}>
                            <View style={{ width }}>{/* Step 1 */}<StepOne /></View>
                            <View style={{ width }}>{/* Step 2 */}<StepTwo /></View>
                            <View style={{ width }}>{/* Step 3 */}<StepThree /></View>
                        </Animated.View>

                        {/* Step indicator / progress text */}
                        <Text style={styles.stepIndicator}>Step {currentStep + 1} of {totalSteps}</Text>

                        {/* Navigation buttons */}
                        <View style={styles.buttonRow}>
                            <Button
                                label={currentStep < totalSteps - 1 ? 'Next' : 'Finish'}
                                theme={theme}
                                onPress={goNext}
                                variant='primary'
                            />
                            {currentStep > 0 && (
                                <Button
                                    label='Back'
                                    theme={theme}
                                    onPress={goBack}
                                    variant='secondary'
                                />
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: colors.light_theme.overlay_background,
        justifyContent: 'center',
        alignItems: 'center',
        // padding: 20
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: colors.light_theme.background,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: '70%',
        alignSelf: 'flex-end'
    },
    contentContainer: {
        paddingHorizontal: 16,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    stepsWrapper: {
        flexDirection: 'row',  // children steps in a row for sliding
        alignSelf: 'flex-start',
        // width: 3 * width,
    },
    stepIndicator: {
        textAlign: 'center',
        margin: 10,
        fontSize: 16,
        color: '#fff'
    },
    buttonRow: {
        // width: '100%',
        // paddingHorizontal: 56,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: { /* styling for back button */ },
    nextButton: { /* styling for next/finish button */ }
});
