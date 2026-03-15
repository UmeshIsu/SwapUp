import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/constants/colors";

export default function ManagerLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.muted,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopColor: colors.border,
                    height: 62,
                    paddingBottom: 10,
                    paddingTop: 8,
                },
            }}
        >
            <Tabs.Screen
                name="managerDashboard/index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => <Ionicons name="apps" color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="export-report"
                options={{
                    title: "Reports",
                    tabBarIcon: ({ color, size }) => <Ionicons name="document-text" color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="roleManagement/index"
                options={{
                    title: "Roles",
                    tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
