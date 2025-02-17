import { StyleSheet, View, Pressable, Text, Animated } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRef } from "react";

type Props = {
    label: string;
    icon?: string;
    variant?: 'primary' | 'secondary';
    onPress?: () => void;
};

export default function Button({ label, icon, onPress, variant = 'secondary' }: Props) {
    // Animated values for background opacity & text color transition
    const bgOpacity = useRef(new Animated.Value(1)).current;
    const textOpacity = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.timing(bgOpacity, {
                toValue: 0.7, // Lighter background effect
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(textOpacity, {
                toValue: 0.5, // Slight fade effect on text
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.timing(bgOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // Define button background style
    const buttonStyles = [
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
    ];

    // Define dynamic text color
    const textColor = variant === 'primary' ? '#FFF' : '#EEE';

    return (
        <View style={styles.buttonContainer}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                style={{ width: '100%', height: '100%' }}
            >
                <Animated.View style={[buttonStyles, { opacity: bgOpacity }]}>
                    {icon && (
                        <FontAwesome
                            name={icon as keyof typeof FontAwesome.glyphMap}
                            size={18}
                            color={textColor}
                            style={styles.buttonIcon}
                        />
                    )}
                    <Animated.Text style={[styles.buttonLabel, { color: textColor, opacity: textOpacity }]}>
                        {label}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: '100%',
        height: 58,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    secondaryButton: {
        backgroundColor: '#1F222A',
        borderColor: '#35383F',
        borderWidth: 1,
    },
    primaryButton: {
        backgroundColor: '#FFA914',
    },
    button: {
        borderRadius: 40,
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonLabel: {
        fontSize: 18,
        textAlign: 'center',
    },
});
