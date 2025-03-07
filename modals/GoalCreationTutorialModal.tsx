import React, { useEffect, useState } from 'react';
import {
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
import StepZero from '@/components/goalCreationTutorial/StepZero';
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
const HORIZONTAL_SWIPE_THRESHOLD = 100; // minimum horizontal drag required to navigate

export default function GoalCreationTutorialModal({ theme = 'dark', ...props }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const { openModal, closeModal } = useModal()
  const totalSteps = 3;

  // Shared value for container height
  const containerHeight = useSharedValue(height * 0.75);

  const translateX = useSharedValue(0); // for horizontal step transitions
  const translateY = useSharedValue(0); // for vertical swipe-to-close
  const isSwipingHorizontally = useSharedValue(false); // track if horizontal swipe is active
  const isSwipingVertically = useSharedValue(false); // track if vertical swipe is active
  const horizontalSwipeOffset = useSharedValue(0); // for temporary horizontal swipe movement
  
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Listen to keyboard events and update containerHeight shared value.
  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      // Mark keyboard as visible
      setIsKeyboardVisible(true);
      
      // Reset any vertical translation when keyboard opens
      translateY.value = withTiming(0, { duration: 150 });
      
      // Adjust container height for keyboard while preserving header position
      containerHeight.value = withTiming(height * 0.85, { duration: 200 });
    };
    
    const keyboardWillHide = () => {
      // Mark keyboard as hidden
      setIsKeyboardVisible(false);
      
      // Animate back to the original container height when keyboard hides
      containerHeight.value = withTiming(height * 0.8, { duration: 200 });
    };

    // Use correct keyboard event listeners based on platform
    const showListener = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', keyboardWillShow)
      : Keyboard.addListener('keyboardDidShow', keyboardWillShow);
      
    const hideListener = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', keyboardWillHide)
      : Keyboard.addListener('keyboardDidHide', keyboardWillHide);
      
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
    transform: [
      { translateX: translateX.value + horizontalSwipeOffset.value },
    ],
  }));

  // Animated style for vertical translation (applied to the entire modal container)
  const gestureAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Function to animate modal closure with consistent animation
  const animateClose = () => {
    translateY.value = withTiming(height, { duration: 300 }, () => {
      runOnJS(props.onClose)();
    });
  };

  // Navigation handlers for steps - defined before gesture handlers to ensure they're available
  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      translateX.value = withTiming(-nextStep * width, { duration: 300 }, () => {
        runOnJS(setCurrentStep)(nextStep);
      });
    } else {
      // On the last step, show confirmation dialog
      animateClose();
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      const nextStep = currentStep - 1;
      translateX.value = withTiming(-nextStep * width, { duration: 300 }, () => {
        runOnJS(setCurrentStep)(nextStep);
      });
    }
  };

  // Helper function to close the modal after confirmation
  const closeWithAnimation = () => {
    closeModal(); // Close the confirmation modal first
    animateClose(); // Then animate the main modal closing
  };

  // Define the vertical pan gesture for the header area
  const headerPanGesture = Gesture.Pan()
    .onBegin(() => {
      isSwipingVertically.value = true;
    })
    .onUpdate((event) => {
      // Only allow downward movement when keyboard is not visible
      if (!isKeyboardVisible) {
        translateY.value = event.translationY < 0 ? 0 : event.translationY;
      }
    })
    .onEnd(() => {
      if (translateY.value > SWIPE_THRESHOLD && !isKeyboardVisible) {
        // If dragged down enough, close the modal
        translateY.value = withTiming(height, { duration: 300 }, () => {
          runOnJS(props.onClose)();
        });
      } else {
        // Otherwise, snap back to the original position
        translateY.value = withTiming(0, { duration: 200 });
      }
      isSwipingVertically.value = false;
    });

  // Safe wrapper function to handle navigation
  const safeGoNext = () => {
    if (currentStep < totalSteps - 1) {
      goNext();
    }
  };

  const safeGoBack = () => {
    if (currentStep > 0) {
      goBack();
    }
  };

  // Define the horizontal pan gesture for the steps content area
  const stepsPanGesture = Gesture.Pan()
    .onBegin(() => {
      if (!isKeyboardVisible) {
        isSwipingHorizontally.value = true;
      }
    })
    .onUpdate((event) => {
      if (!isSwipingHorizontally.value || isKeyboardVisible) return;
      
      // Logic for horizontal drag constraints
      if (currentStep === 0 && event.translationX > 0) {
        // First step - prevent dragging right
        horizontalSwipeOffset.value = 0;
      } 
      else if (currentStep === totalSteps - 1 && event.translationX < 0) {
        // Last step - prevent dragging left
        horizontalSwipeOffset.value = 0;
      }
      else {
        // Apply dampening effect to make the swipe feel natural
        const dampFactor = 0.8;
        horizontalSwipeOffset.value = event.translationX * dampFactor;
      }
    })
    .onEnd((event) => {
      if (isKeyboardVisible || !isSwipingHorizontally.value) {
        horizontalSwipeOffset.value = withTiming(0, { duration: 200 });
        isSwipingHorizontally.value = false;
        return;
      }
      
      // Reset the swipe offset with animation regardless of direction
      horizontalSwipeOffset.value = withTiming(0, { duration: 300 });
      
      // Process the swipe direction after ensuring the offset is being reset
      if (event.translationX > HORIZONTAL_SWIPE_THRESHOLD && currentStep > 0) {
        // Only call goBack if we're not on the first step
        runOnJS(safeGoBack)();
      } 
      else if (event.translationX < -HORIZONTAL_SWIPE_THRESHOLD && currentStep < totalSteps - 1) {
        // Only call goNext if we're not on the last step
        runOnJS(safeGoNext)();
      }
      
      // Always reset the swiping state
      isSwipingHorizontally.value = false;
    })
    .minDistance(10) // Increased minimum distance to ensure intentional swipes
    .enabled(!isKeyboardVisible); // Disable gesture when keyboard is visible

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
        onConfirm: () => { 
          closeWithAnimation();
        }
      }
    });
  };

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
      <AnimatedSafeAreaView style={[styles.container, gestureAnimatedStyle, containerAnimatedStyle]} entering={SlideInDown.duration(300)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoiding}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          >
            <View style={styles.contentContainer}>
              <GestureDetector gesture={headerPanGesture}>
                <View style={styles.header}>
                  <View style={styles.headerCloseIcon} />
                  <View style={styles.headerBar} />
                  <Pressable onPress={animateClose}>
                    <AntDesign name="closesquareo" size={24} color={colors.light_theme.text_tertiary} style={styles.headerCloseIcon} />
                  </Pressable>
                </View>
              </GestureDetector>
              
              {/* Content section with adaptive spacing */}
              <View style={[styles.scrollableContent, isKeyboardVisible && styles.scrollableContentKeyboardVisible]}>
                {/* Wrap the gesture detector in a View with proper dimensions to contain it */}
                <View style={styles.stepsContainer}>
                  <GestureDetector gesture={stepsPanGesture}>
                    <Animated.View style={[styles.stepsWrapper, animatedStyle]}>
                      <View style={styles.stepContainer}><StepZero theme='dark' /></View>
                      <View style={styles.stepContainer}><StepZero theme='dark' /></View>
                      <View style={styles.stepContainer}><StepZero theme='dark' /></View>
                    </Animated.View>
                  </GestureDetector>
                </View>
                
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
                
                <TouchableOpacity 
                  style={[
                    styles.closeTutorialContainer,
                    isKeyboardVisible && styles.closeTutorialContainerKeyboardVisible
                  ]} 
                  onPress={confirmCloseTutorial}
                >
                  <Text style={styles.closeTutorialText}>
                    Set Goal manually
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </AnimatedSafeAreaView>
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
    paddingTop: 10,
    paddingBottom: 5,
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
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  scrollableContent: {
    flex: 1,
    width: '100%',
    gap: 20,
    paddingTop: 15,
  },
  scrollableContentKeyboardVisible: {
    gap: 10,
    paddingTop: 5,
  },
  stepsContainer: {
    width: '100%',
    overflow: 'hidden', // Ensures content doesn't spill outside container
    height: height * 0.4, // Explicit height to properly contain the gesture area
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
    marginBottom: 10,
  },
  closeTutorialContainerKeyboardVisible: {
    marginBottom: 5,
  },
  closeTutorialText: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: 400,
    fontSize: 18,
  }
});
