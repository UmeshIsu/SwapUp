// _layout.tsx - Manager Employee Details navigator
// Stack navigator so each [id] push gets its own screen instance instead of
// being reused as a single cached tab route (which caused every click to
// show whichever employee was opened first).

import { Stack } from 'expo-router';
import { appHeaderOptions } from '@/src/constants/headerOptions';

export default function EmployeeDetailsLayout() {
    return (
        <Stack screenOptions={appHeaderOptions}>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
