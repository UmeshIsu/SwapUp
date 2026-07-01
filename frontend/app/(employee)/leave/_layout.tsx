import { Stack } from 'expo-router';
import { useHeaderOptions } from '@/src/constants/headerOptions';

export default function LeaveLayout() {
    const headerOptions = useHeaderOptions();
    return (
        <Stack screenOptions={headerOptions}>
            <Stack.Screen name="index" options={{ title: 'Request Time Off', headerTitleAlign: 'center' }} />
            <Stack.Screen name="apply" options={{ title: 'Request Time Off', headerTitleAlign: 'center' }} />
            <Stack.Screen name="requestStatus" options={{ title: 'Request Status', headerTitleAlign: 'center' }} />
            <Stack.Screen name="pending" options={{ title: 'Pending Leave Requests', headerTitleAlign: 'center' }} />
            <Stack.Screen name="sent" options={{ title: 'Request Sent', headerTitleAlign: 'center', headerShown: false }} />
        </Stack>
    );
}
