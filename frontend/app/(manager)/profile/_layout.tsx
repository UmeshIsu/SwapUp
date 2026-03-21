import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: 'Profile', headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
    );
}
