import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_COLOR = '#1373D0';
const ACTIVE_BG = 'rgba(19, 115, 208, 0.24)';


const TAB_ICONS: Record<string, { light: any; dark: any }> = {
    // ── Employee tabs ──────────────────────────────────────────────────────────
    'home': { light: require('@/assets/images/ETaskBar/HomeLight.png'), dark: require('@/assets/images/ETaskBar/HomeDark.png') },
    'chat': { light: require('@/assets/images/ETaskBar/EChatLight.png'), dark: require('@/assets/images/ETaskBar/EChatDark.png') },
    'leave': { light: require('@/assets/images/ETaskBar/LeaveLight.png'), dark: require('@/assets/images/ETaskBar/LeaveDark.png') },
    'analysis': { light: require('@/assets/images/ETaskBar/EReportLight.png'), dark: require('@/assets/images/ETaskBar/EReportDark.png') },

    // ── Manager-only tabs ──────────────────────────────────────────────────────
    'schedule/index': { light: require('@/assets/images/ETaskBar/ESheduleLight.png'), dark: require('@/assets/images/ETaskBar/ESheduleDark.png') },
    'employeeDetails/index': { light: require('@/assets/images/ETaskBar/EmployeesLight.png'), dark: require('@/assets/images/ETaskBar/EmployeesDark.png') },
    'leaveManagment': { light: require('@/assets/images/ETaskBar/LeaveLight.png'), dark: require('@/assets/images/ETaskBar/LeaveDark.png') },
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                const icons = TAB_ICONS[route.name];
                if (!icons || (options as any).href === null) return null; // Hide tabs that don't have configured icons or have href: null

                const iconSource = isFocused ? icons.dark : icons.light;

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tabButton}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.iconWrapper,
                                isFocused && styles.iconWrapperActive,
                            ]}
                        >
                            {iconSource != null ? (
                                <Image
                                    source={iconSource}
                                    style={styles.icon}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.iconFallback} />
                            )}
                            {isFocused && <View style={styles.activeBar} />}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        paddingTop: 8,
        paddingHorizontal: 10,
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 2,
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 62,
        height: 62,
        borderRadius: 13,
    },
    iconWrapperActive: {
        backgroundColor: ACTIVE_BG,
    },
    icon: {
        width: 32,
        height: 32,
    },
    iconFallback: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#D0D0D0',
    },
    activeBar: {
        width: 22,
        height: 3.5,
        borderRadius: 2,
        backgroundColor: ACTIVE_COLOR,
        marginTop: 4,
    },
});