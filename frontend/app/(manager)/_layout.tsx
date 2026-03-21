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
            <Tabs.Screen name="chat/index" />
            <Tabs.Screen name="leaveManagment" />
            
            {/* Added from merge */}
            <Tabs.Screen name="managerDashboard/index" options={{ href: null }} />
            <Tabs.Screen name="export-report" options={{ href: null }} />
            <Tabs.Screen name="roleManagement/index" options={{ href: null }} />
        </Tabs>
    );
}
