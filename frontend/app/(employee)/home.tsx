import { useAuth } from '@/src/contexts/AuthContext';
import { announcementAPI, leaveAPI, shiftAPI, swapAPI } from '@/src/services/api';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

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
    const [todayShift, setTodayShift] = useState<Shift | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [pendingSwaps, setPendingSwaps] = useState(0);
    const [leaveBalance, setLeaveBalance] = useState(0);
    const [weekShifts, setWeekShifts] = useState<Shift[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

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

        if (shiftRes) {
            setTodayShift(shiftRes.data.shift);
            if (shiftRes.data.shift?.actualCheckOut) {
                setIsCheckedOut(true);
            }
        }
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

    const handleCheckIn = () => {
        router.push('/(employee)/check-in' as any);
    };

    const handleCheckOut = async () => {
        if (!todayShift) return;

        setIsCheckingIn(true);
        try {
            await shiftAPI.checkOut(todayShift.id);
            Alert.alert('Success', 'Checked out successfully!');
            setIsCheckedOut(true);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to check out');
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}
            >
                {/* Header Row: Hamburger + Company Name + Icons */}
                <View style={[styles.headerRow, { backgroundColor: theme.background }]}>
                    <View style={styles.headerLeft}>
                        {/* Hamburger menu - 3 lines stacked */}
                        <TouchableOpacity style={styles.menuButton}>
                            <View style={[styles.hamburgerLine, { backgroundColor: theme.hamburger }]} />
                            <View style={[styles.hamburgerLine, { width: 14, backgroundColor: theme.hamburger }]} />
                        </TouchableOpacity>
                        <Text style={[styles.companyName, { color: theme.textSecondary }]}>{user?.hotelName || 'Company name'}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        {/* Bell icon with yellow fill */}
                        <TouchableOpacity style={styles.bellContainer}>
                            <Ionicons name="notifications" size={24} color={theme.warning} />
                            <View style={styles.bellBadge} />
                        </TouchableOpacity>
                        {/* Avatar with blue background */}
                        <TouchableOpacity onPress={() => router.push('/(employee)/profile' as any)}>
                            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                                <Ionicons name="person" size={22} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Greeting */}
                <View style={[styles.greetingSection, { backgroundColor: theme.background }]}>
                    <Text style={[styles.greeting, { color: theme.text }]}>Hello, {user?.name || 'User'} !</Text>
                    <Text style={[styles.subGreeting, { color: theme.textMuted }]}>Have a nice day</Text>
                </View>

                {/* Check In Button */}
                <TouchableOpacity
                    style={[styles.checkInButton, { backgroundColor: theme.primary }, todayShift?.actualCheckIn && { backgroundColor: theme.success }]}
                    onPress={handleCheckIn}
                    disabled={!!todayShift?.actualCheckIn}
                    activeOpacity={0.85}
                >
                    <Text style={styles.checkInText}>
                        {todayShift?.actualCheckIn ? 'Checked In ✓' : 'Check in'}
                    </Text>
                </TouchableOpacity>

                {/* Announcement Removed */}

                {/* Today's Shift */}
                <View style={[styles.todayShiftCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Today' Shift</Text>
                    <View style={styles.shiftInfoRow}>
                        <View style={styles.shiftInfoItem}>
                            <Ionicons name="time-outline" size={22} color={theme.primary} />
                            <Text style={[styles.shiftInfoText, { color: theme.textSecondary }]}>
                                {todayShift
                                    ? `${formatTime(todayShift.startTime)}- ${formatTime(todayShift.endTime)}`
                                    : '9.00 AM- 5.00\nPM'}
                            </Text>
                        </View>
                        <View style={styles.shiftInfoItem}>
                            <MaterialCommunityIcons name="silverware-fork-knife" size={22} color={theme.iconSecondary} />
                            <Text style={[styles.shiftInfoText, { color: theme.textSecondary }]}>
                                {todayShift?.location || 'Main Dining\nHall'}
                            </Text>
                        </View>
                        <View style={styles.shiftInfoItem}>
                            <FontAwesome5 name="concierge-bell" size={18} color={theme.iconSecondary} />
                            <Text style={[styles.shiftInfoText, { color: theme.textSecondary }]}>
                                {todayShift?.shiftRole || 'Server'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* This Week's Shift */}
                <View style={[styles.weekShiftCard, { backgroundColor: theme.card }]}>
                    <View style={styles.weekHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>This Week's Shift</Text>
                        <TouchableOpacity
                            style={styles.fullScheduleBtn}
                            onPress={() => router.push('/schedule')}
                        >
                            <Text style={[styles.fullScheduleLink, { color: theme.primary }]}>Full Schedule</Text>
                            <Ionicons name="chevron-forward" size={14} color={theme.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Day labels row */}
                    <View style={styles.weekRow}>
                        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                            <View key={`label-${index}`} style={styles.dayColumn}>
                                <Text style={[
                                    styles.dayLabel,
                                    { color: theme.textMuted },
                                    isToday(index) && { color: theme.primary, fontWeight: '700' },
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
                                    isToday(index) && { backgroundColor: theme.primary },
                                ]}>
                                    <Text style={[
                                        styles.dayNumber,
                                        { color: theme.textSecondary },
                                        isToday(index) && styles.dayNumberToday,
                                    ]}>
                                        {weekDates[index]}
                                    </Text>
                                </View>
                                {hasShiftOnDay(index) && (
                                    <View style={[
                                        styles.shiftDot,
                                        { backgroundColor: theme.primary },
                                        isToday(index) && { backgroundColor: theme.danger },
                                    ]} />
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Leaves Remaining */}
                <TouchableOpacity 
                    style={[styles.leavesCard, { backgroundColor: theme.successBg }]}
                    onPress={() => router.push('/(employee)/leave/apply' as any)}
                    activeOpacity={0.8}
                >
                    <View style={[styles.leavesIconWrapper, { backgroundColor: theme.successLight }]}>
                        <Ionicons name="time" size={28} color={theme.primary} />
                    </View>
                    <Text style={[styles.leavesCount, { color: theme.text }]}>{leaveBalance || 14}</Text>
                    <Text style={[styles.leavesLabel, { color: theme.text }]}>Leaves Remaining</Text>
                </TouchableOpacity>

                {/* Pending Swaps */}
                <TouchableOpacity
                    style={[styles.swapCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => router.push('/(employee)/swap/pending-requests' as any)}
                    activeOpacity={0.7}
                >
                    <View style={styles.swapLeft}>
                        <View style={[styles.swapIconContainer, { backgroundColor: theme.card }]}>
                            <Ionicons name="swap-horizontal" size={22} color={theme.primary} />
                        </View>
                        <View style={styles.swapTextContainer}>
                            <Text style={[styles.swapTitle, { color: theme.text }]}>Pending Swaps</Text>
                            <Text style={[styles.swapSubtitle, { color: theme.textMuted }]}>
                                You have {pendingSwaps || 2} pending requests
                            </Text>
                        </View>
                    </View>
                    <View style={styles.swapRight}>
                        {(pendingSwaps > 0 || true) && <View style={styles.notificationBadge} />}
                        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
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
    },
    scrollContent: {
        paddingBottom: 10,
    },

    /* ---- Header ---- */
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 6,
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
        borderRadius: 2,
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
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
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* ---- Greeting ---- */
    greetingSection: {
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 10,
    },
    greeting: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 0.1,
    },
    subGreeting: {
        fontSize: 13,
        marginTop: 2,
    },

    /* ---- Check In Button ---- */
    checkInButton: {
        marginHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    checkedIn: {
        backgroundColor: '#10B981',
    },
    checkOutStyle: {
        backgroundColor: '#F5A623',
    },
    checkInText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    /* ---- Today's Shift ---- */
    todayShiftCard: {
        marginHorizontal: 20,
        padding: 10,
        borderRadius: 12,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
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
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 16,
    },

    /* ---- This Week's Shift ---- */
    weekShiftCard: {
        marginHorizontal: 20,
        padding: 10,
        borderRadius: 12,
        marginBottom: 10,
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
        fontWeight: '500',
        marginBottom: 6,
    },
    dayNumberCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNumber: {
        fontSize: 13,
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
        marginTop: 4,
    },

    /* ---- Leaves Remaining ---- */
    leavesCard: {
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    leavesCount: {
        fontSize: 22,
        fontWeight: '800',
    },
    leavesLabel: {
        fontSize: 17,
        fontWeight: '600',
        flex: 1,
    },

    /* ---- Pending Swaps ---- */
    swapCard: {
        marginHorizontal: 20,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    swapTextContainer: {
        flex: 1,
    },
    swapTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 2,
    },
    swapSubtitle: {
        fontSize: 12,
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
