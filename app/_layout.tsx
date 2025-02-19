import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext } from "react";
import { ThemeProvider, ThemeContext } from '@/contexts/ThemeContext';

// Status bar component to change the color of the status bar based on the theme since default 'auto' option doesn't work
function AppStatusBar() {
  const { theme } = useContext(ThemeContext);
  return <StatusBar style={theme === "dark" ? "light" : "dark"} />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <AppStatusBar />
    </ThemeProvider>
  );
}
