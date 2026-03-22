import { Stack } from 'expo-router';

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="index" options={{ title: 'Settings' }} />
            <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
            <Stack.Screen name="privacy" options={{ title: 'Privacy Settings' }} />
            <Stack.Screen name="notifications" options={{ title: 'Notification Settings' }} />
            <Stack.Screen name="language" options={{ title: 'Language' }} />
        </Stack>
    );
}
