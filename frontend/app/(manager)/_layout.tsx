import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '@/src/components/CustomTabBar';

export default function ManagerLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="schedule/index" options={{ title: 'Schedule' }} />
            <Tabs.Screen name="employeeDetails/index" options={{ title: 'Employees' }} />
            <Tabs.Screen name="chat/index" options={{ title: 'Chat' }} />
            <Tabs.Screen name="leaveManagment/index" options={{ title: 'Leave' }} />

            <Tabs.Screen name="profile/index" options={{ href: null }} />
            <Tabs.Screen name="managerDashboard/index" options={{ href: null }} />
            <Tabs.Screen name="annoucments/index" options={{ href: null }} />
            <Tabs.Screen name="fatigueAlert/index" options={{ href: null }} />
            <Tabs.Screen name="swapReview/index" options={{ href: null }} />
            <Tabs.Screen name="userProfile/index" options={{ href: null }} />
        </Tabs>
    );
}
