import { useAuth } from '@/src/contexts/AuthContext';
import { announcementAPI, leaveAPI, shiftAPI, swapAPI } from '@/src/services/api';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Shift {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    shiftRole?: string;
    actualCheckIn?: string;
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
    const [todayShift, setTodayShift] = useState<Shift | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [pendingSwaps, setPendingSwaps] = useState(0);
    const [leaveBalance, setLeaveBalance] = useState(0);
    const [weekShifts, setWeekShifts] = useState<Shift[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Each call is wrapped individually so a 404 from a missing backend
        // route doesn't prevent the rest of the dashboard from loading.
        const safeFetch = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
            try { return await fn(); } catch { return null; }
        };

        const [shiftRes, announcementsRes, swapsRes, leaveRes, weekRes] = await Promise.all([
            safeFetch(() => shiftAPI.getTodayShift()),
            safeFetch(() => announcementAPI.getAnnouncements()),
            safeFetch(() => swapAPI.getPendingPeerRequests()),
            safeFetch(() => leaveAPI.getLeaveBalance()),
            safeFetch(() => shiftAPI.getMyShifts({
                startDate: getWeekStart().toISOString(),
                endDate: getWeekEnd().toISOString(),
            })),
        ]);

        if (shiftRes) setTodayShift(shiftRes.data.shift);
        if (announcementsRes) setAnnouncements(announcementsRes.data.announcements.slice(0, 3));
        if (swapsRes) setPendingSwaps(swapsRes.data.swapRequests?.length || 0);
        if (leaveRes) setLeaveBalance(leaveRes.data.leaveBalance?.total || 0);
        if (weekRes) setWeekShifts(Array.isArray(weekRes.data) ? weekRes.data : weekRes.data.shifts || []);
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

    const handleCheckIn = async () => {
        if (!todayShift) return;

        setIsCheckingIn(true);
        try {
            await shiftAPI.checkIn(todayShift.id);
            Alert.alert('Success', 'Checked in successfully!');
            loadData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to check in');
        } finally {
            setIsCheckingIn(false);
        }
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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Row: Hamburger + Company Name + Icons */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        {/* Hamburger menu - 3 lines stacked */}
                        <TouchableOpacity style={styles.menuButton}>
                            <View style={styles.hamburgerLine} />
                            <View style={[styles.hamburgerLine, { width: 14 }]} />
                        </TouchableOpacity>
                        <Text style={styles.companyName}>{user?.hotelName || 'Company name'}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        {/* Bell icon with yellow fill */}
                        <TouchableOpacity style={styles.bellContainer}>
                            <Ionicons name="notifications" size={24} color="#F5A623" />
                            <View style={styles.bellBadge} />
                        </TouchableOpacity>
                        {/* Avatar with blue background */}
                        <TouchableOpacity onPress={logout}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={22} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Greeting */}
                <View style={styles.greetingSection}>
                    <Text style={styles.greeting}>Hello, {user?.firstName || 'User'} !</Text>
                    <Text style={styles.subGreeting}>Have a nice day</Text>
                </View>

                {/* Check In Button */}
                <TouchableOpacity
                    style={[styles.checkInButton, todayShift?.actualCheckIn && styles.checkedIn]}
                    onPress={handleCheckIn}
                    disabled={!todayShift || !!todayShift.actualCheckIn || isCheckingIn}
                    activeOpacity={0.85}
                >
                    <Text style={styles.checkInText}>
                        {todayShift?.actualCheckIn ? 'Checked In ✓' : 'Check in'}
                    </Text>
                </TouchableOpacity>

                {/* Announcement */}
                <View style={styles.announcementCard}>
                    <View style={styles.announcementHeader}>
                        {/* Warning triangle icon */}
                        <View style={styles.warningIcon}>
                            <Text style={styles.warningIconText}>⚠</Text>
                        </View>
                        <Text style={styles.announcementLabel}>Announcement</Text>
                    </View>
                    <Text style={styles.announcementText}>
                        {announcements.length > 0
                            ? announcements[0].content
                            : 'Mandatory staff meeting will be held on tomorrow'}
                    </Text>
                </View>

                {/* Today's Shift */}
                <View style={styles.todayShiftCard}>
                    <Text style={styles.sectionTitle}>Today' Shift</Text>
                    <View style={styles.shiftInfoRow}>
                        <View style={styles.shiftInfoItem}>
                            <Ionicons name="time-outline" size={22} color="#1373D0" />
                            <Text style={styles.shiftInfoText}>
                                {todayShift
                                    ? `${formatTime(todayShift.startTime)}- ${formatTime(todayShift.endTime)}`
                                    : '9.00 AM- 5.00\nPM'}
                            </Text>
                        </View>
                        <View style={styles.shiftInfoItem}>
                            <MaterialCommunityIcons name="silverware-fork-knife" size={22} color="#555" />
                            <Text style={styles.shiftInfoText}>
                                {todayShift?.location || 'Main Dining\nHall'}
                            </Text>
                        </View>
                        <View style={styles.shiftInfoItem}>
                            <FontAwesome5 name="concierge-bell" size={18} color="#555" />
                            <Text style={styles.shiftInfoText}>
                                {todayShift?.shiftRole || 'Server'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* This Week's Shift */}
                <View style={styles.weekShiftCard}>
                    <View style={styles.weekHeader}>
                        <Text style={styles.sectionTitle}>This Week's Shift</Text>
                        <TouchableOpacity
                            style={styles.fullScheduleBtn}
                            onPress={() => router.push('/schedule')}
                        >
                            <Text style={styles.fullScheduleLink}>Full Schedule</Text>
                            <Ionicons name="chevron-forward" size={14} color="#1373D0" />
                        </TouchableOpacity>
                    </View>

                    {/* Day labels row */}
                    <View style={styles.weekRow}>
                        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                            <View key={`label-${index}`} style={styles.dayColumn}>
                                <Text style={[
                                    styles.dayLabel,
                                    isToday(index) && styles.dayLabelToday,
                                ]}>
                                    {getDayOfWeek(index)}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Day numbers row */}
                    <View style={styles.weekRow}>
                        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                            <View key={`date-${index}`} style={styles.dayColumn}>
                                <View style={[
                                    styles.dayNumberCircle,
                                    isToday(index) && styles.dayNumberCircleToday,
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
                                        isToday(index) && styles.shiftDotRed,
                                    ]} />
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Leaves Remaining */}
                <View style={styles.leavesCard}>
                    <View style={styles.leavesIconWrapper}>
                        <Ionicons name="time" size={28} color="#1373D0" />
                    </View>
                    <Text style={styles.leavesCount}>{leaveBalance || 14}</Text>
                    <Text style={styles.leavesLabel}>Leaves Remaining</Text>
                </View>

                {/* Pending Swaps */}
                <TouchableOpacity
                    style={styles.swapCard}
                    onPress={() => router.push('/swap')}
                    activeOpacity={0.7}
                >
                    <View style={styles.swapLeft}>
                        <View style={styles.swapIconContainer}>
                            <Ionicons name="swap-horizontal" size={22} color="#1373D0" />
                        </View>
                        <View style={styles.swapTextContainer}>
                            <Text style={styles.swapTitle}>Pending Swaps</Text>
                            <Text style={styles.swapSubtitle}>
                                You have {pendingSwaps || 2} pending requests
                            </Text>
                        </View>
                    </View>
                    <View style={styles.swapRight}>
                        {(pendingSwaps > 0 || true) && <View style={styles.notificationBadge} />}
                        <Ionicons name="chevron-forward" size={18} color="#BBBBBB" />
                    </View>
                </TouchableOpacity>

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
    },

    /* ---- Header ---- */
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 6,
        backgroundColor: '#FFFFFF',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    menuButton: {
        padding: 4,
        gap: 4,
        justifyContent: 'center',
    },
    hamburgerLine: {
        width: 20,
        height: 2.5,
        backgroundColor: '#333',
        borderRadius: 2,
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bellContainer: {
        position: 'relative',
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bellBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4A90D9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* ---- Greeting ---- */
    greetingSection: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 18,
        backgroundColor: '#FFFFFF',
    },
    greeting: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: 0.2,
    },
    subGreeting: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 2,
    },

    /* ---- Check In Button ---- */
    checkInButton: {
        backgroundColor: '#1373D0',
        marginHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    checkedIn: {
        backgroundColor: '#10B981',
    },
    checkInText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    /* ---- Announcement ---- */
    announcementCard: {
        backgroundColor: '#FFFBEB',
        marginHorizontal: 20,
        padding: 14,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    announcementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    warningIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    warningIconText: {
        fontSize: 18,
        color: '#E67E22',
    },
    announcementLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#D97706',
    },
    announcementText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 20,
        paddingLeft: 2,
    },

    /* ---- Today's Shift ---- */
    todayShiftCard: {
        backgroundColor: '#EEF4FB',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 14,
    },
    shiftInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
    },
    shiftInfoItem: {
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    shiftInfoText: {
        fontSize: 11,
        color: '#444',
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 16,
    },

    /* ---- This Week's Shift ---- */
    weekShiftCard: {
        backgroundColor: '#EEF4FB',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
    },
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    fullScheduleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    fullScheduleLink: {
        fontSize: 12,
        color: '#1373D0',
        fontWeight: '600',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    dayColumn: {
        alignItems: 'center',
        flex: 1,
    },
    dayLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
        marginBottom: 6,
    },
    dayLabelToday: {
        color: '#1373D0',
        fontWeight: '700',
    },
    dayNumberCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNumberCircleToday: {
        backgroundColor: '#1373D0',
    },
    dayNumber: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '600',
    },
    dayNumberToday: {
        color: '#fff',
        fontWeight: '700',
    },
    shiftDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#1373D0',
        marginTop: 4,
    },
    shiftDotRed: {
        backgroundColor: '#EF4444',
    },

    /* ---- Leaves Remaining ---- */
    leavesCard: {
        backgroundColor: '#BFFFC6',
        marginHorizontal: 20,
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 12,
        marginBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    leavesIconWrapper: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#9BFAA4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    leavesCount: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
    },
    leavesLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },

    /* ---- Pending Swaps ---- */
    swapCard: {
        backgroundColor: '#F9F9F9',
        marginHorizontal: 20,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    swapLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    swapIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EEF4FB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    swapTextContainer: {
        flex: 1,
    },
    swapTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    swapSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    swapRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    notificationBadge: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#F97316',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
});