// _layout.tsx - Employee group layout
// Expo Router needs a layout file in each route group folder
// This one just passes through with no extra header

import { Stack } from 'expo-router';

export default function EmployeeLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} />
    );
}
