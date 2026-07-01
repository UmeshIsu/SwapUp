import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationAPI } from '@/src/services/api';
import socketService from '@/src/services/socketService';
import ScreenHeader from '@/src/components/ScreenHeader';
import { getNotificationMeta, formatRelativeTime, AppNotification } from '@/src/utils/notificationMeta';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const styles = makeStyles(theme, isDark);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await notificationAPI.getMyNotifications();
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [fetchNotifications])
    );

    useEffect(() => {
        const unsubscribe = socketService.onNotification((notification) => {
            setNotifications((prev) => [notification, ...prev]);
        });
        return unsubscribe;
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handlePress = async (item: AppNotification) => {
        if (item.isRead) return;
        setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
        try {
            await notificationAPI.markAsRead(item.id);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const renderItem = ({ item }: { item: AppNotification }) => {
        const meta = getNotificationMeta(item.type);
        return (
            <TouchableOpacity
                style={[styles.card, !item.isRead && styles.cardUnread]}
                activeOpacity={0.7}
                onPress={() => handlePress(item)}
            >
                <View style={[styles.iconContainer, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon as any} size={20} color={meta.color} />
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.message}>{item.message}</Text>
                    <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Notifications" />
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-outline" size={48} color={theme.textMuted} />
                            <Text style={styles.emptyTitle}>No notifications yet</Text>
                            <Text style={styles.emptySubtitle}>
                                You&apos;ll see updates about leave and swap requests here.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const makeStyles = (theme: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
        gap: 10,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.surface,
        padding: 14,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    cardUnread: {
        borderLeftWidth: 3,
        borderLeftColor: theme.primary,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        color: theme.textSecondary,
        lineHeight: 18,
    },
    time: {
        fontSize: 11,
        color: theme.textMuted,
        marginTop: 6,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.primary,
        marginLeft: 8,
        marginTop: 4,
    },
    emptyContainer: {
        paddingVertical: 80,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: theme.textMuted,
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
