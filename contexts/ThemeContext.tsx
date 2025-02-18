import * as React from 'react';
import { createContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'auto' | 'light' | 'dark';

export interface ThemeContextProps {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  changeThemeMode: (mode: ThemeMode) => Promise<void>;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'dark',
  themeMode: 'auto',
  changeThemeMode: async () => {},
});

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );

  // Load persisted theme mode on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('themeMode');
        if (savedThemeMode === 'auto' || savedThemeMode === 'light' || savedThemeMode === 'dark') {
          setThemeMode(savedThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      }
    };
    loadTheme();
  }, []);

  // Update effective theme when themeMode changes
  useEffect(() => {
    if (themeMode === 'auto') {
      const systemTheme = Appearance.getColorScheme();
      setTheme(systemTheme === 'dark' ? 'dark' : 'light');
    } else {
      setTheme(themeMode);
    }
  }, [themeMode]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
        if (themeMode === 'auto') {
          setTheme(colorScheme === 'dark' ? 'dark' : 'light');
        }
      }
    );
    return () => subscription.remove();
  }, [themeMode]);

  const changeThemeMode = async (mode: ThemeMode): Promise<void> => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
    setThemeMode(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, changeThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
