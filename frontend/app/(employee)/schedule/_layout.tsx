import { Stack } from 'expo-router';
import { useHeaderOptions } from '@/src/constants/headerOptions';

export default function ScheduleLayout() {
    const headerOptions = useHeaderOptions();
    return (
        <Stack screenOptions={headerOptions}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[shiftId]" options={{ title: 'Shift Details' }} />
        </Stack>
    );
}
