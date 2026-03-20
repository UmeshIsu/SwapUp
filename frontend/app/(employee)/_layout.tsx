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
            <Tabs.Screen name="home" />
            <Tabs.Screen name="schedule/index" />
            <Tabs.Screen 
                name="swap/initiate" 
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen name="chat" />
            <Tabs.Screen name="leave" />
            <Tabs.Screen name="analysis/index" />
        </Tabs>
    );
}
