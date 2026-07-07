import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getLeaveSummary, getPendingRequests, LeaveSummary } from '@/src/services/leaveApi';
import { useAuth } from '@/src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

const ZERO_SUMMARY: LeaveSummary = {
    assignedLeaves: [
        { id: '1', name: 'Annual', totalDays: 0, usedDays: 0, remainingDays: 0 },
        { id: '2', name: 'Sick', totalDays: 0, usedDays: 0, remainingDays: 0 },
        { id: '3', name: 'Casual', totalDays: 0, usedDays: 0, remainingDays: 0 },
        { id: '4', name: 'Maternity Leave', totalDays: 0, usedDays: 0, remainingDays: 0 },
    ],
    totalRemaining: 0,
    absentThisMonth: 0,
};

export default function LeaveDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const EMPLOYEE_ID = user?.id || '';
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
        divider: theme.borderLight,
        successText: theme.success,
        successSoft: theme.successBg,
        danger: theme.danger,
        dangerSoft: isDark ? '#3A1515' : '#FEF2F2',
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: C.bg },
        content: { padding: 20, paddingBottom: 40 },
        sectionTitle: {
            fontSize: 16, fontWeight: '700', color: C.text,
            marginBottom: 12, letterSpacing: -0.2,
        },
        card: {
            backgroundColor: C.card, borderRadius: 16,
            shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 }, elevation: 2,
            marginBottom: 14, overflow: 'hidden',
        },
        leaveRow: {
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15,
        },
        leaveRowBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
        leaveRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
        leaveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, opacity: 0.5 },
        leaveRowName: { fontSize: 14, color: C.textSecondary, fontWeight: '500' },
        leaveRowRight: { flexDirection: 'row', alignItems: 'baseline' },
        leaveRowDays: { fontSize: 16, color: C.text, fontWeight: '700' },
        leaveRowUnit: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
        gridRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
        gridCard: { flex: 1, padding: 18, justifyContent: 'space-between', aspectRatio: 1, shadowOpacity: 0.03, marginBottom: 0 },
        gridIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
        gridNumber: { fontSize: 38, fontWeight: '800', letterSpacing: -1, marginTop: 8 },
        gridLabel: { fontSize: 13, fontWeight: '600', marginTop: 2, opacity: 0.85 },
        primaryButton: {
            backgroundColor: C.primary, borderRadius: 16, paddingVertical: 16,
            alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'center',
            shadowColor: C.primary, shadowOpacity: 0.25, shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 }, elevation: 4,
        },
        primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
        secondaryButton: {
            backgroundColor: C.card, borderRadius: 16, paddingVertical: 16,
            alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
            borderWidth: 1.5, borderColor: C.primarySoft,
            shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 }, elevation: 1,
        },
        secondaryButtonText: { color: C.primary, fontSize: 16, fontWeight: '700' },
        badge: {
            backgroundColor: C.danger, borderRadius: 12, minWidth: 22, height: 22,
            justifyContent: 'center', alignItems: 'center', marginLeft: 8, paddingHorizontal: 6,
        },
        badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    });

    const [summary, setSummary] = useState<LeaveSummary>(ZERO_SUMMARY);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const summaryData = await getLeaveSummary(EMPLOYEE_ID);
            setSummary(summaryData);
        } catch (error) {}
        try {
            const pendingData = await getPendingRequests(EMPLOYEE_ID);
            setPendingCount(pendingData.length);
        } catch (error) {}
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Your Assigned Leaves</Text>
            <View style={styles.card}>
                {summary.assignedLeaves.map((leave, index) => (
                    <View
                        key={leave.id}
                        style={[styles.leaveRow, index < summary.assignedLeaves.length - 1 && styles.leaveRowBorder]}
                    >
                        <View style={styles.leaveRowLeft}>
                            <View style={styles.leaveDot} />
                            <Text style={styles.leaveRowName}>{leave.name}</Text>
                        </View>
                        <View style={styles.leaveRowRight}>
                            <Text style={styles.leaveRowDays}>{leave.totalDays}</Text>
                            <Text style={styles.leaveRowUnit}> days</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.gridRow}>
                <View style={[styles.card, styles.gridCard, { backgroundColor: C.successSoft }]}>
                    <View style={[styles.gridIcon, { backgroundColor: isDark ? '#2A5040' : '#FFFFFF' }]}>
                        <Ionicons name="calendar-clear-outline" size={20} color={C.successText} />
                    </View>
                    <Text style={[styles.gridNumber, { color: C.successText }]}>{summary.totalRemaining}</Text>
                    <Text style={[styles.gridLabel, { color: C.successText }]}>Leaves Remaining</Text>
                </View>

                <View style={[styles.card, styles.gridCard, { backgroundColor: C.dangerSoft }]}>
                    <View style={[styles.gridIcon, { backgroundColor: isDark ? '#5A2020' : '#FFFFFF' }]}>
                        <Ionicons name="person-remove-outline" size={20} color={C.danger} />
                    </View>
                    <Text style={[styles.gridNumber, { color: C.danger }]}>{summary.absentThisMonth}</Text>
                    <Text style={[styles.gridLabel, { color: C.danger }]}>Absent This Month</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/(employee)/leave/apply' as any)}
                activeOpacity={0.8}
            >
                <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.primaryButtonText}>Apply for a Leave</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/(employee)/leave/requestStatus' as any)}
                activeOpacity={0.8}
            >
                <Ionicons name="document-text-outline" size={20} color={C.primary} style={{ marginRight: 8 }} />
                <Text style={styles.secondaryButtonText}>Request Status</Text>
                {pendingCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{pendingCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}
