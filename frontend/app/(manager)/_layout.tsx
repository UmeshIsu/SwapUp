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
            <Tabs.Screen name="home" />
            <Tabs.Screen name="schedule/index" />
            <Tabs.Screen name="employeeDetails/index" />
            <Tabs.Screen name="chat" />
            <Tabs.Screen name="leaveManagment" />
            <Tabs.Screen name="profile" options={{ href: null }} />
            <Tabs.Screen name="userProfile" options={{ href: null }} />
        </Tabs>
    );
}

