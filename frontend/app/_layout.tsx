// _layout.tsx - Root navigation layout
// This is the top-level navigator that wraps all screens in the app
// It registers both the (employee) and (manager) groups

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { AppThemeProvider } from '@/src/context/ThemeContext';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppThemeProvider>
        <RootNavigator />
      </AppThemeProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        wasAuthenticated.current = true;
      } else if (wasAuthenticated.current) {
        // User was logged in and is now logged out — redirect to role selection
        wasAuthenticated.current = false;
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(employee)" />
        <Stack.Screen name="(manager)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
        <Stack.Screen name="modals/export-report" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
