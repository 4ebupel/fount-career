import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '@/components/Button';
import { ThemeContext } from '@/contexts/ThemeContext';
import { colors } from '@/lib/colors';

interface AuthFooterProps {
    isSignUp: boolean;
    onClick: () => void;
}

export default function AuthFooter({ isSignUp, onClick }: AuthFooterProps) {
    const { theme } = useContext(ThemeContext);
    return (
        <View style={[styles.footer, theme === 'dark' ? styles.footer_dark : styles.footer_light]}>
            <Button label={isSignUp ? 'Sign up' : 'Sign in'} variant="primary" onPress={onClick} theme={theme} />
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        flex: 1,
        minHeight: 90,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderTopWidth: 1,
    },
    footer_light: {
        borderTopColor: colors.light_theme.tertiary_background,
        backgroundColor: colors.light_theme.background
    },
    footer_dark: {
        borderTopColor: colors.dark_theme.background,
        backgroundColor: colors.dark_theme.background
    },
    link: {
        color: '#FFA914',
        fontSize: 18
    }
});