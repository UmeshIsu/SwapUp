import { Stack } from "expo-router";

export default function EmployeeLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="analysis" />
            <Stack.Screen name="chat" />
            <Stack.Screen name="leave" />
            <Stack.Screen name="schedule" />
            <Stack.Screen name="swap" />
        </Stack>
    );
}
