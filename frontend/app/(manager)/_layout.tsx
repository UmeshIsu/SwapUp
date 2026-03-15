import { Stack } from 'expo-router';
import { ManagerColors } from '@/src/constants/managerColors';

export default function ManagerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: ManagerColors.neutral[50] },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="managerDashboard/index" options={{ headerShown: false }} />
      <Stack.Screen name="swapReview/index" options={{ headerShown: true, title: 'swap review', headerBackTitle: 'dashboard' }} />
      <Stack.Screen name="leaveManagment/index" options={{ headerShown: true, title: 'leave management', headerBackTitle: 'dashboard' }} />
      <Stack.Screen name="fatigueAlert/index" options={{ headerShown: true, title: 'fatigue alerts', headerBackTitle: 'dashboard' }} />
      <Stack.Screen name="annoucments/index" options={{ headerShown: true, title: 'announcements', headerBackTitle: 'dashboard' }} />
      <Stack.Screen name="chat/index" options={{ headerShown: true, title: 'team chat', headerBackTitle: 'dashboard' }} />
      <Stack.Screen name="userProfile/index" options={{ headerShown: true, title: 'profile', headerBackTitle: 'dashboard' }} />
      <Stack.Screen name="employeeDetails/index" options={{ headerShown: true, title: 'employee details', headerBackTitle: 'dashboard' }} />
    </Stack>
  );
}
