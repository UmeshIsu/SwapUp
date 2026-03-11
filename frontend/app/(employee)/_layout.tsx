import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/constants/colors";

export default function EmployeeLayout() {
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
                name="analysis"
                options={{
                    title: "Analysis",
                    tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: "Chat",
                    tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="leave"
                options={{
                    title: "Leave",
                    tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    title: "Schedule",
                    tabBarIcon: ({ color, size }) => <Ionicons name="time" color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="swap"
                options={{
                    title: "Swap",
                    tabBarIcon: ({ color, size }) => <Ionicons name="repeat" color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
