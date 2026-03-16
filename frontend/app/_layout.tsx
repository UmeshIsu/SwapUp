// _layout.tsx - Root navigation layout
// This is the top-level navigator that wraps all screens in the app
// It registers both the (employee) and (manager) groups

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Employee screens group */}
        <Stack.Screen name="(employee)" options={{ headerShown: false }} />

        {/* Manager screens group */}
        <Stack.Screen name="(manager)" options={{ headerShown: false }} />

        {/* Legacy tabs group (keep for compatibility) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Modal screen */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
