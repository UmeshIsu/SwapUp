// requestStatus.tsx - Request Status Screen (replaces old pending.tsx for employees)
// Tabbed view: Pending | Approved | Declined
// Employee can see all their requests and their current status

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getMyRequests, withdrawLeaveRequest, LeaveRequest } from '@/src/services/leaveApi';
import { useAuth } from '@/src/contexts/AuthContext';

type Tab = 'Pending' | 'Approved' | 'Declined';

export default function RequestStatus() {
    const router = useRouter();
    const { user } = useAuth();
    const EMPLOYEE_ID = user?.id || '';

    const [activeTab, setActiveTab] = useState<Tab>('Pending');
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        if (!EMPLOYEE_ID) return;
        try {
            const data = await getMyRequests(EMPLOYEE_ID);
            setRequests(data);
        } catch (error) {
            setRequests([]);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadRequests();
        setRefreshing(false);
    }, [EMPLOYEE_ID]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredRequests = requests.filter((r) => r.status === activeTab.toLowerCase());

    const handleWithdraw = (request: LeaveRequest) => {
        Alert.alert(
            'Withdraw Request',
            `Withdraw leave request from ${formatDate(request.startDate)} to ${formatDate(request.endDate)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await withdrawLeaveRequest(request.id);
                        } catch (error) {
                            // Offline fallback
                        }
                        setRequests((prev) => prev.filter((r) => r.id !== request.id));
                    },
                },
            ]
        );
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'approved':
                return { bg: '#e8f5e9', text: '#2e7d32' };
            case 'declined':
                return { bg: '#fce4ec', text: '#c62828' };
            default:
                return { bg: '#fff3e0', text: '#f57c00' };
        }
    };

    return (
        <View style={styles.container}>
            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {(['Pending', 'Approved', 'Declined'] as Tab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Request List */}
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredRequests.length === 0 ? (
                    <Text style={styles.emptyText}>No {activeTab.toLowerCase()} requests</Text>
                ) : (
                    filteredRequests.map((request) => {
                        const badgeStyle = getStatusBadgeStyle(request.status);
                        return (
                            <View key={request.id} style={styles.card}>
                                {/* Header with name and status */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatar}>
                                        <Text style={{ fontSize: 22 }}>👤</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.leaveTypeName}>
                                            {request.leave_type_name}
                                        </Text>
                                        <Text style={styles.requestSubtitle}>
                                            {request.dayType === 'half' ? 'Half day' : 'Full day'}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                                        <Text style={[styles.statusText, { color: badgeStyle.text }]}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Date details */}
                                <View style={styles.detailsBox}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.calIcon}>📅</Text>
                                        <View>
                                            <Text style={styles.leaveDates}>
                                                {formatDate(request.startDate)} – {formatDate(request.endDate)}
                                            </Text>
                                        </View>
                                    </View>
                                    {request.reason ? (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.calIcon}>📝</Text>
                                            <Text style={styles.reasonText}>{request.reason}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                {/* Withdraw button — only for pending */}
                                {request.status === 'pending' && (
                                    <TouchableOpacity
                                        style={styles.withdrawButton}
                                        onPress={() => handleWithdraw(request)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.withdrawButtonText}>Withdraw Request</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fb' },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: { borderBottomColor: '#1a73e8' },
    tabText: { fontSize: 14, color: '#888', fontWeight: '600' },
    activeTabText: { color: '#1a73e8' },
    content: { padding: 16, paddingBottom: 40 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#aaa', fontSize: 14 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#e3f2fd', justifyContent: 'center',
        alignItems: 'center', marginRight: 12,
    },
    leaveTypeName: { fontSize: 15, fontWeight: '700', color: '#111' },
    requestSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: { fontSize: 12, fontWeight: '700' },

    detailsBox: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    calIcon: { fontSize: 18, marginRight: 10 },
    leaveDates: { fontSize: 13, color: '#555', fontWeight: '500' },
    reasonText: { fontSize: 13, color: '#777', flex: 1 },

    withdrawButton: {
        borderWidth: 1.5, borderColor: '#e53935',
        borderRadius: 8, paddingVertical: 11,
        alignItems: 'center', backgroundColor: '#fff',
    },
    withdrawButtonText: { color: '#e53935', fontSize: 14, fontWeight: '600' },
});
