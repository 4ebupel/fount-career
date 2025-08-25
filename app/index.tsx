import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import Button from '@/components/Button';
import SocialButton from '@/components/SocialButton';
import { useRouter } from 'expo-router';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useDatabase } from '@/hooks/useDatabase';
import { colors } from '@/lib/colors';
import { registerForPushNotificationsAsync } from '@/lib/registerForPushNotificationsAsync';
import { deleteAllReminderOccurrences } from '@/lib/database';

export default function Index() {
    const { theme } = useContext(ThemeContext);
    const { initializeDatabase, isInitialized } = useDatabase();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const cancelAllScheduledNotifications = async () => {
        try {
            setLoading(true);
            await Notifications.cancelAllScheduledNotificationsAsync();
            await deleteAllReminderOccurrences();
            setLoading(false);
        } catch (error) {
            console.error('Failed to cancel all scheduled notifications:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    // Initialize database on component mount
    useEffect(() => {
        if (!isInitialized) {
            initializeDatabase().catch(error => {
                console.error('Failed to initialize database:', error);
            });
        }
    }, [isInitialized, initializeDatabase]);

    const handleSignUp = () => {
        router.push('/auth');
    };

    const handleSignIn = () => {
        router.push('/auth');
    };

    return (
        <SafeAreaView style={[styles.container, theme === 'light' ? styles.container_light : styles.container_dark]}>
            {loading && <View style={[styles.loadingContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                <ActivityIndicator size="large" color={theme === 'light' ? colors.light_theme.text_primary : colors.dark_theme.text_primary} />
            </View>}
            <View style={styles.content}>
                <Image source={require('../assets/logo.png')} style={styles.logo} />
                <Text style={[styles.title, theme === 'light' ? styles.title_light : styles.title_dark]}>Let's Get Started!</Text>
                <Text style={[styles.subtitle, theme === 'light' ? styles.subtitle_light : styles.subtitle_dark]}>Let's dive in into your account</Text>

                <View style={styles.buttonContainer}>
                    <SocialButton icon="google" label="Continue with Google" onPress={() => { registerForPushNotificationsAsync() }} theme={theme} />
                    <SocialButton icon="apple" label="Continue with Apple" onPress={() => { cancelAllScheduledNotifications() }} theme={theme} />
                    <SocialButton icon="linkedin" label="Continue with LinkedIn" onPress={() => { }} theme={theme} />
                </View>

                <View style={styles.buttonContainer}>
                    <Button label="Sign up" variant="primary" onPress={handleSignUp} theme={theme} />
                    <Button label="Sign in" variant="secondary" onPress={handleSignIn} theme={theme} />
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, theme === 'light' ? styles.footerText_light : styles.footerText_dark]}>Privacy Policy</Text>
                    <Text style={styles.footerText}> · </Text>
                    <Text style={[styles.footerText, theme === 'light' ? styles.footerText_light : styles.footerText_dark]}>Terms of Service</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container_light: {
        backgroundColor: colors.light_theme.background,
    },
    container_dark: {
        backgroundColor: colors.dark_theme.background,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    buttonContainer: {
        flexDirection: 'column',
        gap: 20,
        width: '100%',
        marginBottom: 68,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 10,
    },
    title_light: {
        color: colors.light_theme.text_primary,
    },
    title_dark: {
        color: colors.dark_theme.text_primary,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '400',
        marginBottom: 30,
    },
    subtitle_light: {
        color: colors.light_theme.text_primary,
    },
    subtitle_dark: {
        color: colors.dark_theme.text_primary,
    },
    footer: {
        flexDirection: 'row',
    },
    footerText: {
        fontSize: 14,
    },
    footerText_light: {
        color: colors.light_theme.text_secondary,
    },
    footerText_dark: {
        color: colors.dark_theme.text_secondary,
    },
});
