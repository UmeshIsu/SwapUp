import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '@/src/components/CustomTabBar';

export default function EmployeeLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="schedule/index" options={{ title: 'My Schedule' }} />
            <Tabs.Screen name="chat/index" options={{ title: 'Chat' }} />
            <Tabs.Screen name="leave/index" options={{ title: 'Leave' }} />
            <Tabs.Screen name="analysis/index" options={{ title: 'Reports' }} />

            <Tabs.Screen name="profile/index" options={{ href: null }} />
            <Tabs.Screen name="notifications" options={{ href: null }} />
            <Tabs.Screen name="swap/index" options={{ href: null }} />
        </Tabs>
    );
}

