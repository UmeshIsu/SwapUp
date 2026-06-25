import { Stack } from 'expo-router';
import { appHeaderOptions } from '@/src/constants/headerOptions';

export default function ScheduleLayout() {
    return (
        <Stack screenOptions={appHeaderOptions}>
            {/* Index uses its own in-screen "Full Schedule" header (with export action),
                so the navigator header is hidden to avoid a duplicate title. */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[shiftId]" options={{ title: 'Shift Details' }} />
        </Stack>
    );
}
