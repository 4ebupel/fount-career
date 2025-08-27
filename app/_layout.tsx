import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { EventProvider } from 'react-native-outside-press';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useContext, useEffect, useState } from "react";
import CustomModal from "@/components/CustomModal";
import { ThemeProvider, ThemeContext } from '@/contexts/ThemeContext';
import { ModalProvider } from '@/contexts/ModalContext';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from "expo-notifications";
import { useAppLifecycleEffect } from '@/hooks/useAppLifecycleEffect';
import { scheduleRemindersForNWeeks } from '@/lib/scheduleRemindersForNWeeks';
// import { initializeFirebase } from '@/lib/firebaseConfig';
// Enable screens for better navigation performance
enableScreens();


// Status bar component to change the color of the status bar based on the theme since default 'auto' option doesn't work
function AppStatusBar() {
  const { theme } = useContext(ThemeContext);
  return <StatusBar style={theme === "dark" ? "light" : "dark"} />;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true,
})

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useAppLifecycleEffect(() => {
    console.log('App started');
    scheduleRemindersForNWeeks();
  }, () => {
    console.log('App resumed');
    scheduleRemindersForNWeeks();
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize Firebase before any other Firebase services
        // await initializeFirebase();
      } catch (error) {
        console.warn('Firebase initialization error:', error);
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
    <EventProvider> {/* This is used to detect outside clicks */}
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <SafeAreaProvider>
          <ThemeProvider>
            <NotificationProvider>
              <DatabaseProvider>
                <ModalProvider>
                  <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="home" options={{ headerShown: false }} />
                    <Stack.Screen name="goal/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="task" options={{ headerShown: false }} />
                    <Stack.Screen name="habit" options={{ headerShown: false }} />
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <CustomModal />
                  <AppStatusBar />
                </ModalProvider>
              </DatabaseProvider>
            </NotificationProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </EventProvider>
  );
}
