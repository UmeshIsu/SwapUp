import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '../../../src/components/themed-text';
import { ThemedView } from '../../../src/components/themed-view';
import { Colors } from '../../../src/constants/theme';
import { useAuth } from '../../../src/context/AuthContext';
import { useColorScheme } from '../../../src/hooks/use-color-scheme';
import { apiCall } from '../../../src/services/api';

type Shift = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    instructions?: string;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MyScheduleScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { token } = useAuth();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDateKey, setSelectedDateKey] = useState<string>('');
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    useEffect(() => {
        const loadShifts = async () => {
            setIsLoading(true);
            setError('');

            try {
                if (!token || token === 'mock-token') {
                    setShifts(getMockShifts(year, month));
                } else {
                    const data = await apiCall(`/shifts/my?year=${year}&month=${month}`, { token });
                    setShifts(data.shifts ?? data);
                }
            } catch (err: any) {
                setError(err.message || 'Unable to load shifts');
                setShifts([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadShifts();
    }, [month, token, year]);

    const shiftsByDate = useMemo(() => {
        const map = new Map<string, Shift[]>();

        for (const shift of shifts) {
            const key = toDateKey(shift.date);
            const existing = map.get(key) ?? [];
            map.set(key, [...existing, shift]);
        }

        return map;
    }, [shifts]);

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    const calendarCells = Array.from({ length: totalCells }, (_, i) => {
        const dayNumber = i - firstDay + 1;
        if (dayNumber < 1 || dayNumber > daysInMonth) {
            return null;
        }
        return dayNumber;
    });

    const effectiveSelectedDateKey = selectedDateKey || `${year}-${String(month).padStart(2, '0')}-01`;
    const selectedShifts = shiftsByDate.get(effectiveSelectedDateKey) ?? [];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
            <View style={styles.monthHeader}>
                <Pressable onPress={() => setCurrentMonth(new Date(year, month - 2, 1))}>
                    <ThemedText style={[styles.monthButton, { color: theme.tint }]}>{'<'}</ThemedText>
                </Pressable>
                <ThemedText type="subtitle">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</ThemedText>
                <Pressable onPress={() => setCurrentMonth(new Date(year, month, 1))}>
                    <ThemedText style={[styles.monthButton, { color: theme.tint }]}>{'>'}</ThemedText>
                </Pressable>
            </View>

            <ThemedView style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <ThemedText style={styles.legendText}>Morning</ThemedText>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                    <ThemedText style={styles.legendText}>Evening</ThemedText>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                    <ThemedText style={styles.legendText}>Night</ThemedText>
                </View>
            </ThemedView>

            <View style={styles.calendarGrid}>
                {DAY_LABELS.map((label) => (
                    <ThemedText key={label} style={styles.dayLabel}>{label}</ThemedText>
                ))}

                {calendarCells.map((dayNumber, index) => {
                    if (!dayNumber) {
                        return <View key={`empty-${index}`} style={styles.dayCell} />;
                    }

                    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                    const hasShift = shiftsByDate.has(dateKey);
                    const isSelected = effectiveSelectedDateKey === dateKey;

                    let shiftColor = theme.tint;
                    if (hasShift) {
                        const shiftType = shiftsByDate.get(dateKey)?.[0]?.type?.toLowerCase() || '';
                        if (shiftType.includes('morning')) shiftColor = '#F59E0B';
                        else if (shiftType.includes('evening') || shiftType.includes('afternoon')) shiftColor = '#F97316';
                        else if (shiftType.includes('night')) shiftColor = '#3B82F6';
                    }

                    return (
                        <Pressable
                            key={dateKey}
                            style={[
                                styles.dayCell,
                                isSelected && { backgroundColor: theme.tint + '22', borderRadius: 8 },
                            ]}
                            onPress={() => setSelectedDateKey(dateKey)}
                        >
                            <ThemedText style={styles.dayNumber}>{dayNumber}</ThemedText>
                            {hasShift ? <View style={[styles.shiftDot, { backgroundColor: shiftColor }]} /> : null}
                        </Pressable>
                    );
                })}
            </View>

            <ThemedText type="subtitle" style={styles.sectionTitle}>Shifts on {effectiveSelectedDateKey}</ThemedText>

            {isLoading ? <ActivityIndicator size="large" color={theme.tint} /> : null}
            {!isLoading && error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
            {!isLoading && !error && selectedShifts.length === 0 ? (
                <ThemedText style={styles.emptyText}>No shifts for this date.</ThemedText>
            ) : null}

            {!isLoading && !error
                ? selectedShifts.map((shift) => {
                    let cardColor = theme.tint;
                    const shiftType = shift.type.toLowerCase();
                    if (shiftType.includes('morning')) cardColor = '#F59E0B';
                    else if (shiftType.includes('evening') || shiftType.includes('afternoon')) cardColor = '#F97316';
                    else if (shiftType.includes('night')) cardColor = '#3B82F6';

                    return (
                        <Pressable
                            key={shift.id}
                            style={[styles.shiftCard, { backgroundColor: colorScheme === 'dark' ? '#252525' : '#F9F9F9', borderLeftWidth: 4, borderLeftColor: cardColor }]}
                            onPress={() =>
                                router.push({
                                    pathname: '/(employee)/schedule/[shiftId]',
                                    params: {
                                        shiftId: shift.id,
                                        date: shift.date,
                                        startTime: shift.startTime,
                                        endTime: shift.endTime,
                                        type: shift.type,
                                        instructions: shift.instructions ?? '',
                                    },
                                } as any)
                            }
                        >
                            <ThemedText style={[styles.shiftType, { color: cardColor }]}>{shift.type} Shift</ThemedText>
                            <ThemedText>{shift.startTime} - {shift.endTime}</ThemedText>
                            <ThemedText style={styles.viewDetails}>View details</ThemedText>
                        </Pressable>
                    );
                })
                : null}
        </ScrollView>
    );
}

function toDateKey(date: string) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getMockShifts(year: number, month: number): Shift[] {
    return [
        {
            id: 'mock-1',
            date: new Date(year, month - 1, 5).toISOString(),
            startTime: '08:00',
            endTime: '16:00',
            type: 'Morning',
            instructions: 'Open counters by 8:00 and verify attendance sheet.',
        },
        {
            id: 'mock-2',
            date: new Date(year, month - 1, 12).toISOString(),
            startTime: '14:00',
            endTime: '22:00',
            type: 'Evening',
            instructions: 'Complete stock update before shift ends.',
        },
    ];
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        gap: 12,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    monthButton: {
        fontSize: 22,
        fontWeight: '700',
        width: 24,
        textAlign: 'center',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayLabel: {
        width: `${100 / 7}%`,
        textAlign: 'center',
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    dayCell: {
        width: `${100 / 7}%`,
        minHeight: 46,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 6,
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: '600',
    },
    shiftDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 4,
    },
    sectionTitle: {
        marginTop: 8,
    },
    shiftCard: {
        borderRadius: 12,
        padding: 14,
        gap: 4,
    },
    shiftType: {
        fontWeight: '700',
    },
    viewDetails: {
        color: '#0a7ea4',
        marginTop: 2,
        fontSize: 12,
    },
    emptyText: {
        color: '#888',
    },
    errorText: {
        color: '#d9534f',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 16,
        marginTop: -4,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        color: '#888',
    },
});
