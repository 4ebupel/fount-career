import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ThemeProvider } from '@/contexts/ThemeContext';
export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
