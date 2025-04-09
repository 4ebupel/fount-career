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
import StepOne from '@/components/goalCreationTutorial/StepOne';
import StepTwo from '@/components/goalCreationTutorial/StepTwo';
import StepThree from '@/components/goalCreationTutorial/StepThree';
import StepFour from '@/components/goalCreationTutorial/StepFour';
import StepFive from '@/components/goalCreationTutorial/StepFive';
import LastDetails from '@/components/goalCreationTutorial/LastDetails';
import GoodJob from '@/components/goalCreationTutorial/GoodJob';
import { Goal } from '@/types/database';
// Create an Animated version of SafeAreaView
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

const steps = [
  StepZero,
  StepOne,
  StepTwo,
  StepThree,
  StepFour,
  StepFive,
  LastDetails,
  GoodJob,
];

interface Props extends DefaultModalProps {
  isVisible: boolean;
};

const paddingHorizontal = 24;
const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 200; // minimum downward drag required to close the modal
const HORIZONTAL_SWIPE_THRESHOLD = 100; // minimum horizontal drag required to navigate

export default function GoalCreationTutorialModal({ theme = 'dark', ...props }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [goal, setGoal] = useState<Goal>({
    id: '',
    created_at: '',
    updated_at: '',
    title: '',
    category: '',
    due_date: null,
    achieved: false,
    image_small: null,
    image_large: null,
  } as Goal);
  const { openModal, closeModal } = useModal()
  // const totalSteps = 3;

  // Step-specific height values (adjust these based on actual content)
  const getStepHeight = () => {
    switch (currentStep) {
      case 0: return height * 0.45;  // Step 0 height
      case steps.length - 1: return height * 0.5;  // Last step height
      default: return height * 0.55; // Default height for future steps
    }
  };

  const getContainerHeight = () => {
    switch (currentStep) {
      case 0: return height * 0.8;
      case steps.length - 1: return height * 0.8;
      default: return height * 0.85;
    }
  }

  // Shared value for container height
  const containerHeight = useSharedValue(getContainerHeight());

  // Shared value for step container height - updates when currentStep changes
  const stepContainerHeight = useSharedValue(getStepHeight());

  const translateX = useSharedValue(0); // for horizontal step transitions
  const translateY = useSharedValue(0); // for vertical swipe-to-close
  const isSwipingHorizontally = useSharedValue(false); // track if horizontal swipe is active
  const isSwipingVertically = useSharedValue(false); // track if vertical swipe is active
  const horizontalSwipeOffset = useSharedValue(0); // for temporary horizontal swipe movement

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Update step container height when currentStep changes
  useEffect(() => {
    stepContainerHeight.value = withTiming(getStepHeight(), { duration: 300 });
    containerHeight.value = withTiming(getContainerHeight(), { duration: 300 });
  }, [currentStep]);

  // Listen to keyboard events and update containerHeight shared value.
  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      // Mark keyboard as visible
      setIsKeyboardVisible(true);

      // Reset any vertical translation when keyboard opens
      translateY.value = withTiming(0, { duration: 150 });

      // Store current step to calculate height
      const currentStepIndex = currentStep;

      // Get the current container height before keyboard shows
      const currentHeight = getContainerHeight();

      // Calculate keyboard-visible height - ensure it's never smaller than current height
      const keyboardVisibleHeight = Math.max(
        currentStepIndex === 0 ? height * 0.9 : height * 0.85,
        currentHeight
      );

      // Adjust container height for keyboard
      containerHeight.value = withTiming(keyboardVisibleHeight, { duration: 200 });

      // Adjust step container height when keyboard is visible - ensure it's appropriate for the content
      stepContainerHeight.value = withTiming(
        currentStepIndex === 0 ? height * 0.45 : height * 0.5,
        { duration: 200 }
      );
    };

    const keyboardWillHide = () => {
      // Mark keyboard as hidden
      setIsKeyboardVisible(false);

      // Animate back to the original container height when keyboard hides
      containerHeight.value = withTiming(getContainerHeight(), { duration: 200 });

      // Reset step container height
      stepContainerHeight.value = withTiming(getStepHeight(), { duration: 200 });
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
  }, [currentStep]);

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

  // Add animated style for step container height
  const stepContainerStyle = useAnimatedStyle(() => ({
    height: stepContainerHeight.value,
  }));

  // Function to animate modal closure with consistent animation
  const animateClose = () => {
    translateY.value = withTiming(height, { duration: 300 }, () => {
      runOnJS(props.onClose)();
    });
  };

  // Navigation handlers for steps - defined before gesture handlers to ensure they're available
  const goNext = () => {
    if (currentStep < steps.length - 1) {
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

  const handleConfirm = () => {
    // Format the date to ensure it's in a SQLite-compatible format (YYYY-MM-DD)
    let formattedDueDate = goal.due_date;
    
    // If the date is in a human-readable format (e.g., "January 15, 2024"), convert it to YYYY-MM-DD
    if (goal.due_date && !goal.due_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      try {
        const date = new Date(goal.due_date);
        if (!isNaN(date.getTime())) {
          formattedDueDate = date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        }
      } catch (error) {
        console.error('Error formatting date:', error);
      }
    }

    props.onConfirm({ 
      title: goal.title, 
      category: goal.category, 
      due_date: formattedDueDate 
    });
    animateClose();
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
    if (currentStep < steps.length - 1 && goal.title.length > 0) {
      goNext();
    }
  };

  const safeGoBack = () => {
    if (currentStep > 0 && goal.title.length > 0) {
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
      else if (currentStep === steps.length - 1 && event.translationX < 0) {
        // Last step - prevent dragging left
        horizontalSwipeOffset.value = 0;
      } else if (goal.title.length <= 0) {
        // Any step - prevent dragging if the input is empty
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
      else if (event.translationX < -HORIZONTAL_SWIPE_THRESHOLD && currentStep < steps.length - 1) {
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
        onClose: () => { },
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
        {Array.from({ length: steps.length }).map((_, index) => {
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
                {/* Wrap the gesture detector in a View with animate-able height */}
                <Animated.View style={[styles.stepsContainer, stepContainerStyle]}>
                  <GestureDetector gesture={stepsPanGesture}>
                    <Animated.View style={[styles.stepsWrapper, animatedStyle]}>
                      {steps.map((Step, index) => (
                        <View style={styles.stepContainer} key={index}>
                          <Step theme={theme} goal={goal} setGoal={setGoal} />
                        </View>
                      ))}
                    </Animated.View>
                  </GestureDetector>
                </Animated.View>

                {/* Dot-based step indicator */}
                {renderStepDots()}

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                </View>

                <View style={styles.buttonRow}>
                  <View style={styles.testBtnContainer}>
                    <Button label={currentStep < steps.length - 1 ? 'Next' : 'Finish'} theme={theme} onPress={currentStep < steps.length - 1 ? goNext : handleConfirm} variant="primary" disabled={goal.title.length <= 0} />
                  </View>
                  {currentStep > 0 && (
                    <View style={styles.testBtnContainer}>
                      <Button label="Back" theme={theme} onPress={goBack} variant="secondary" />
                    </View>
                  )}
                </View>

                {currentStep === 0 && (
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
                )}
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
    maxWidth: '100%',
    width: 'auto',
    flexGrow: 1,
    flex: 1,
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
  },
  stepsWrapper: {
    flexDirection: 'row',
    width: width * steps.length,
    alignSelf: 'flex-start',
  },
  stepContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    width: '100%',
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
  },
});
