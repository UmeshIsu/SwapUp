// _layout.tsx
// Stack navigator for all Employee Leave screens
// This controls how screens slide in/out when navigating

import { Stack } from 'expo-router';

export default function LeaveLayout() {
    return (
        <Stack>
            {/* Screen 1: Leave Dashboard */}
            <Stack.Screen
                name="index"
                options={{
                    title: 'Request Time Off',
                    headerTitleAlign: 'center',
                }}
            />
            {/* Screen 2: Apply for a Leave form */}
            <Stack.Screen
                name="apply"
                options={{
                    title: 'Request Time Off',
                    headerTitleAlign: 'center',
                }}
            />
            {/* Screen 3: Pending Leave Requests */}
            <Stack.Screen
                name="pending"
                options={{
                    title: 'Pending Leave Requests',
                    headerTitleAlign: 'center',
                }}
            />
            {/* Screen 4: Leave Request Sent confirmation */}
            <Stack.Screen
                name="sent"
                options={{
                    title: 'Request Sent',
                    headerTitleAlign: 'center',
                    headerShown: false, // hide header on success screen
                }}
            />
        </Stack>
    );
}
