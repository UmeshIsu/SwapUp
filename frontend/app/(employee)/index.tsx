import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { apiCall } from '@/src/services/api';

interface Shift {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    location?: string;
}

export default function EmployeeDashboardScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { user } = useAuth();
    const router = useRouter();
    const [todayShift, setTodayShift] = useState<Shift | null>(null);
    const [weekShifts, setWeekShifts] = useState<{ date: Date; hasShift: boolean }[]>([]);

    useEffect(() => {
        // Mock today's shift
        const today = new Date();
        const mockShift: Shift = {
            id: '1',
            date: today.toISOString(),
            startTime: '09:00 AM',
            endTime: '05:00 PM',
            type: 'Main Dining Hall',
            location: 'Server',
        };
        setTodayShift(mockShift);

        // Generate this week's calendar
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        const week = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            week.push({
                date,
                hasShift: i === 0 || i === 2 || i === 4, // Mock shifts on Sun, Tue, Thu
            });
        }
        setWeekShifts(week);
    }, []);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <ThemedView style={styles.header}>
                <ThemedText style={styles.companyName}>Company name</ThemedText>
                <TouchableOpacity onPress={() => router.push('/(employee)/profile' as any)} style={styles.profileAvatarButton}>
                    <IconSymbol name="person.fill" size={24} color={theme.text} />
                </TouchableOpacity>
            </ThemedView>

            {/* Greeting */}
            <ThemedView style={styles.greetingSection}>
                <ThemedText style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'User'} !</ThemedText>
                <ThemedText style={styles.subGreeting}>Have a nice day</ThemedText>
            </ThemedView>

            {/* Check In Button */}
            <TouchableOpacity style={styles.checkInButton}>
                <ThemedText style={styles.checkInText}>Check in</ThemedText>
            </TouchableOpacity>

            {/* Announcement */}
            <ThemedView style={styles.announcement}>
                <View style={styles.announcementHeader}>
                    <IconSymbol name="exclamationmark.triangle.fill" color="#F59E0B" size={20} />
                    <ThemedText style={styles.announcementTitle}>Announcement</ThemedText>
                </View>
                <ThemedText style={styles.announcementText}>
                    Mandatory staff meeting will be held on tomorrow
                </ThemedText>
            </ThemedView>

            {/* Today Shift */}
            {todayShift && (
                <ThemedView style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Today Shift</ThemedText>
                    <ThemedView style={styles.shiftCard}>
                        <View style={styles.shiftRow}>
                            <View style={styles.shiftInfo}>
                                <IconSymbol name="clock.fill" color="#3498db" size={20} />
                                <ThemedText style={styles.shiftTime}>
                                    {todayShift.startTime} - {todayShift.endTime}
                                </ThemedText>
                            </View>
                            <View style={styles.shiftInfo}>
                                <IconSymbol name="mappin.circle.fill" color="#3498db" size={20} />
                                <ThemedText style={styles.shiftTime}>{todayShift.type}</ThemedText>
                            </View>
                            <View style={styles.shiftInfo}>
                                <IconSymbol name="person.fill" color="#3498db" size={20} />
                                <ThemedText style={styles.shiftTime}>{todayShift.location}</ThemedText>
                            </View>
                        </View>
                    </ThemedView>
                </ThemedView>
            )}

            {/* This Week's Shift */}
            <ThemedView style={styles.section}>
                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>This Week's Shift</ThemedText>
                    <TouchableOpacity onPress={() => router.push('/(employee)/schedule' as any)}>
                        <ThemedText style={styles.linkText}>Full Schedule ›</ThemedText>
                    </TouchableOpacity>
                </View>
                <ThemedView style={styles.weekCalendar}>
                    {weekShifts.map((day, index) => (
                        <View key={index} style={styles.dayColumn}>
                            <ThemedText style={styles.dayLabel}>
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                            </ThemedText>
                            <View
                                style={[
                                    styles.dayCircle,
                                    day.hasShift && styles.dayWithShift,
                                    { backgroundColor: day.hasShift ? '#3498db' : (colorScheme === 'dark' ? '#444' : '#E8E8E8') },
                                ]}
                            >
                                <ThemedText
                                    style={[
                                        styles.dayNumber,
                                        { color: day.hasShift ? '#fff' : theme.text },
                                    ]}
                                >
                                    {day.date.getDate()}
                                </ThemedText>
                            </View>
                        </View>
                    ))}
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    companyName: {
        fontSize: 16,
        fontWeight: '600',
    },
    profileAvatarButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    greetingSection: {
        marginBottom: 16,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subGreeting: {
        fontSize: 14,
        color: '#888',
    },
    checkInButton: {
        backgroundColor: '#3498db',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    checkInText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    announcement: {
        backgroundColor: '#FEF3C7',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    announcementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    announcementTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#92400E',
    },
    announcementText: {
        fontSize: 14,
        color: '#92400E',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    linkText: {
        fontSize: 14,
        color: '#3498db',
    },
    shiftCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    shiftRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
    },
    shiftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    shiftTime: {
        fontSize: 13,
    },
    weekCalendar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    dayColumn: {
        alignItems: 'center',
        gap: 8,
    },
    dayLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayWithShift: {
        backgroundColor: '#3498db',
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: '600',
    },
    leavesCard: {
        backgroundColor: '#D1FAE5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    leavesContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    leavesIconContainer: {
        backgroundColor: '#10B981',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leavesNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    leavesText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#065F46',
    },
    swapsCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        position: 'relative',
    },
    swapsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    swapsTextContainer: {
        flex: 1,
    },
    swapsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    swapsSubtitle: {
        fontSize: 13,
        color: '#888',
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF5A5F',
    },
});
