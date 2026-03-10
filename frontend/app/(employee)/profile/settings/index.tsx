import { StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useAppTheme } from '@/src/context/ThemeContext';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { isDark, toggleTheme } = useAppTheme();
    const router = useRouter();

    const settingsItems = [
        { label: 'Change Password', route: '/(employee)/profile/settings/change-password' },
        { label: 'Privacy Settings', route: '/(employee)/profile/settings/privacy' },
        { label: 'Notification Settings', route: '/(employee)/profile/settings/notifications' },
        { label: 'Language', route: '/(employee)/profile/settings/language' },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <ThemedView style={styles.header}>
                <ThemedText type="subtitle">Settings</ThemedText>
            </ThemedView>

            <ThemedView style={[styles.item, { backgroundColor: theme.background === '#fff' ? '#F9F9F9' : '#252525' }]}>
                <ThemedText style={styles.label}>Dark Mode</ThemedText>
                <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: theme.tint }} />
            </ThemedView>

            {settingsItems.map((item) => (
                <TouchableOpacity
                    key={item.label}
                    style={[styles.item, { backgroundColor: theme.background === '#fff' ? '#F9F9F9' : '#252525' }]}
                    onPress={() => router.push(item.route as any)}
                >
                    <ThemedText style={styles.label}>{item.label}</ThemedText>
                    <IconSymbol name="chevron.right" size={20} color={theme.icon} />
                </TouchableOpacity>
            ))}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
});
