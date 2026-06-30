import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationAPI } from '@/src/services/api';
import socketService from '@/src/services/socketService';
import ScreenHeader from '@/src/components/ScreenHeader';
import { getNotificationMeta, formatRelativeTime, AppNotification } from '@/src/utils/notificationMeta';

const C = {
    bg: '#F8F9FA',
    card: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#94A3B8',
};

export default function ManagerNotificationsScreen() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
                    <ActivityIndicator size="large" color="#1373D0" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-outline" size={48} color="#C5C5C7" />
                            <Text style={styles.emptyTitle}>No notifications yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Swap requests, leave requests, and fatigue alerts will show up here.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
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
        backgroundColor: C.card,
        padding: 14,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    cardUnread: {
        borderLeftWidth: 3,
        borderLeftColor: '#1373D0',
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
        color: C.text,
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
    },
    time: {
        fontSize: 11,
        color: C.textMuted,
        marginTop: 6,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1373D0',
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
        color: C.text,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: C.textMuted,
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
