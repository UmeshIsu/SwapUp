import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="index" options={{ title: 'Profile' }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
    );
}
