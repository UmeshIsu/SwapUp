import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (date: Date) => `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;

// Generate every Mon–Sun week for the current calendar year
const generateWeeks = () => {
    const weeks: {
        label: string;
        badge: string;
        isPast: boolean;
        weekStartISO: string;  // ISO string for the Monday of this week
    }[] = [];

    const now = new Date();
    const year = now.getFullYear();

    // First Monday of this year
    const jan1 = new Date(year, 0, 1);
    const dow = jan1.getDay(); // 0=Sun, 1=Mon … 6=Sat
    const daysToFirstMon = dow === 1 ? 0 : dow === 0 ? 1 : 8 - dow;
    const firstMonday = new Date(year, 0, 1 + daysToFirstMon);

    // This week's Monday (for relative labelling)
    const todayDow = now.getDay();
    const thisMon = new Date(now);
    thisMon.setDate(now.getDate() - (todayDow === 0 ? 6 : todayDow - 1));
    thisMon.setHours(0, 0, 0, 0);

    let weekStart = new Date(firstMonday);
    while (weekStart.getFullYear() <= year) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        if (weekStart.getFullYear() > year) break;

        const diffWeeks = Math.round(
            (weekStart.getTime() - thisMon.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );

        let badge = '';
        if (diffWeeks === 0) badge = 'Current Week';
        else if (diffWeeks === 1) badge = 'Next Week';
        else if (diffWeeks > 1) badge = `In ${diffWeeks} weeks`;
        else badge = `${Math.abs(diffWeeks)} week${Math.abs(diffWeeks) > 1 ? 's' : ''} ago`;

        weeks.push({
            label: `${fmt(weekStart)} – ${fmt(weekEnd)}`,
            badge,
            isPast: diffWeeks < 0,
            weekStartISO: weekStart.toISOString(),
        });

        weekStart = new Date(weekStart);
        weekStart.setDate(weekStart.getDate() + 7);
    }
    return weeks;
};

const WEEKS = generateWeeks();
const CURRENT_WEEK_IDX = Math.max(0, WEEKS.findIndex(w => w.badge === 'Current Week'));

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function WeekSelectScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState(CURRENT_WEEK_IDX);
    const listRef = useRef<FlatList>(null);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Choose Your Week</Text>
                <View style={styles.headerRight} />
            </View>

            <View style={styles.body}>
                <Text style={styles.title}>Select a Week</Text>
                <Text style={styles.subtitle}>Pick the week you want to create or edit a roster for</Text>

                {/* Week list */}
                <FlatList
                    ref={listRef}
                    data={WEEKS}
                    keyExtractor={(_, i) => String(i)}
                    initialScrollIndex={CURRENT_WEEK_IDX}
                    getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
                    showsVerticalScrollIndicator={false}
                    style={styles.list}
                    renderItem={({ item: week, index }) => {
                        const isSelected = selected === index;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.weekRow,
                                    isSelected && styles.weekRowSelected,
                                    week.isPast && styles.weekRowPast,
                                ]}
                                onPress={() => setSelected(index)}
                                activeOpacity={0.75}
                            >
                                <View style={styles.weekRowLeft}>
                                    <View style={[styles.dot, isSelected && styles.dotSelected, week.badge === 'Current Week' && styles.dotCurrent]} />
                                    <View>
                                        <Text style={[styles.weekLabel, isSelected && styles.weekLabelSel, week.isPast && styles.weakText]}>
                                            {week.label}
                                        </Text>
                                        <Text style={[styles.weekBadge, week.badge === 'Current Week' && styles.badgeCurrent, week.isPast && styles.weakText]}>
                                            {week.badge}
                                        </Text>
                                    </View>
                                </View>
                                {isSelected && <Ionicons name="checkmark-circle" size={22} color="#1976D2" />}
                            </TouchableOpacity>
                        );
                    }}
                />

                {/* Confirm button */}
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() =>
                        router.push({
                            pathname: '/rosterCreation/create-roster',
                            params: {
                                weekLabel: WEEKS[selected].label,
                                weekStartISO: WEEKS[selected].weekStartISO,
                            },
                        })
                    }
                >
                    <Text style={styles.confirmText}>Confirm Week  →</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 15,
    },
    backButton: { width: 40 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
    headerRight: { width: 40 },
    body: { flex: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
    title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 6, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 18, lineHeight: 20 },
    list: { flex: 1 },
    weekRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
        marginBottom: 10, borderWidth: 1.5, borderColor: '#E3F2FD',
        height: 72,
    },
    weekRowSelected: {
        borderColor: '#1976D2', backgroundColor: '#EBF3FE',
    },
    weekRowPast: { opacity: 0.5 },
    weekRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dot: {
        width: 10, height: 10, borderRadius: 5, backgroundColor: '#ccc',
    },
    dotSelected: { backgroundColor: '#1976D2' },
    dotCurrent: { backgroundColor: '#22C55E' },
    weekLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
    weekLabelSel: { color: '#1565C0' },
    weekBadge: { fontSize: 12, color: '#888', marginTop: 2 },
    badgeCurrent: { color: '#22C55E', fontWeight: '600' },
    weakText: { color: '#bbb' },
    confirmButton: {
        backgroundColor: '#1976D2', borderRadius: 14,
        paddingVertical: 16, alignItems: 'center', marginTop: 14,
        shadowColor: '#1976D2', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
