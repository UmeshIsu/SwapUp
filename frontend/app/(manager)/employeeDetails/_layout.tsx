import { Stack } from 'expo-router';
import { useHeaderOptions } from '@/src/constants/headerOptions';

export default function EmployeeDetailsLayout() {
    const headerOptions = useHeaderOptions();
    return (
        <Stack screenOptions={headerOptions}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
