import React, { useState, useRef, useContext } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, Pressable, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Checkbox from 'expo-checkbox';
import { supabase } from '@/lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';
import AuthFooter from '@/components/AuthFooter';
import { colors } from '@/lib/colors';
import { ThemeContext } from '@/contexts/ThemeContext';
import SocialButton from '@/components/SocialButton';
import { resetDatabase } from '@/lib/database';

export default function Auth() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);
    const { theme, themeMode, changeThemeMode } = useContext(ThemeContext);

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

    const handleAppleSignIn = async () => {
        try {
            await resetDatabase();
        } catch (error) {
            console.error('Failed to reset database:', error);
        }
    };

    const handleGoogleSignIn = () => {
        // Handle Google sign in logic here.
        console.log('Continue with Google');
        // No session check for testing purposes
        router.push('/home');
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={[styles.container, theme === 'light' ? styles.container_light : styles.container_dark]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 25 }}>
                <View style={styles.backButtonContainer}>
                    <Pressable onPress={handleGoBack} style={styles.backButton}>
                        <FontAwesome name="arrow-left" size={24} color={theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary} />
                    </Pressable>
                </View>
                <View style={styles.themeButtonContainer}>
                    <Pressable onPress={() => changeThemeMode(themeMode === 'dark' ? 'light' : 'dark')} style={styles.themeButton}>
                        <FontAwesome name={themeMode === 'dark' ? 'moon-o' : 'sun-o'} size={24} color={theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary} />
                    </Pressable>
                </View>
            </View>
            <ScrollView>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
                    <View style={styles.contentContainer}>
                        <View style={styles.header}>
                            <Text style={[styles.title, theme === 'dark' ? styles.title_dark : styles.title_light]}>{isSignUp ? 'Join fount.one Today✨' : 'Welcome Back! 👋'}</Text>
                            <Text style={[styles.description, theme === 'dark' ? styles.description_dark : styles.description_light]}>
                                {isSignUp ? 'Create your account and unlock a world of productivity.' : 'Sign in to access your goals, habits, and progress.'}
                            </Text>
                        </View>
                        <View style={styles.form}>
                            <View style={{ gap: 8 }}>
                                <Text style={{ color: theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary, fontSize: 18, fontWeight: '600' }}>
                                    Email
                                </Text>
                                <View style={[styles.inputContainer, theme === 'dark' ? styles.inputContainer_dark : styles.inputContainer_light]}>
                                    <FontAwesome name="envelope" size={20} color={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholderTextColor={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary}
                                        returnKeyType="next"
                                        onSubmitEditing={() => passwordRef.current?.focus()}
                                    />
                                </View>
                            </View>
                            <View style={{ gap: 8 }}>
                                <Text style={{ color: theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary, fontSize: 18, fontWeight: '600' }}>
                                    Password
                                </Text>
                                <View style={[styles.inputContainer, theme === 'dark' ? styles.inputContainer_dark : styles.inputContainer_light]}>
                                    <FontAwesome name="lock" size={20} color={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary} style={styles.inputIcon} />
                                    <TextInput
                                        ref={passwordRef}
                                        style={[styles.input, theme === 'dark' ? styles.input_dark : styles.input_light]}
                                        placeholder="Password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        placeholderTextColor={theme === 'dark' ? colors.dark_theme.text_secondary : colors.light_theme.text_secondary}
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
                                        color={agree ? theme === 'dark' ? colors.dark_theme.text_accent : colors.light_theme.text_accent : undefined}
                                        style={[{ borderColor: theme === 'dark' ? colors.dark_theme.text_accent : colors.light_theme.text_accent }, { borderRadius: 4 }]}
                                    />
                                    <Text style={[styles.checkboxLabel, theme === 'dark' ? styles.checkboxLabel_dark : styles.checkboxLabel_light]}>
                                        I agree to fount.one
                                    </Text>
                                </Pressable>
                                <Link href="/terms" style={[styles.linkTermsAndConditions, theme === 'dark' ? styles.link_dark : styles.link_light]}>Terms & Conditions</Link>
                            </View>
                        </View>

                        <View style={styles.signInContainer}>
                            <Text style={{ color: theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary, fontSize: 18 }}>
                                Already have an account?
                            </Text>
                            <Pressable
                                // onPress={() => setIsSignUp(!isSignUp)}
                                onPress={() => handleGoogleSignIn()}
                            >
                                <Text style={[styles.link, theme === 'dark' ? styles.link_dark : styles.link_light]}> {isSignUp ? 'Sign in' : 'Sign up'}</Text>
                            </Pressable>
                        </View>

                        <View style={styles.dividerContainer}>
                            <View style={[styles.divider, theme === 'dark' ? styles.divider_dark : styles.divider_light]}></View>
                            <Text style={[styles.dividerText, theme === 'dark' ? styles.dividerText_dark : styles.dividerText_light]}>Or</Text>
                            <View style={[styles.divider, theme === 'dark' ? styles.divider_dark : styles.divider_light]}></View>
                        </View>

                        <View style={styles.socialSection}>
                            <SocialButton label="Continue with Apple" icon="apple" onPress={handleAppleSignIn} theme={theme} />
                            <SocialButton label="Continue with Google" icon="google" onPress={handleGoogleSignIn} theme={theme} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>

            {/* <View style={{ position: 'absolute', bottom: 12, left: 0, right: 0, backgroundColor: '#181A20' }}> */}
            <AuthFooter isSignUp={isSignUp} onClick={
                isSignUp ? signUpWithEmail : signInWithEmail
            } />
            {/* </View> */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    container_light: {
        backgroundColor: colors.light_theme.background,
    },
    container_dark: {
        backgroundColor: colors.dark_theme.background,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
        justifyContent: 'center',
    },
    backButtonContainer: {
        // position: 'absolute',
        // top: 20,
        // left: 0,
        // right: 0,
        // paddingTop: 20,
        // paddingHorizontal: 20,
        // zIndex: 1
    },
    themeButtonContainer: {
        // position: 'absolute',
        // top: 20,
        // right: 0,
        // paddingTop: 25,
        // paddingHorizontal: 20,
        // zIndex: 1
    },
    header: {
        marginBottom: 30,
        alignItems: 'flex-start',
        width: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'left',
        marginBottom: 10,
    },
    title_light: {
        color: colors.light_theme.text_primary
    },
    title_dark: {
        color: colors.dark_theme.text_primary
    },
    description: {
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'left',
    },
    description_light: {
        color: colors.light_theme.text_secondary
    },
    description_dark: {
        color: colors.dark_theme.text_secondary
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
        borderRadius: 8,
    },
    inputContainer_light: {
        borderColor: colors.light_theme.secondary_background,
        backgroundColor: colors.light_theme.secondary_background,
    },
    inputContainer_dark: {
        borderColor: colors.dark_theme.secondary_background,
        backgroundColor: colors.dark_theme.secondary_background,
    },
    inputIcon: {
        marginRight: 12
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 8,
        fontSize: 18
    },
    input_light: {
        color: colors.light_theme.text_primary,
    },
    input_dark: {
        color: colors.dark_theme.text_primary,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        marginLeft: 8,
        marginRight: 4,
        fontSize: 18,
        fontWeight: '500',
    },
    checkboxLabel_light: {
        color: colors.light_theme.text_primary
    },
    checkboxLabel_dark: {
        color: colors.dark_theme.text_primary
    },
    socialSection: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    },
    divider: {
        height: 1,
        flex: 1
    },
    divider_light: {
        backgroundColor: colors.light_theme.tertiary_background,
    },
    divider_dark: {
        backgroundColor: colors.dark_theme.tertiary_background,
    },
    dividerText: {
        textAlign: 'center',
        fontSize: 16
    },
    dividerText_light: {
        color: colors.light_theme.text_secondary
    },
    dividerText_dark: {
        color: colors.dark_theme.text_secondary
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
        fontSize: 16,
        fontWeight: '600',
    },
    linkTermsAndConditions: {
        fontSize: 18,
        fontWeight: '500',
    },
    link_light: {
        color: colors.light_theme.text_accent,
    },
    link_dark: {
        color: colors.dark_theme.text_accent,
    },
    backButton: {
        padding: 10,
    },
    themeButton: {
        padding: 10,
    },
});