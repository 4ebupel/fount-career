import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useContext, useEffect, useState } from "react";
import CustomModal from "@/components/CustomModal";
import { ThemeProvider, ThemeContext } from '@/contexts/ThemeContext';
import { ModalProvider } from '@/contexts/ModalContext';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
// Status bar component to change the color of the status bar based on the theme since default 'auto' option doesn't work
function AppStatusBar() {
  const { theme } = useContext(ThemeContext);
  return <StatusBar style={theme === "dark" ? "light" : "dark"} />;
}

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true,
})

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {

      } catch (error) {
        console.warn(error);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <ThemeProvider>
          <DatabaseProvider>
            <ModalProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="home" options={{ headerShown: false }} />
                <Stack.Screen name="goal/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="addTask" options={{ headerShown: false }} />
                <Stack.Screen name="addHabit" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <CustomModal />
              <AppStatusBar />
            </ModalProvider>
          </DatabaseProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
