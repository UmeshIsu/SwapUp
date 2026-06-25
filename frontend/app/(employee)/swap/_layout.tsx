import { Stack } from 'expo-router';

// Stack navigator for the shift-swap flow so back navigation is linear:
//   schedule → initiate → find-colleague → swap-summary
// (Previously these were flat tab routes, so "back" jumped to the home tab.)
export default function SwapLayout() {
    return <Stack screenOptions={{ headerShown: false }} />;
}
