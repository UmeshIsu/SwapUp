import React, { useState, useCallback } from 'react';
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
    Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { shiftAPI } from '@/src/services/api';
import { getAttendanceStatus, postCheckOut } from '@/src/services/attendanceService';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';
import AttendanceStatusCard from '@/src/components/AttendanceStatusCard';

// ─── Premium light palette ──────────────────────────────────────────────────
const C = {
    bg: '#F8F9FA',
    card: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    primary: '#2563EB',
    primarySoft: '#EFF6FF',
    border: '#EEF1F5',
    success: '#16A34A',
    successSoft: '#ECFDF5',
    warning: '#EA580C',
    warningSoft: '#FFF7ED',
    danger: '#DC2626',
    dangerSoft: '#FEF2F2',
    alertTint: '#FFF5F5',
    alertAccent: '#EF4444',
};

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
    const [attendanceStatus, setAttendanceStatus] = useState<'open' | 'completed' | 'none'>('none');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Modal state
    const [modalType, setModalType] = useState<'onDuty' | 'late' | 'absentees' | 'fatigue' | null>(null);
    const [bellModalVisible, setBellModalVisible] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const response = await shiftAPI.getManagerDashboardStats();
            setStats(response.data);

            try {
                const attRes = await getAttendanceStatus();
                if (attRes) setAttendanceStatus(attRes.status);
            } catch (e) {
                // Ignore
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [fetchStats])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const openModal = (type: 'onDuty' | 'late' | 'absentees' | 'fatigue') => {
        setModalType(type);
    };

    const fatigueCount = stats?.fatigueAlertCount ?? 0;

    const handleCheckIn = () => {
        router.push('/check-in-qr' as any);
    };

    const handleCheckOut = () => {
        Alert.alert(
            "Check Out",
            "Are you sure you want to check out?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Check Out", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await postCheckOut();
                            Alert.alert("Success", "Checked out successfully!");
                            fetchStats(); // Refresh UI
                        } catch (e: any) {
                            Alert.alert("Error", e?.message || "Failed to check out.");
                        }
                    }
                }
            ]
        );
    };

    // ─── Modal Content Renderers ──────────────────────────────────────────

    const renderOnDutyItem = ({ item }: { item: OnDutyEmployee }) => (
        <View style={[ms.row, { backgroundColor: theme.surface }]}>
            <View style={ms.avatar}>
                <Ionicons name="person" size={18} color="#fff" />
            </View>
            <View style={ms.info}>
                <Text style={[ms.name, { color: theme.text }]}>{item.name}</Text>
                <Text style={[ms.sub, { color: theme.textSecondary }]}>Checked in at {formatTime(item.checkedInAt)}</Text>
            </View>
            <View style={[ms.badge, { backgroundColor: '#DEF7EC' }]}>
                <Text style={[ms.badgeText, { color: '#059669' }]}>On Duty</Text>
            </View>
        </View>
    );

    const renderLateItem = ({ item }: { item: LateEmployee }) => (
        <View style={[ms.row, { backgroundColor: theme.surface }]}>
            <View style={[ms.avatar, { backgroundColor: '#FBBF24' }]}>
                <Ionicons name="time" size={18} color="#fff" />
            </View>
            <View style={ms.info}>
                <Text style={[ms.name, { color: theme.text }]}>{item.name}</Text>
                <Text style={[ms.sub, { color: theme.textSecondary }]}>
                    Shift: {formatTime(item.shiftStart)} → Checked in: {formatTime(item.checkedInAt)}
                </Text>
            </View>
            <View style={[ms.badge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[ms.badgeText, { color: '#D97706' }]}>{formatLate(item.lateByMinutes)}</Text>
            </View>
        </View>
    );

    const renderAbsentItem = ({ item }: { item: AbsentEmployee }) => (
        <View style={[ms.row, { backgroundColor: theme.surface }]}>
            <View style={[ms.avatar, { backgroundColor: '#F87171' }]}>
                <Ionicons name="close" size={18} color="#fff" />
            </View>
            <View style={ms.info}>
                <Text style={[ms.name, { color: theme.text }]}>{item.name}</Text>
                <Text style={[ms.sub, { color: theme.textSecondary }]}>
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

    // ─── Presentation helpers (display only — no data changes) ─────────────
    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };
    const firstName = user?.firstName || (user?.name ? user.name.split(' ')[0] : 'Manager');

    // ─── Main Render ──────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.eyebrow} numberOfLines={1}>{user?.hotelName || 'Company name'}</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.notificationBtn} onPress={() => {
                        if (fatigueCount > 0) {
                            setBellModalVisible(true);
                        }
                    }}>
                        <Ionicons name="notifications-outline" size={22} color={fatigueCount > 0 ? C.danger : C.textSecondary} />
                        {fatigueCount > 0 ? (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>{fatigueCount}</Text>
                            </View>
                        ) : (
                            <View style={styles.notificationDot} />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/(manager)/profile' as any)}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />}
            >
                {/* Greeting */}
                <View style={styles.greetingSection}>
                    <Text style={styles.greeting}>{getGreeting()}, {firstName}</Text>
                    <Text style={styles.greetingSubtitle}>Here is your daily overview.</Text>
                </View>

                {/* Attendance (QR check-in) */}
                <AttendanceStatusCard
                    status={attendanceStatus}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                    style={{ marginBottom: 24 }}
                />

                {/* Today's Shifts */}
                <Text style={styles.sectionTitle}>Today&apos;s Shifts</Text>
                {loading ? (
                    <ActivityIndicator size="large" color={C.primary} style={{ marginVertical: 20 }} />
                ) : (
                    <View style={styles.statsGrid}>
                        <TouchableOpacity style={[styles.card, styles.statCard]} onPress={() => openModal('onDuty')} activeOpacity={0.85}>
                            <View style={[styles.statIcon, { backgroundColor: C.successSoft }]}>
                                <Ionicons name="people" size={20} color={C.success} />
                            </View>
                            <Text style={styles.statValue}>{stats?.onDutyCount ?? 0}</Text>
                            <Text style={styles.statLabel}>Employees on Duty</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.card, styles.statCard]} onPress={() => openModal('late')} activeOpacity={0.85}>
                            <View style={[styles.statIcon, { backgroundColor: C.warningSoft }]}>
                                <Ionicons name="time" size={20} color={C.warning} />
                            </View>
                            <Text style={styles.statValue}>{stats?.lateCount ?? 0}</Text>
                            <Text style={styles.statLabel}>Late Check-ins</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.card, styles.statCard]} onPress={() => openModal('absentees')} activeOpacity={0.85}>
                            <View style={[styles.statIcon, { backgroundColor: C.dangerSoft }]}>
                                <Ionicons name="person-remove" size={19} color={C.danger} />
                            </View>
                            <Text style={styles.statValue}>{stats?.absenteeCount ?? 0}</Text>
                            <Text style={styles.statLabel}>Absentees</Text>
                        </TouchableOpacity>
                        <View style={[styles.card, styles.statCard]}>
                            <View style={[styles.statIcon, { backgroundColor: C.primarySoft }]}>
                                <Ionicons name="calendar" size={19} color={C.primary} />
                            </View>
                            <Text style={styles.statValue}>{stats?.totalScheduled ?? 0}</Text>
                            <Text style={styles.statLabel}>Total Scheduled</Text>
                        </View>
                    </View>
                )}

                {/* Critical Alerts */}
                <Text style={styles.sectionTitle}>Critical Alerts</Text>
                {(stats?.lateCount ?? 0) > 0 ? (
                    <TouchableOpacity style={styles.alertCard} onPress={() => openModal('late')} activeOpacity={0.85}>
                        <View style={[styles.alertIcon, { backgroundColor: '#FEE2E2' }]}>
                            <MaterialIcons name="schedule" size={20} color={C.alertAccent} />
                        </View>
                        <View style={styles.alertContent}>
                            <Text style={styles.alertTitle}>{stats?.lateCount} employee{(stats?.lateCount ?? 0) > 1 ? 's' : ''} checked in late</Text>
                            <Text style={styles.alertTime}>Today</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={C.alertAccent} />
                    </TouchableOpacity>
                ) : null}

                {(stats?.absenteeCount ?? 0) > 0 ? (
                    <TouchableOpacity style={styles.alertCard} onPress={() => openModal('absentees')} activeOpacity={0.85}>
                        <View style={[styles.alertIcon, { backgroundColor: '#FEE2E2' }]}>
                            <Ionicons name="alert-circle" size={21} color={C.danger} />
                        </View>
                        <View style={styles.alertContent}>
                            <Text style={styles.alertTitle}>{stats?.absenteeCount} employee{(stats?.absenteeCount ?? 0) > 1 ? 's' : ''} absent</Text>
                            <Text style={styles.alertTime}>Today</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={C.alertAccent} />
                    </TouchableOpacity>
                ) : null}

                {/* Fatigue Alerts */}
                {(stats?.fatigueAlerts ?? []).map((alert, index) => (
                    <TouchableOpacity
                        key={`fatigue-${alert.id}-${index}`}
                        style={styles.alertCard}
                        onPress={() => openModal('fatigue')}
                        activeOpacity={0.85}
                    >
                        <View style={[styles.alertIcon, { backgroundColor: '#FEE2E2' }]}>
                            <MaterialIcons name="warning" size={20} color={C.alertAccent} />
                        </View>
                        <View style={styles.alertContent}>
                            <Text style={[styles.alertTitle, { color: '#B91C1C' }]}>{alert.message}</Text>
                            <Text style={styles.alertTime}>Working for {alert.hoursWorked}h+</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={C.alertAccent} />
                    </TouchableOpacity>
                ))}

                {(stats?.lateCount ?? 0) === 0 && (stats?.absenteeCount ?? 0) === 0 && fatigueCount === 0 && !loading && (
                    <View style={[styles.alertCard, styles.alertCardClear]}>
                        <View style={[styles.alertIcon, { backgroundColor: C.successSoft }]}>
                            <Ionicons name="checkmark-circle" size={21} color={C.success} />
                        </View>
                        <View style={styles.alertContent}>
                            <Text style={styles.alertTitle}>All clear — no alerts today!</Text>
                        </View>
                    </View>
                )}

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(manager)/chat/' as any)} activeOpacity={0.8}>
                        <View style={styles.actionIconBox}>
                            <MaterialCommunityIcons name="swap-horizontal" size={24} color={C.primary} />
                        </View>
                        <Text style={styles.actionLabel}>Approve{'\n'}Swaps</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(manager)/leaveManagment' as any)} activeOpacity={0.8}>
                        <View style={styles.actionIconBox}>
                            <MaterialIcons name="event-note" size={24} color={C.primary} />
                        </View>
                        <Text style={styles.actionLabel}>Manage{'\n'}Leaves</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem} activeOpacity={0.8}>
                        <View style={styles.actionIconBox}>
                            <MaterialIcons name="insert-chart-outlined" size={24} color={C.primary} />
                        </View>
                        <Text style={styles.actionLabel}>View{'\n'}Analytics</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* ─── Detail Modal ──────────────────────────────────────────────── */}
            <Modal visible={modalType !== null} animationType="slide" transparent>
                <View style={ms.overlay}>
                    <View style={[ms.sheet, { backgroundColor: theme.background }]}>
                        {/* Modal Header */}
                        <View style={ms.header}>
                            <Text style={[ms.title, { color: theme.text }]}>{modalConfig.title}</Text>
                            <TouchableOpacity onPress={() => setModalType(null)} style={ms.closeBtn}>
                                <Ionicons name="close" size={24} color={theme.textSecondary} />
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
                                <Text style={[ms.emptyText, { color: theme.textMuted }]}>{modalConfig.emptyText}</Text>
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
    container: { flex: 1, backgroundColor: C.bg },

    /* Reusable premium card */
    card: {
        backgroundColor: C.card,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    /* ---- Header ---- */
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 12,
        backgroundColor: C.bg,
    },
    eyebrow: { flex: 1, fontSize: 13, color: C.textMuted, fontWeight: '600', letterSpacing: 0.3 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    notificationBtn: {
        position: 'relative',
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    notificationDot: {
        position: 'absolute', top: 11, right: 12, width: 8, height: 8,
        backgroundColor: C.textMuted, borderRadius: 4, borderWidth: 1.5, borderColor: '#fff'
    },
    notificationBadge: {
        position: 'absolute', top: 4, right: 4, minWidth: 18, height: 18,
        backgroundColor: C.alertAccent, borderRadius: 9, justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#fff',
    } as any,
    notificationBadgeText: {
        color: '#fff', fontSize: 10, fontWeight: '700',
    } as any,
    avatar: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center',
    },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

    /* ---- Greeting ---- */
    greetingSection: { marginBottom: 18, marginTop: 4 },
    greeting: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.4 },
    greetingSubtitle: { fontSize: 14, color: C.textMuted, marginTop: 4, fontWeight: '500' },

    /* ---- Attendance status bar ---- */
    statusBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 14, paddingHorizontal: 18, marginBottom: 24,
    },
    statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    statusEyebrow: { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 0.8 },
    statusValue: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 2 },
    statusPill: {
        flexDirection: 'row', alignItems: 'center', gap: 7,
        paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24,
    },
    statusPillIn: { backgroundColor: C.primary },
    statusPillOut: { backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#FECACA' },
    statusPillText: { fontSize: 14, fontWeight: '700', color: '#fff' },

    /* ---- Section titles ---- */
    sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 14, letterSpacing: -0.2 },

    /* ---- Stats grid (2x2) ---- */
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    statCard: {
        flex: 1, minWidth: '46%',
        padding: 16,
    },
    statIcon: {
        width: 38, height: 38, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    },
    statValue: { fontSize: 30, fontWeight: '800', color: C.text, letterSpacing: -0.8 },
    statLabel: { fontSize: 12.5, color: C.textSecondary, fontWeight: '600', marginTop: 2 },

    /* ---- Critical alerts ---- */
    alertCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.alertTint,
        borderRadius: 16, padding: 14, marginBottom: 12,
        borderLeftWidth: 4, borderLeftColor: C.alertAccent,
    },
    alertCardClear: {
        backgroundColor: '#F0FDF4',
        borderLeftColor: C.success,
    },
    alertIcon: {
        width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    alertContent: { flex: 1 },
    alertTitle: { fontSize: 14.5, fontWeight: '700', color: C.text, marginBottom: 2 },
    alertTime: { fontSize: 12, color: C.textMuted, fontWeight: '500' },

    /* ---- Quick actions ---- */
    quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5, marginBottom: 20 },
    actionItem: { alignItems: 'center', width: '28%' },
    actionIconBox: {
        width: 58, height: 58, borderRadius: 29, backgroundColor: C.card,
        justifyContent: 'center', alignItems: 'center', marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    actionLabel: { fontSize: 12, color: C.textSecondary, textAlign: 'center', fontWeight: '500', lineHeight: 16 },
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
