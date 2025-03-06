import React, { useEffect, useState } from 'react';
// import {Modal} from 'react-native-paper'
import {
  Modal,
  View,
  Text,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Button from '@/components/Button';
import StepZero from '@/components/StepZero';
import { DefaultModalProps } from '@/types/defaultModalProps';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/lib/colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  FadeOut,
  FadeIn,
  SlideInUp,
  SlideInDown,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useModal } from '@/hooks/useModal';

// Create an Animated version of SafeAreaView
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

interface Props extends DefaultModalProps {
  isVisible: boolean;
}

const paddingHorizontal = 24;
const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 200; // minimum downward drag required to close the modal

export default function GoalCreationTutorialModal({ theme = 'dark', ...props }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const { openModal, closeModal } = useModal()
  const totalSteps = 3;

  // Shared value for container height (initially 70% of the screen)
  const containerHeight = useSharedValue(height * 0.8);

  const translateX = useSharedValue(0); // for horizontal step transitions
  const translateY = useSharedValue(0); // for vertical swipe-to-close

  // Listen to keyboard events and update containerHeight shared value.
  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardWillShow', () => {
      // Increase container height when keyboard appears (e.g., 90% of screen)
      containerHeight.value = withTiming(height * 0.9, { duration: 200 });
    });
    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      // Animate back to the original container height when keyboard hides
      containerHeight.value = withTiming(height * 0.8, { duration: 200 });
    });
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // Animated style for container height
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: containerHeight.value,
  }));

  // Animated style for horizontal sliding of steps
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Animated style for vertical translation (applied to the entire modal container)
  const gestureAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Define the pan gesture using the new Gesture API
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow downward movement (translationY must be >= 0)
      translateY.value = event.translationY < 0 ? 0 : event.translationY;
    })
    .onEnd(() => {
      if (translateY.value > SWIPE_THRESHOLD) {
        // If dragged down enough, animate offscreen and then close
        translateY.value = withTiming(height, { duration: 200 }, () => {
          runOnJS(props.onClose)();
        });
      } else {
        // Otherwise, snap back to the original position
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  // Navigation handlers for steps
  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      translateX.value = withTiming(-nextStep * width, { duration: 300 }, () => {
        runOnJS(setCurrentStep)(nextStep);
      });
    } else {
      props.onClose();
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      translateX.value = withTiming(-prevStep * width, { duration: 300 }, () => {
        runOnJS(setCurrentStep)(prevStep);
      });
    }
  };

  const confirmCloseTutorial = () => {
    openModal({
      modalName: 'DefaultModal',
      props: {
        primaryCTA: 'Yes pls',
        secondaryCTA: 'I no no wanna',
        content: '',
        description: '',
        title: 'Are you sure u wanna close it',
        theme: 'light',
        onClose: () => {},
        onCancel: closeModal,
        onConfirm: () => {closeModal(); closeModal()}
      }
    })
  }

  // Render the dot indicator for steps
  const renderStepDots = () => {
    return (
      <View style={styles.stepDotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index === currentStep;
          return (
            <View
              key={index}
              style={[styles.dot, isActive && styles.activeDot]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View style={styles.overlay} exiting={FadeOut.duration(200)} entering={FadeIn.duration(200)}>
      {/* <Modal visible={props.isVisible} transparent animationType="slide"> */}
        <AnimatedSafeAreaView style={[styles.container, gestureAnimatedStyle, containerAnimatedStyle]} entering={SlideInDown.duration(300)}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardAvoiding}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
              <View style={styles.contentContainer}>
                <GestureDetector gesture={panGesture}>
                  <View style={styles.header}>
                    <View style={styles.headerCloseIcon} />
                    <View style={styles.headerBar} />
                    <Pressable onPress={props.onClose}>
                      <AntDesign name="closesquareo" size={24} color={colors.light_theme.text_tertiary} style={styles.headerCloseIcon} />
                    </Pressable>
                  </View>
                </GestureDetector>
                {/* Steps container with horizontal translation */}
                <Animated.View style={[styles.stepsWrapper, animatedStyle]}>
                  <View style={styles.stepContainer}><StepZero theme='dark' /></View>
                  <View style={styles.stepContainer}><StepZero theme='dark' /></View>
                  <View style={styles.stepContainer}><StepZero theme='dark' /></View>
                </Animated.View>
                {/* Dot-based step indicator */}
                {renderStepDots()}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                </View>
                <View style={styles.buttonRow}>
                  <View style={[styles.testBtnContainer, currentStep < 1 ? { maxWidth: '100%' } : {}]}>
                    <Button label={currentStep < totalSteps - 1 ? 'Next' : 'Finish'} theme={theme} onPress={goNext} variant="primary" />
                  </View>
                  {currentStep > 0 && (
                    <View style={styles.testBtnContainer}>
                      <Button label="Back" theme={theme} onPress={goBack} variant="secondary" />
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.closeTutorialContainer} onPress={confirmCloseTutorial}>
                  <Text style={styles.closeTutorialText}>
                    Set Goal manually
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </AnimatedSafeAreaView>
      {/* </Modal> */}
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
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.light_theme.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignSelf: 'flex-end',
  },
  keyboardAvoiding: {
    flex: 1,
    width: '100%',
  },
  header: {
    minHeight: 24,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal,
  },
  headerBar: {
    width: '15%',
    height: 3,
    borderRadius: 32,
    backgroundColor: colors.light_theme.tertiary_background,
  },
  headerCloseIcon: {
    width: 24,
  },
  testBtnContainer: {
    maxWidth: '50%',
    width: 'auto',
    flexGrow: 1,
  },
  contentContainer: {
    paddingTop: 10,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
  },
  stepsWrapper: {
    flexDirection: 'row',
    width: width * 3,
    alignSelf: 'flex-start',
  },
  stepContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal,
  },
  stepDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light_theme.text_disabled,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.light_theme.text_accent,
  },
  divider: {
    maxWidth: '100%',
    height: 1,
    backgroundColor: colors.light_theme.tertiary_background,
  },
  dividerContainer: {
    width: '100%',
    paddingHorizontal,
  },
  buttonRow: {
    gap: 16,
    paddingHorizontal,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  closeTutorialContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTutorialText: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: 400,
    fontSize: 18,
  }
});
