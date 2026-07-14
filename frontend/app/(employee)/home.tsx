import { palette } from '@/src/constants/palette';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { announcementAPI, notificationAPI, shiftAPI, swapAPI } from '@/src/services/api';
import { getLeaveSummary } from '@/src/services/leaveApi';
import { getAttendanceStatus, postCheckOut } from '@/src/services/attendanceService';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AttendanceStatusCard from '@/src/components/AttendanceStatusCard';


interface Shift {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    shiftRole?: string;
    actualCheckIn?: string;
    actualCheckOut?: string;
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

export default function EmployeeHomeScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const C = {
        bg: theme.background,
        card: theme.surface,
        text: theme.text,
        textSecondary: theme.textSecondary,
        textMuted: theme.textMuted,
        primary: theme.primary,
        primarySoft: isDark ? '#1E2D4A' : '#EFF6FF',
        border: theme.border,
        divider: theme.borderLight,
        success: theme.success,
        successText: theme.success,
        successSoft: theme.successBg,
        warning: theme.warning,
        warningSoft: theme.warningBg,
        danger: theme.danger,
    };

    const styles = makeStyles(C);

    const [todayShift, setTodayShift] = useState<Shift | null>(null);
    const [attendanceStatus, setAttendanceStatus] = useState<'open' | 'completed' | 'none'>('none');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [pendingSwaps, setPendingSwaps] = useState(0);
    const [leaveBalance, setLeaveBalance] = useState(0);
    const [weekShifts, setWeekShifts] = useState<Shift[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        // Each call is wrapped individually so a 404 from a missing backend
        // route doesn't prevent the rest of the dashboard from loading.
        const safeFetch = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
            try { return await fn(); } catch { return null; }
        };

        const [shiftRes, announcementsRes, swapsRes, leaveRes, weekRes, attendanceRes, unreadRes] = await Promise.all([
            safeFetch(() => shiftAPI.getTodayShift()),
            safeFetch(() => announcementAPI.getAnnouncements()),
            safeFetch(() => swapAPI.getPendingPeerRequests()),
            safeFetch(() => getLeaveSummary(user?.id || '')),
            safeFetch(() => shiftAPI.getMyShifts({
                startDate: getWeekStart().toISOString(),
                endDate: getWeekEnd().toISOString(),
            })),
            safeFetch(() => getAttendanceStatus()),
            safeFetch(() => notificationAPI.getUnreadCount()),
        ]);

        if (shiftRes) {
            setTodayShift(shiftRes.data.shift);
        }
        if (announcementsRes) setAnnouncements(announcementsRes.data.announcements.slice(0, 3));
        if (swapsRes) {
            const swapData = swapsRes.data;
            setPendingSwaps(Array.isArray(swapData) ? swapData.length : (swapData?.swapRequests?.length ?? 0));
        }
        if (leaveRes) setLeaveBalance((leaveRes as any).totalRemaining ?? 0);
        if (weekRes) setWeekShifts(Array.isArray(weekRes.data) ? weekRes.data : weekRes.data.shifts || []);
        if (attendanceRes) setAttendanceStatus(attendanceRes.status);
        if (unreadRes) setUnreadCount(unreadRes.data.count ?? 0);
    };

    const getWeekStart = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(now.setDate(diff));
    };

    const getWeekEnd = () => {
        const start = getWeekStart();
        return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

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
                            loadData(); // Refresh UI
                        } catch (e: any) {
                            Alert.alert("Error", e?.message || "Failed to check out.");
                        }
                    }
                }
            ]
        );
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getDayOfWeek = (index: number) => {
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        return days[index];
    };

    const getWeekDates = () => {
        const start = getWeekStart();
        const dates: number[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
            dates.push(d.getDate());
        }
        return dates;
    };

    const hasShiftOnDay = (dayIndex: number) => {
        const start = getWeekStart();
        const targetDate = new Date(start.getTime() + dayIndex * 24 * 60 * 60 * 1000);
        return weekShifts.some(shift => {
            const shiftDate = new Date(shift.date);
            return shiftDate.toDateString() === targetDate.toDateString();
        });
    };

    const isToday = (dayIndex: number) => {
        const start = getWeekStart();
        const targetDate = new Date(start.getTime() + dayIndex * 24 * 60 * 60 * 1000);
        const today = new Date();
        return targetDate.toDateString() === today.toDateString();
    };

    const weekDates = getWeekDates();

    // ─── Presentation helpers (display only — no data changes) ───────────────
    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const firstName = user?.firstName || (user?.name ? user.name.split(' ')[0] : 'there');

    const formatDepartment = (dept?: string) => {
        if (!dept) return 'Team Member';
        const map: Record<string, string> = {
            INDIAN: 'Indian Cuisine',
            CHINESE: 'Chinese Cuisine',
        };
        const label = map[dept] || dept.charAt(0).toUpperCase() + dept.slice(1).toLowerCase();
        return `${label} Department`;
    };

    const todayLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ─── Header ─────────────────────────────────────────────── */}
                <View style={styles.headerTop}>
                    <Text style={styles.eyebrow} numberOfLines={1}>
                        {user?.hotelName || 'Company name'}
                    </Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            activeOpacity={0.7}
                            onPress={() => router.push('/(employee)/notifications' as any)}
                        >
                            <Ionicons name="notifications-outline" size={22} color={C.textSecondary} />
                            {unreadCount > 0 && (
                                <View style={styles.bellBadge}>
                                    <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/(employee)/profile' as any)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={20} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.greetingSection}>
                    <Text style={styles.greeting}>
                        {getGreeting()}, {firstName}
                    </Text>
                    <Text style={styles.subGreeting}>{formatDepartment(user?.department)}</Text>
                </View>

                {/* ─── Attendance (QR check-in) ─────────────────────────────── */}
                <AttendanceStatusCard
                    status={attendanceStatus}
                    checkedInAt={todayShift?.actualCheckIn}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                    style={{ marginBottom: 16 }}
                />

                {/* ─── Today's Shift (boarding-pass style) ─────────────────── */}
                <View style={[styles.card, styles.shiftCard]}>
                    <View style={styles.shiftHeader}>
                        <Text style={styles.cardTitle}>Today&apos;s Shift</Text>
                        <View style={styles.datePill}>
                            <Text style={styles.datePillText}>{todayLabel}</Text>
                        </View>
                    </View>

                    {todayShift ? (
                        <View style={styles.ticketRow}>
                            <View style={styles.ticketSegment}>
                                <Ionicons name="time-outline" size={20} color={C.primary} />
                                <Text style={styles.ticketLabel}>TIME</Text>
                                <Text style={styles.ticketValue}>
                                    {formatTime(todayShift.startTime)}
                                </Text>
                                <Text style={styles.ticketValueSub}>
                                    {formatTime(todayShift.endTime)}
                                </Text>
                            </View>

                            <View style={styles.ticketDivider} />

                            <View style={styles.ticketSegment}>
                                <MaterialCommunityIcons name="map-marker-outline" size={20} color={C.primary} />
                                <Text style={styles.ticketLabel}>LOCATION</Text>
                                <Text style={styles.ticketValue} numberOfLines={2}>
                                    {todayShift.location || '—'}
                                </Text>
                            </View>

                            <View style={styles.ticketDivider} />

                            <View style={styles.ticketSegment}>
                                <FontAwesome5 name="concierge-bell" size={17} color={C.primary} />
                                <Text style={styles.ticketLabel}>ROLE</Text>
                                <Text style={styles.ticketValue} numberOfLines={2}>
                                    {todayShift.shiftRole || '—'}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyShift}>
                            <Ionicons name="cafe-outline" size={26} color={C.textMuted} />
                            <Text style={styles.emptyShiftText}>No shift scheduled today</Text>
                        </View>
                    )}
                </View>

                {/* ─── This Week's Shift ───────────────────────────────────── */}
                <View style={[styles.card, styles.weekCard]}>
                    <View style={styles.weekHeader}>
                        <Text style={styles.cardTitle}>This Week&apos;s Shift</Text>
                        <TouchableOpacity
                            style={styles.fullScheduleBtn}
                            onPress={() => router.push('/schedule')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.fullScheduleLink}>Full Schedule</Text>
                            <Ionicons name="chevron-forward" size={14} color={C.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekRow}>
                        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                            <View key={`label-${index}`} style={styles.dayColumn}>
                                <Text style={[
                                    styles.dayLabel,
                                    isToday(index) && { color: C.primary, fontWeight: '700' },
                                ]}>
                                    {getDayOfWeek(index)}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.weekRow}>
                        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                            <View key={`date-${index}`} style={styles.dayColumn}>
                                <View style={[
                                    styles.dayNumberCircle,
                                    isToday(index) && { backgroundColor: C.primary },
                                ]}>
                                    <Text style={[
                                        styles.dayNumber,
                                        isToday(index) && styles.dayNumberToday,
                                    ]}>
                                        {weekDates[index]}
                                    </Text>
                                </View>
                                {hasShiftOnDay(index) && (
                                    <View style={[
                                        styles.shiftDot,
                                        isToday(index) && { backgroundColor: C.warning },
                                    ]} />
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* ─── Stats Grid: Leaves + Swaps ──────────────────────────── */}
                <View style={styles.gridRow}>
                    <TouchableOpacity
                        style={[styles.card, styles.gridCard, { backgroundColor: C.successSoft }]}
                        onPress={() => router.push('/(employee)/leave/apply' as any)}
                        activeOpacity={0.85}
                    >
                        <View style={[styles.gridIcon, { backgroundColor: '#FFFFFF' }]}>
                            <Ionicons name="calendar-clear-outline" size={20} color={C.successText} />
                        </View>
                        <View>
                            <Text style={[styles.gridNumber, { color: C.successText }]}>{leaveBalance}</Text>
                            <Text style={[styles.gridLabel, { color: C.successText }]}>Leaves Remaining</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.card, styles.gridCard, { backgroundColor: C.warningSoft }]}
                        onPress={() => router.push('/(employee)/swap/pending-requests' as any)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.gridTopRow}>
                            <View style={[styles.gridIcon, { backgroundColor: '#FFFFFF' }]}>
                                <Ionicons name="swap-horizontal" size={20} color={C.warning} />
                            </View>
                            {(pendingSwaps > 0) && <View style={styles.gridBadge} />}
                        </View>
                        <View>
                            <Text style={[styles.gridNumber, { color: C.warning }]}>{pendingSwaps}</Text>
                            <Text style={[styles.gridLabel, { color: C.warning }]}>Pending Swaps</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 24 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const makeStyles = (C: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 12,
        backgroundColor: C.bg,
    },

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
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        marginBottom: 18,
    },
    eyebrow: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: C.textMuted,
        letterSpacing: 0.3,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: C.card,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    bellBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        paddingHorizontal: 3,
        backgroundColor: C.danger,
        borderWidth: 1.5,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bellBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '700',
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: C.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* ---- Greeting ---- */
    greetingSection: {
        marginBottom: 18,
    },
    greeting: {
        fontSize: 26,
        fontWeight: '800',
        color: C.text,
        letterSpacing: -0.4,
    },
    subGreeting: {
        fontSize: 14,
        color: C.textMuted,
        marginTop: 4,
        fontWeight: '500',
    },

    /* ---- Hero status card ---- */
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        marginBottom: 16,
    },
    statusInfo: {
        flex: 1,
        paddingRight: 12,
    },
    statusEyebrow: {
        fontSize: 11,
        fontWeight: '700',
        color: C.textMuted,
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: C.text,
        letterSpacing: -0.3,
    },
    statusMeta: {
        fontSize: 13,
        color: C.textMuted,
        marginTop: 4,
        fontWeight: '500',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 7,
        backgroundColor: C.successSoft,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    statusPillNeutral: {
        backgroundColor: C.bg,
    },
    statusDotGreen: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: C.success,
    },
    statusPillText: {
        fontSize: 14,
        fontWeight: '700',
        color: C.successText,
    },
    checkInTouchArea: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: C.primary,
    },
    checkInCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: C.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: C.primary,
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    checkInCircleDone: {
        backgroundColor: C.successSoft,
        shadowOpacity: 0,
        elevation: 0,
    },
    checkOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    checkOutBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: C.danger,
    },

    /* ---- Today's Shift (ticket) ---- */
    shiftCard: {
        padding: 18,
        marginBottom: 16,
    },
    shiftHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: C.text,
        letterSpacing: -0.2,
    },
    datePill: {
        backgroundColor: C.primarySoft,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    datePillText: {
        fontSize: 12,
        fontWeight: '600',
        color: C.primary,
    },
    ticketRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    ticketSegment: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 4,
    },
    ticketDivider: {
        width: 1,
        alignSelf: 'stretch',
        backgroundColor: C.divider,
        marginHorizontal: 4,
    },
    ticketLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: C.textMuted,
        letterSpacing: 0.8,
        marginTop: 2,
    },
    ticketValue: {
        fontSize: 15,
        fontWeight: '700',
        color: C.text,
        textAlign: 'center',
    },
    ticketValueSub: {
        fontSize: 12,
        fontWeight: '500',
        color: C.textMuted,
        textAlign: 'center',
    },
    emptyShift: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 8,
    },
    emptyShiftText: {
        fontSize: 14,
        color: C.textMuted,
        fontWeight: '500',
    },

    /* ---- This Week's Shift ---- */
    weekCard: {
        padding: 18,
        marginBottom: 16,
    },
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    fullScheduleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    fullScheduleLink: {
        fontSize: 13,
        fontWeight: '600',
        color: C.primary,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    dayColumn: {
        alignItems: 'center',
        flex: 1,
    },
    dayLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: C.textMuted,
        marginBottom: 10,
    },
    dayNumberCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: C.textSecondary,
    },
    dayNumberToday: {
        color: '#fff',
        fontWeight: '800',
    },
    shiftDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: C.primary,
        marginTop: 6,
    },

    /* ---- Stats grid ---- */
    gridRow: {
        flexDirection: 'row',
        gap: 14,
    },
    gridCard: {
        flex: 1,
        padding: 18,
        minHeight: 160,
        justifyContent: 'space-between',
        shadowOpacity: 0.03,
    },
    gridTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    gridIcon: {
        width: 38,
        height: 38,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridBadge: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: C.warning,
        borderWidth: 2,
        borderColor: '#fff',
        marginTop: 4,
    },
    gridNumber: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
    },
    gridLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
        opacity: 0.85,
    },
});
