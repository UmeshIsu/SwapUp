import { palette } from '@/src/constants/palette';
import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { getMyRequests, withdrawLeaveRequest, LeaveRequest } from '@/src/services/leaveApi';
import { useAuth } from '@/src/contexts/AuthContext';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

type Tab = 'Pending' | 'Approved' | 'Declined';

export default function RequestStatus() {
    const { user } = useAuth();
    const EMPLOYEE_ID = user?.id || '';
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background },
        tabBar: {
            flexDirection: 'row',
            backgroundColor: theme.surface,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        tab: {
            flex: 1, paddingVertical: 14, alignItems: 'center',
            borderBottomWidth: 3, borderBottomColor: 'transparent',
        },
        activeTab: { borderBottomColor: palette.primary },
        tabText: { fontSize: 14, color: theme.textMuted, fontWeight: '600' },
        activeTabText: { color: palette.primary },
        content: { padding: 16, paddingBottom: 40 },
        emptyText: { textAlign: 'center', marginTop: 40, color: theme.textMuted, fontSize: 14 },
        card: {
            backgroundColor: theme.surface, borderRadius: 14, padding: 16, marginBottom: 14,
            elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.2 : 0.08, shadowRadius: 4,
        },
        cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
        avatar: {
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: theme.inputBg, justifyContent: 'center',
            alignItems: 'center', marginRight: 12,
        },
        leaveTypeName: { fontSize: 15, fontWeight: '700', color: theme.text },
        requestSubtitle: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
        statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
        statusText: { fontSize: 12, fontWeight: '700' },
        detailsBox: {
            backgroundColor: isDark ? '#1A1A2E' : '#f5f5f5',
            borderRadius: 10, padding: 12, marginBottom: 10,
        },
        detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
        calIcon: { fontSize: 18, marginRight: 10 },
        leaveDates: { fontSize: 13, color: theme.text, fontWeight: '500' },
        reasonText: { fontSize: 13, color: theme.text, flex: 1 },
        withdrawButton: {
            borderWidth: 1.5, borderColor: '#e53935',
            borderRadius: 8, paddingVertical: 11,
            alignItems: 'center',
            backgroundColor: isDark ? '#3A1515' : '#fff',
        },
        withdrawButtonText: { color: '#e53935', fontSize: 14, fontWeight: '600' },
    });

    const [activeTab, setActiveTab] = useState<Tab>('Pending');
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { loadRequests(); }, []);

    const loadRequests = async () => {
        if (!EMPLOYEE_ID) return;
        try {
            const data = await getMyRequests(EMPLOYEE_ID);
            setRequests(data);
        } catch {
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

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'approved': return { bg: isDark ? '#1A3A2A' : '#e8f5e9', text: isDark ? '#34D399' : '#2e7d32' };
            case 'declined': return { bg: isDark ? '#3A1515' : '#fce4ec', text: isDark ? '#F87171' : '#c62828' };
            default: return { bg: isDark ? '#2A2010' : '#fff3e0', text: isDark ? '#FBBF24' : '#f57c00' };
        }
    };

    const handleWithdraw = (request: LeaveRequest) => {
        Alert.alert(
            'Withdraw Request',
            `Withdraw leave request from ${formatDate(request.startDate)} to ${formatDate(request.endDate)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw', style: 'destructive',
                    onPress: async () => {
                        try { await withdrawLeaveRequest(request.id); } catch {}
                        setRequests((prev) => prev.filter((r) => r.id !== request.id));
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {(['Pending', 'Approved', 'Declined'] as Tab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {filteredRequests.length === 0 ? (
                    <Text style={styles.emptyText}>No {activeTab.toLowerCase()} requests</Text>
                ) : (
                    filteredRequests.map((request) => {
                        const badgeStyle = getStatusBadgeStyle(request.status);
                        return (
                            <View key={request.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatar}>
                                        <Text style={{ fontSize: 22 }}>👤</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.leaveTypeName}>{request.leave_type_name}</Text>
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

                                <View style={styles.detailsBox}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.calIcon}>📅</Text>
                                        <Text style={styles.leaveDates}>
                                            {formatDate(request.startDate)} – {formatDate(request.endDate)}
                                        </Text>
                                    </View>
                                    {request.reason ? (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.calIcon}>📝</Text>
                                            <Text style={styles.reasonText}>{request.reason}</Text>
                                        </View>
                                    ) : null}
                                </View>

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
