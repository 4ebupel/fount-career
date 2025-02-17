import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, Pressable, Keyboard, TouchableWithoutFeedback, SafeAreaView } from 'react-native';
import Checkbox from 'expo-checkbox';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';
import AuthFooter from '@/components/AuthFooter';

export default function Auth() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);

    // Create a ref for the password TextInput
    const passwordRef = useRef<TextInput>(null);

    async function signInWithEmail() {
        // Validate input fields to ensure they're not empty
        if (!email.trim() || !password.trim()) {
            Alert.alert('Please provide both email and password.');
            return;
        }
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        console.log('Signed in with email:', email, password)
        setLoading(false)
    }

    async function signUpWithEmail() {
        // Validate input fields to ensure they're not empty
        if (!email.trim() || !password.trim()) {
            Alert.alert('Please provide both email and password.');
            return;
        }
        setLoading(true)
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (error) {
            Alert.alert(error.message)
        } else if (!session) {
            Alert.alert('Please check your inbox for email verification!')
        }
        setLoading(false)
    }

    // Placeholder handlers for the various sign in methods.
    const handleEmailSignIn = () => {
        // Handle email/password authentication logic here.
        console.log('Email Sign In with:', email, password, 'Agreed:', agree);
    };

    const handleAppleSignIn = () => {
        // Handle Apple sign in logic here.
        console.log('Continue with Apple');
    };

    const handleGoogleSignIn = () => {
        // Handle Google sign in logic here.
        console.log('Continue with Google');
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Pressable onPress={handleGoBack} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={24} color="#FFF" />
                </Pressable>
            </View>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{isSignUp ? 'Join fount.one Today ✨' : 'Welcome Back! 👋'}</Text>
                        <Text style={styles.description}>
                            {isSignUp ? 'Create your account and unlock a world of productivity.' : 'Sign in to access your goals, habits, and progress.'}
                        </Text>
                    </View>
                    <View style={styles.form}>
                        <View style={{ gap: 8 }}>
                            <Text style={{ color: '#FFF', fontSize: 18 }}>
                                Email
                            </Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="envelope" size={18} color="#9E9E9E" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#9E9E9E"
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                />
                            </View>
                        </View>
                        <View style={{ gap: 8 }}>
                            <Text style={{ color: '#FFF', fontSize: 18 }}>
                                Password
                            </Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="lock" size={18} color="#9E9E9E" style={styles.inputIcon} />
                                <TextInput
                                    ref={passwordRef}
                                    style={styles.input}
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    placeholderTextColor="#9E9E9E"
                                    returnKeyType="done"
                                    onSubmitEditing={handleEmailSignIn}
                                />
                            </View>
                        </View>
                        <View style={styles.checkboxContainer}>
                            <Pressable onPress={() => setAgree(!agree)} style={styles.checkboxContainer}>
                                <Checkbox
                                    value={agree}
                                    onValueChange={setAgree}
                                    color={agree ? '#FFA914' : undefined}
                                    style={{ borderColor: '#FFA914' }}
                                />
                                <Text style={styles.checkboxLabel}>
                                    Agree to fount.one
                                </Text>
                            </Pressable>
                            <Link href="/terms" style={[{ color: '#FFA914' }, styles.link]}>terms and conditions</Link>
                        </View>
                    </View>

                    <View style={styles.signInContainer}>
                        <Text style={{ color: '#FFF', fontSize: 18 }}>
                            Already have an account?
                        </Text>
                        <Pressable onPress={() => setIsSignUp(!isSignUp)}>
                            <Text style={styles.link}> {isSignUp ? 'Sign in' : 'Sign up'}</Text>
                        </Pressable>
                    </View>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider}></View>
                        <Text style={styles.dividerText}>Or</Text>
                        <View style={styles.divider}></View>
                    </View>

                    <View style={styles.socialSection}>
                        <Button label="Continue with Apple" icon="apple" onPress={handleAppleSignIn} />
                        <Button label="Continue with Google" icon="google" onPress={handleGoogleSignIn} />
                    </View>
                </View>
            </TouchableWithoutFeedback>

            <View style={{ position: 'absolute', bottom: 12, left: 0, right: 0, backgroundColor: '#181A20' }}>
                <AuthFooter isSignUp={isSignUp} onClick={
                    isSignUp ? signUpWithEmail : signInWithEmail
                } />
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#181A20',
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    topBar: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        paddingTop: 20,
        paddingHorizontal: 20,
        zIndex: 1
    },
    header: {
        marginBottom: 30,
        alignItems: 'flex-start',
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'left',
        marginBottom: 10,
        color: '#fff'
    },
    description: {
        fontSize: 16,
        textAlign: 'left',
        color: '#EEE'
    },
    form: {
        marginBottom: 30,
        gap: 16
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 65,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#1F222A',
        borderRadius: 8,
        backgroundColor: '#1F222A',
    },
    inputIcon: {
        marginRight: 12
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 8,
        color: '#FFF',
        fontSize: 18
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 16,
        color: '#EEE'
    },
    socialSection: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        flex: 1
    },
    dividerText: {
        textAlign: 'center',
        color: '#EEE',
        fontSize: 16
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20
    },
    signInContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30
    },
    link: {
        color: '#FFA914',
        fontSize: 18,
    },
    backButton: {
        padding: 10,
    },
});