// _layout.tsx - Manager group layout
// Expo Router needs a layout file in each route group folder
// This one just passes through with no extra header

import { Stack } from 'expo-router';

export default function ManagerLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} />
    );
}
