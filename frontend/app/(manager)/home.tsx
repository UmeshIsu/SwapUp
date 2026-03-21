import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
    Modal,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { shiftAPI } from '@/src/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnDutyEmployee {
    id: string;
    name: string;
    avatarUrl?: string | null;
    checkedInAt: string;
    shiftStart: string;
}

interface LateEmployee extends OnDutyEmployee {
    lateByMinutes: number;
}

interface AbsentEmployee {
    id: string;
    name: string;
    avatarUrl?: string | null;
    shiftStart: string;
    shiftEnd: string;
}

interface FatigueAlert {
    id: string;
    name: string;
    avatarUrl?: string | null;
    checkedInAt: string;
    hoursWorked: number;
    message: string;
}

interface DashboardStats {
    onDutyCount: number;
    lateCount: number;
    absenteeCount: number;
    totalScheduled: number;
    fatigueAlertCount: number;
    onDuty: OnDutyEmployee[];
    lateCheckIns: LateEmployee[];
    absentees: AbsentEmployee[];
    fatigueAlerts: FatigueAlert[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
    try {
        return new Date(iso).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return '';
    }
}

function formatLate(minutes: number): string {
    if (minutes < 60) return `${minutes} min late`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m late` : `${hrs}h late`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManagerHomeScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal state
    const [modalType, setModalType] = useState<'onDuty' | 'late' | 'absentees' | 'fatigue' | null>(null);
    const [bellModalVisible, setBellModalVisible] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const response = await shiftAPI.getManagerDashboardStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const openModal = (type: 'onDuty' | 'late' | 'absentees' | 'fatigue') => {
        setModalType(type);
    };

    const fatigueCount = stats?.fatigueAlertCount ?? 0;

    // ─── Modal Content Renderers ──────────────────────────────────────────

    const renderOnDutyItem = ({ item }: { item: OnDutyEmployee }) => (
        <View style={ms.row}>
            <View style={ms.avatar}>
                <Ionicons name="person" size={18} color="#fff" />
            </View>
            <View style={ms.info}>
                <Text style={ms.name}>{item.name}</Text>
                <Text style={ms.sub}>Checked in at {formatTime(item.checkedInAt)}</Text>
            </View>
            <View style={[ms.badge, { backgroundColor: '#DEF7EC' }]}>
                <Text style={[ms.badgeText, { color: '#059669' }]}>On Duty</Text>
            </View>
        </View>
    );

    const renderLateItem = ({ item }: { item: LateEmployee }) => (
        <View style={ms.row}>
            <View style={[ms.avatar, { backgroundColor: '#FBBF24' }]}>
                <Ionicons name="time" size={18} color="#fff" />
            </View>
            <View style={ms.info}>
                <Text style={ms.name}>{item.name}</Text>
                <Text style={ms.sub}>
                    Shift: {formatTime(item.shiftStart)} → Checked in: {formatTime(item.checkedInAt)}
                </Text>
            </View>
            <View style={[ms.badge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[ms.badgeText, { color: '#D97706' }]}>{formatLate(item.lateByMinutes)}</Text>
            </View>
        </View>
    );

    const renderAbsentItem = ({ item }: { item: AbsentEmployee }) => (
        <View style={ms.row}>
            <View style={[ms.avatar, { backgroundColor: '#F87171' }]}>
                <Ionicons name="close" size={18} color="#fff" />
            </View>
            <View style={ms.info}>
                <Text style={ms.name}>{item.name}</Text>
                <Text style={ms.sub}>
                    Scheduled: {formatTime(item.shiftStart)} – {formatTime(item.shiftEnd)}
                </Text>
            </View>
            <View style={[ms.badge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[ms.badgeText, { color: '#DC2626' }]}>Absent</Text>
            </View>
        </View>
    );

    const renderFatigueItem = ({ item }: { item: FatigueAlert }) => (
        <View style={ms.row}>
            <View style={[ms.avatar, { backgroundColor: '#EF4444' }]}>
                <MaterialIcons name="warning" size={18} color="#fff" />
            </View>
            <View style={ms.info}>
                <Text style={ms.name}>{item.name}</Text>
                <Text style={[ms.sub, { color: '#DC2626' }]}>
                    Working for {item.hoursWorked}h+ without checkout
                </Text>
            </View>
            <View style={[ms.badge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[ms.badgeText, { color: '#DC2626' }]}>{item.hoursWorked}h</Text>
            </View>
        </View>
    );

    const getModalConfig = () => {
        if (!stats) return { title: '', data: [] as any[], renderItem: renderOnDutyItem, emptyText: '' };
        switch (modalType) {
            case 'onDuty':
                return {
                    title: `Employees on Duty (${stats.onDutyCount})`,
                    data: stats.onDuty,
                    renderItem: renderOnDutyItem,
                    emptyText: 'No employees have checked in yet today.',
                };
            case 'late':
                return {
                    title: `Late Check-ins (${stats.lateCount})`,
                    data: stats.lateCheckIns,
                    renderItem: renderLateItem,
                    emptyText: 'No late check-ins today. 🎉',
                };
            case 'absentees':
                return {
                    title: `Absentees (${stats.absenteeCount})`,
                    data: stats.absentees,
                    renderItem: renderAbsentItem,
                    emptyText: 'No absentees today. All employees accounted for!',
                };
            case 'fatigue':
                return {
                    title: `Fatigue Alerts (${stats.fatigueAlertCount})`,
                    data: stats.fatigueAlerts,
                    renderItem: renderFatigueItem,
                    emptyText: 'No fatigue alerts. All employees have normal hours.',
                };
            default:
                return { title: '', data: [] as any[], renderItem: renderOnDutyItem, emptyText: '' };
        }
    };

    const modalConfig = getModalConfig();

    // ─── Main Render ──────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="menu" size={28} color="#1a1a1a" />
                    <Text style={styles.companyName}>  {user?.hotelName || 'Company name'}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.notificationBtn} onPress={() => {
                        if (fatigueCount > 0) {
                            setBellModalVisible(true);
                        }
                    }}>
                        <Ionicons name="notifications" size={24} color={fatigueCount > 0 ? '#EF4444' : '#1a1a1a'} />
                        {fatigueCount > 0 ? (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>{fatigueCount}</Text>
                            </View>
                        ) : (
                            <View style={styles.notificationDot} />
                        )}
                    </TouchableOpacity>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={20} color="#fff" />
                    </View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976D2']} />}
            >
                {/* Greeting */}
                <View style={styles.greetingSection}>
                    <Text style={styles.managerTitle}>Manager</Text>
                    <Text style={styles.greetingSubtitle}>Have a nice day</Text>
                </View>

                {/* Check In Button */}
                <TouchableOpacity style={styles.checkInButton} onPress={() => router.push('/(manager)/rosterCreation/checkin' as any)}>
                    <Text style={styles.checkInText}>Check in</Text>
                </TouchableOpacity>

                {/* Today's Shifts */}
                <Text style={styles.sectionTitle}>Today's Shifts</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#1976D2" style={{ marginVertical: 20 }} />
                ) : (
                    <View style={styles.statsGrid}>
                        <TouchableOpacity style={[styles.statCard, { backgroundColor: '#DEF7EC' }]} onPress={() => openModal('onDuty')}>
                            <Text style={styles.statLabel}>Employees on Duty</Text>
                            <Text style={styles.statValue}>{stats?.onDutyCount ?? 0}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#059669" style={styles.statArrow} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.statCard, { backgroundColor: '#FEF3C7' }]} onPress={() => openModal('late')}>
                            <Text style={styles.statLabel}>Late Check-ins</Text>
                            <Text style={styles.statValue}>{stats?.lateCount ?? 0}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#D97706" style={styles.statArrow} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.statCard, { backgroundColor: '#FEE2E2' }]} onPress={() => openModal('absentees')}>
                            <Text style={styles.statLabel}>Absentees</Text>
                            <Text style={styles.statValue}>{stats?.absenteeCount ?? 0}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#DC2626" style={styles.statArrow} />
                        </TouchableOpacity>
                        <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
                            <Text style={styles.statLabel}>Total Scheduled</Text>
                            <Text style={styles.statValue}>{stats?.totalScheduled ?? 0}</Text>
                        </View>
                    </View>
                )}

                {/* Critical Alerts */}
                <Text style={styles.sectionTitle}>Critical Alerts</Text>
                {(stats?.lateCount ?? 0) > 0 ? (
                    <TouchableOpacity style={styles.alertCard} onPress={() => openModal('late')}>
                        <View style={[styles.alertIcon, { backgroundColor: '#FDECE8' }]}>
                            <MaterialIcons name="schedule" size={22} color="#E53935" />
                        </View>
                        <View style={styles.alertContent}>
                            <Text style={styles.alertTitle}>{stats?.lateCount} employee{(stats?.lateCount ?? 0) > 1 ? 's' : ''} checked in late</Text>
                            <Text style={styles.alertTime}>Today</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
                    </TouchableOpacity>
                ) : null}

                {(stats?.absenteeCount ?? 0) > 0 ? (
                    <TouchableOpacity style={styles.alertCard} onPress={() => openModal('absentees')}>
                        <View style={[styles.alertIcon, { backgroundColor: '#FEE2E2' }]}>
                            <Ionicons name="alert-circle" size={22} color="#DC2626" />
                        </View>
                        <View style={styles.alertContent}>
                            <Text style={styles.alertTitle}>{stats?.absenteeCount} employee{(stats?.absenteeCount ?? 0) > 1 ? 's' : ''} absent</Text>
                            <Text style={styles.alertTime}>Today</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
                    </TouchableOpacity>
                ) : null}

                {/* Fatigue Alerts */}
                {(stats?.fatigueAlerts ?? []).map((alert, index) => (
                    <TouchableOpacity
                        key={`fatigue-${alert.id}-${index}`}
                        style={[styles.alertCard, { backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: '#EF4444' }]}
                        onPress={() => openModal('fatigue')}
                    >
                        <View style={[styles.alertIcon, { backgroundColor: '#FEE2E2' }]}>
                            <MaterialIcons name="warning" size={22} color="#EF4444" />
                        </View>
                        <View style={styles.alertContent}>
                            <Text style={[styles.alertTitle, { color: '#B91C1C' }]}>{alert.message}</Text>
                            <Text style={styles.alertTime}>Working for {alert.hoursWorked}h+</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                    </TouchableOpacity>
                ))}

                {(stats?.lateCount ?? 0) === 0 && (stats?.absenteeCount ?? 0) === 0 && fatigueCount === 0 && !loading && (
                    <View style={[styles.alertCard, { backgroundColor: '#DEF7EC' }]}>
                        <View style={[styles.alertIcon, { backgroundColor: '#A7F3D0' }]}>
                            <Ionicons name="checkmark-circle" size={22} color="#059669" />
                        </View>
                        <View style={styles.alertContent}>
                            <Text style={styles.alertTitle}>All clear — no alerts today!</Text>
                        </View>
                    </View>
                )}

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(manager)/chat/' as any)}>
                        <View style={styles.actionIconBox}>
                            <MaterialCommunityIcons name="swap-horizontal" size={24} color="#1565C0" />
                        </View>
                        <Text style={styles.actionLabel}>Approve{'\n'}Swaps</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(manager)/leaveManagment' as any)}>
                        <View style={styles.actionIconBox}>
                            <MaterialIcons name="event-note" size={24} color="#1565C0" />
                        </View>
                        <Text style={styles.actionLabel}>Manage{'\n'}Leaves</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={styles.actionIconBox}>
                            <MaterialIcons name="insert-chart-outlined" size={24} color="#1565C0" />
                        </View>
                        <Text style={styles.actionLabel}>View{'\n'}Analytics</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* ─── Detail Modal ──────────────────────────────────────────────── */}
            <Modal visible={modalType !== null} animationType="slide" transparent>
                <View style={ms.overlay}>
                    <View style={ms.sheet}>
                        {/* Modal Header */}
                        <View style={ms.header}>
                            <Text style={ms.title}>{modalConfig.title}</Text>
                            <TouchableOpacity onPress={() => setModalType(null)} style={ms.closeBtn}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Modal List */}
                        <FlatList
                            data={modalConfig.data}
                            keyExtractor={(item: any) => item.id}
                            renderItem={modalConfig.renderItem as any}
                            contentContainerStyle={{ paddingBottom: 30 }}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Text style={ms.emptyText}>{modalConfig.emptyText}</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>

            {/* ─── Bell Notification Modal (Fatigue Alerts) ───────────────── */}
            <Modal visible={bellModalVisible} animationType="slide" transparent>
                <View style={ms.overlay}>
                    <View style={ms.sheet}>
                        <View style={ms.header}>
                            <Text style={ms.title}>
                                🔔 Fatigue Alerts ({fatigueCount})
                            </Text>
                            <TouchableOpacity onPress={() => setBellModalVisible(false)} style={ms.closeBtn}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={stats?.fatigueAlerts ?? []}
                            keyExtractor={(item: FatigueAlert, index: number) => `bell-fatigue-${item.id}-${index}`}
                            renderItem={renderFatigueItem}
                            contentContainerStyle={{ paddingBottom: 30 }}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Text style={ms.emptyText}>No fatigue alerts right now.</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 15,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    companyName: { fontSize: 13, color: '#333', marginLeft: 4, fontWeight: '500' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    notificationBtn: { position: 'relative' },
    notificationDot: {
        position: 'absolute', top: 2, right: 3, width: 8, height: 8,
        backgroundColor: '#333', borderRadius: 4, borderWidth: 1.5, borderColor: '#FAFAFA'
    },
    notificationBadge: {
        position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18,
        backgroundColor: '#EF4444', borderRadius: 9, justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#FAFAFA',
    } as any,
    notificationBadgeText: {
        color: '#fff', fontSize: 10, fontWeight: '700',
    } as any,
    avatar: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#90CAF9', justifyContent: 'center', alignItems: 'center',
    },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    greetingSection: { marginBottom: 15 },
    managerTitle: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', letterSpacing: -0.5 },
    greetingSubtitle: { fontSize: 13, color: '#666', marginTop: 2, fontWeight: '500' },
    checkInButton: {
        backgroundColor: '#1976D2', borderRadius: 12, paddingVertical: 16,
        alignItems: 'center', marginBottom: 25,
        shadowColor: '#1976D2', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    checkInText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 15 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 25 },
    statCard: {
        flex: 1, minWidth: '45%', backgroundColor: '#EEF2FF',
        borderRadius: 16, padding: 16, position: 'relative',
    },
    statLabel: { fontSize: 12, color: '#555', fontWeight: '500', marginBottom: 10 },
    statValue: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
    statArrow: { position: 'absolute', top: 16, right: 14 },
    alertCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF',
        borderRadius: 16, padding: 12, marginBottom: 12,
    },
    alertIcon: {
        width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    alertContent: { flex: 1 },
    alertTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
    alertTime: { fontSize: 12, color: '#888' },
    quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 20 },
    actionItem: { alignItems: 'center', width: '22%' },
    actionIconBox: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#E3F2FD',
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    actionLabel: { fontSize: 11, color: '#333', textAlign: 'center', fontWeight: '500', lineHeight: 14 },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        maxHeight: '75%',
        paddingHorizontal: 20, paddingTop: 20,
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16,
    },
    title: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
    closeBtn: { padding: 4 },
    row: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F8FAFC', borderRadius: 14,
        padding: 14, marginBottom: 10,
    },
    avatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    info: { flex: 1 },
    name: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
    sub: { fontSize: 12, color: '#666' },
    badge: {
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    badgeText: { fontSize: 11, fontWeight: '700' },
    emptyText: {
        textAlign: 'center', fontSize: 14, color: '#999',
        marginTop: 40, marginBottom: 20,
    },
});
