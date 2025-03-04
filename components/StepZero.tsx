// StepZero.tsx
import { ThemeMode } from "@/contexts/ThemeContext";
import { colors } from "@/lib/colors";
import { StyleSheet, View, Image, TextInput, Text } from "react-native";

const image = require('@/assets/goalCreationTutorialImage.png')

interface Props {
    theme: 'dark' | 'light',
}

const inputPlaceholder = "e.g. ‘Learn React Native and build 3 apps by end of 2025’";

export default function StepZero({ theme }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.headingContainer}>
                <Text style={styles.title}>
                    What's your Goal?
                </Text>
                <Text style={styles.description}>
                    Take a moment to write down an inspiring goal you want to achieve. Be clear and ambitious!
                </Text>
            </View>
            <View style={styles.divider} />
            <Image style={styles.picture} source={image} />
            <View style={styles.divider} />
            <TextInput style={styles.input} placeholder={inputPlaceholder} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxHeight: '100%',
        gap: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headingContainer: {
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: colors.light_theme.tertiary_background,
    },
    picture: {
        maxHeight: '40%',
        maxWidth: '40%',
        resizeMode: 'contain',
    },
    input: {
        maxHeight: '33%',
        height: 0,
        minHeight: '10%',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 30,
        backgroundColor: colors.light_theme.secondary_background,
        textAlign: 'center',
    },
});
