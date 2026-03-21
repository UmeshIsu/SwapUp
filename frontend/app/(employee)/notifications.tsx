import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'Manager Announcements',
        message: 'Mandatory staff meeting will be held on tomorrow',
        timestamp: '2 hours ago'
    },
    {
        id: '2',
        title: 'Manager Announcements',
        message: 'Mandatory staff meeting will be held on tomorrow',
        timestamp: '5 hours ago'
    },
    {
        id: '3',
        title: 'Manager Announcements',
        message: 'Mandatory staff meeting will be held on tomorrow',
        timestamp: '1 day ago'
    },
];

export default function NotificationsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={theme.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
                <View style={{ width: 24 }} />
            </ThemedView>

            {/* Notifications List */}
            <ThemedView style={styles.list}>
                {mockNotifications.map((notification) => (
                    <TouchableOpacity 
                        key={notification.id}
                        style={[styles.notificationCard, { backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#FFFFFF' }]}
                    >
                        <View style={styles.iconContainer}>
                            <IconSymbol name="megaphone.fill" size={24} color="#FF5A5F" />
                        </View>
                        <View style={styles.content}>
                            <ThemedText style={styles.title}>{notification.title}</ThemedText>
                            <ThemedText style={styles.message}>{notification.message}</ThemedText>
                        </View>
                    </TouchableOpacity>
                ))}
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 20,
        gap: 12,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    message: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
    },
});
