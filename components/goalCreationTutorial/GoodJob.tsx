import { colors } from "@/lib/colors";
import { StyleSheet, View, Image, Text, Platform } from "react-native";

const image = require('@/assets/goalCreationTutorialFinal.png')

interface Props {
    theme: 'dark' | 'light',
}

export default function GoodJob({ theme }: Props) {
    return (
        <View style={styles.container}>
                <Text style={styles.title}>
                    Good Job!
                </Text>
                <Text style={styles.description}>
                    Your goal is now SMART!
                </Text>
                <Text style={styles.description}>
                    Let's make it even more achievable by <Text style={styles.description_bold}>breaking it into smaller, actionable steps.</Text>
                </Text>
            <View style={styles.divider} />
            <View style={styles.pictureContainer}>
                <Image style={styles.picture} source={image} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxHeight: '100%',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
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
    description_bold: {
        fontWeight: '700',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: colors.light_theme.tertiary_background,
    },
    pictureContainer: {
        width: '100%',
        height: 300, // Set fixed height instead of 100%
        alignItems: 'center',
        justifyContent: 'center',
    },
    picture: {
        height: '100%', // Use fixed height
        width: '100%',
        resizeMode: 'contain',
    },
});
