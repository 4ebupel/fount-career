import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';

export default function Index() {
    const router = useRouter();

    const handleSignUp = () => {
        router.push('/auth');
    };

    const handleSignIn = () => {
        router.push('/auth');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image source={require('../assets/logo.png')} style={styles.logo} />
                <Text style={styles.title}>Let's Get Started!</Text>
                <Text style={styles.subtitle}>Let's dive in into your account</Text>

                <View style={styles.buttonContainer}>
                    <Button icon="google" label="Continue with Google" onPress={() => { }} />
                    <Button icon="apple" label="Continue with Apple" onPress={() => { }} />
                    <Button icon="linkedin" label="Continue with LinkedIn" onPress={() => { }} />
                </View>

                <View style={styles.buttonContainer}>
                    <Button label="Sign up" variant="primary" onPress={handleSignUp} />
                    <Button label="Sign in" variant="secondary" onPress={handleSignIn} />
                </View>

                <View style={styles.footer}>
                    <Text style={{ color: '#EEE' }}>Privacy Policy</Text>
                    <Text style={{ color: '#EEE' }}> · </Text>
                    <Text style={{ color: '#EEE' }}>Terms of Service</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
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
        fontSize: 24,
        color: '#FFF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFF',
        marginBottom: 30,
    },
    footer: {
        flexDirection: 'row',
    },
});
