import React, { useEffect, useState } from "react";
import { DimensionValue, StyleSheet } from "react-native"
import { colors } from "@/lib/colors";
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withRepeat,
    withDelay,
} from "react-native-reanimated";
import LinearGradient from 'react-native-linear-gradient'
/**
* Skeleton loader with changable dimesions
* 
* @description Sends a "shiver" from left to right
* @param height a percent string or a number
* @param width a percent string or a number
* @param theme light | dark
* - will change the color of the loader
*/
export default function SkeletonLoader(
    {
        height = 0,
        width = 0,
        theme = 'light',
    }: {
        height: DimensionValue;
        width: DimensionValue;
        theme?: 'light' | 'dark';
    }
): React.JSX.Element {
    const [coordinates, setCoordinates] = useState({
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
    });
    const [parentDimensions, setParentDimensions] = useState({
        height: -1,
        width: -1,
    });
    const [gradientDimensions, setGradientDimensions] = useState({
        height: -1,
        width: -1,
    });

    const translateX = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    useEffect(() => {
        return () => {
            cancelAnimation(translateX);
        }
    }, []);

    const animateAcrossXDirection = () => {
        const overflowOffset = parentDimensions.width * 0.75;
        const leftmostEnd = -overflowOffset;
        const rightmostEnd = parentDimensions.width - gradientDimensions.width + overflowOffset;
        translateX.value = leftmostEnd;
        translateX.value = withRepeat(
            withDelay(
                800,
                withTiming(
                    rightmostEnd,
                    {
                        duration: 500,
                        easing: Easing.linear,
                    }
                )
            ),
            -1
        );
    };

    useEffect(() => {
        if (parentDimensions.height !== -1 &&
            parentDimensions.width !== -1 &&
            gradientDimensions.height !== -1 &&
            gradientDimensions.width !== -1
        ) {
            animateAcrossXDirection()
        }
    }, [parentDimensions, gradientDimensions])

    return (
        <Animated.View
            style={
                {
                    height,
                    width,
                    backgroundColor: theme === 'light' ? colors.light_theme.secondary_background : colors.dark_theme.secondary_background,
                    borderRadius: 6,
                }
            }
            onLayout={(event) => {
                setParentDimensions({
                    height: event.nativeEvent.layout.height,
                    width: event.nativeEvent.layout.width,
                });
            }}
        >
            <Animated.View
                style={[
                    {
                        height: "100%",
                        width: "80%",
                    },
                    animatedStyle
                ]}
                onLayout={(event) => {
                    setGradientDimensions({
                        height: event.nativeEvent.layout.height,
                        width: event.nativeEvent.layout.width,
                    });
                }}
            >
                <LinearGradient
                    colors={theme === 'light' ?
                        [
                            "rgba(255,255,255,0)",
                            "rgba(255,255,255,0.1)",
                            "rgba(255,255,255,0.4)",
                            "rgba(255,255,255,0.6)",
                            "rgba(255,255,255,0.7)",
                            "rgba(255,255,255,0.6)",
                            "rgba(255,255,255,0.4)",
                            "rgba(255,255,255,0.1)",
                            "rgba(255,255,255,0)",
                        ] :
                        [
                            "rgba(53,56,63,0)",
                            "rgba(53,56,63,0.1)",
                            "rgba(53,56,63,0.4)",
                            "rgba(53,56,63,0.6)",
                            "rgba(53,56,63,0.7)",
                            "rgba(53,56,63,0.6)",
                            "rgba(53,56,63,0.4)",
                            "rgba(53,56,63,0.1)",
                            "rgba(53,56,63,0)",
                        ]}
                    style={styles.background}
                    start={coordinates.start}
                    end={coordinates.end}
                />
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    itemParent: {
        overflow: "hidden",
    },
    background: {
        height: "100%",
        width: "100%",
    },
});