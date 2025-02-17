import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Button from '@/components/Button';

interface AuthFooterProps {
    isSignUp: boolean;
    onClick: () => void;
}

export default function AuthFooter({ isSignUp, onClick }: AuthFooterProps) {
    return (
        <View style={styles.footer}>
            <Button label={isSignUp ? 'Sign up' : 'Sign in'} variant="primary" onPress={onClick} />
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#1F222A'
    },
    prompt: {
        color: '#FFF',
        fontSize: 18
    },
    link: {
        color: '#FFA914',
        fontSize: 18
    }
});