import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';

import { HapticTab } from '@/src/components/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

function TabBarIcon({ name, focused, color }: { name: any, focused: boolean, color: string }) {
    if (focused) {
        return (
            <View style={styles.activeIconContainer}>
                <IconSymbol size={28} name={name} color="#1E293B" />
                <View style={styles.activeIndicator} />
            </View>
        );
    }

    return (
        <View style={styles.inactiveIconContainer}>
            <IconSymbol size={28} name={name} color="#94A3B8" />
        </View>
    );
}

export default function ManagerLayout() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused, color }) => <TabBarIcon focused={focused} color={color} name="house.fill" />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused, color }) => <TabBarIcon focused={focused} color={color} name="person.text.rectangle" />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: Platform.OS === 'ios' ? 85 : 70,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingHorizontal: 10,
    },
    activeIconContainer: {
        width: 60,
        height: 50,
        backgroundColor: '#E0F2FE', // Light blue background for active tab
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    inactiveIconContainer: {
        width: 60,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 8,
        width: 20,
        height: 3,
        backgroundColor: '#0284C7', // Darker blue line
        borderRadius: 2,
    }
});
