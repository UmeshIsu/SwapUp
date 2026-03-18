// _layout.tsx - Manager Leave Management navigator
// Simple stack navigator for the manager's leave screens

import { Stack } from 'expo-router';

export default function ManagerLeaveLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Leave Requests',
                    headerTitleAlign: 'center',
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
