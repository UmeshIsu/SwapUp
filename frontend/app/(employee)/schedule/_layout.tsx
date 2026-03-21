import { Stack } from 'expo-router';

export default function ScheduleLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'My Schedule' }} />
            <Stack.Screen name="[shiftId]" options={{ title: 'Shift Details' }} />
        </Stack>
    );
}
