import { StyleSheet, ScrollView, TouchableOpacity, Switch, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useAppTheme } from '@/src/context/ThemeContext';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { useAuth } from '@/src/contexts/AuthContext';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { isDark, toggleTheme } = useAppTheme();
    const router = useRouter();
    const { logout } = useAuth();

    const settingsItems = [
        { label: 'Change Password', route: '/(employee)/profile/settings/change-password', icon: 'lock' },
        { label: 'Privacy Settings', route: '/(employee)/profile/settings/privacy', icon: 'lock.shield' },
        { label: 'Notification Settings', route: '/(employee)/profile/settings/notifications', icon: 'bell' },
        { label: 'Language', route: '/(employee)/profile/settings/language', icon: 'globe' },
    ];

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <ThemedView style={styles.header}>
                <ThemedText type="subtitle">Settings</ThemedText>
            </ThemedView>

            <ThemedView style={[styles.item, { backgroundColor: theme.background === '#fff' ? '#F9F9F9' : '#252525' }]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.background === '#fff' ? '#E8E8E8' : '#3C3C3C' }]}>
                    <IconSymbol name="moon.fill" size={20} color={theme.icon} />
                </View>
                <ThemedText style={styles.label}>Dark Mode</ThemedText>
                <View style={{ flex: 1 }} />
                <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: theme.tint }} />
            </ThemedView>

            {settingsItems.map((item) => (
                <TouchableOpacity
                    key={item.label}
                    style={[styles.item, { backgroundColor: theme.background === '#fff' ? '#F9F9F9' : '#252525' }]}
                    onPress={() => router.push(item.route as any)}
                >
                    <View style={[styles.iconContainer, { backgroundColor: theme.background === '#fff' ? '#E8E8E8' : '#3C3C3C' }]}>
                        <IconSymbol name={item.icon as any} size={20} color={theme.icon} />
                    </View>
                    <ThemedText style={styles.label}>{item.label}</ThemedText>
                    <View style={{ flex: 1 }} />
                    <IconSymbol name="chevron.right" size={20} color={theme.icon} />
                </TouchableOpacity>
            ))}

            {/* Logout Button */}
            <TouchableOpacity
                style={[styles.item, styles.logoutItem]}
                onPress={handleLogout}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: '#FDECEA' }]}>
                    <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#D32F2F" />
                </View>
                <ThemedText style={[styles.label, { color: '#D32F2F' }]}>Log Out</ThemedText>
                <View style={{ flex: 1 }} />
                <IconSymbol name="chevron.right" size={20} color="#D32F2F" />
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    logoutItem: {
        marginTop: 10,
    },
});
