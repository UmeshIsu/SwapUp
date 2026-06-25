// _layout.tsx - Manager Leave Management navigator
// Simple stack navigator for the manager's leave screens

import { Stack } from 'expo-router';
import { appHeaderOptions } from '@/src/constants/headerOptions';

export default function ManagerLeaveLayout() {
    return (
        <Stack screenOptions={appHeaderOptions}>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="approved"
                options={{
                    title: 'Approved Leaves',
                    headerTitleAlign: 'center',
                }}
            />
        </Stack>
    );
}
