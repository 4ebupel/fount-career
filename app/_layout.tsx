import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext } from "react";
import CustomModal from "@/components/CustomModal";
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider, ThemeContext } from '@/contexts/ThemeContext';
import { ModalProvider } from '@/contexts/ModalContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Status bar component to change the color of the status bar based on the theme since default 'auto' option doesn't work
function AppStatusBar() {
  const { theme } = useContext(ThemeContext);
  return <StatusBar style={theme === "dark" ? "light" : "dark"} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <ThemeProvider>
          <ModalProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen name="goal/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="addTask" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <CustomModal />
            <AppStatusBar />
          </ModalProvider>
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
