import { Stack } from 'expo-router';
import { useHeaderOptions } from '@/src/constants/headerOptions';

export default function ManagerLeaveLayout() {
    const headerOptions = useHeaderOptions();
    return (
        <Stack screenOptions={headerOptions}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="approved" options={{ title: 'Approved Leaves', headerTitleAlign: 'center' }} />
        </Stack>
    );
}
