// index.tsx - Leave Dashboard Screen (Picture 2)
// Shows:
//  - Assigned leaves table (all start at 0 until backend is connected)
//  - Green card: total remaining leaves (0 initially)
//  - Red card: absent this month (0 initially)
//  - Button to apply for leave
//  - Button to view pending requests

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

// Employee ID — in the future this comes from your auth/login system
const EMPLOYEE_ID = '00000000-0000-0000-0000-000000000000';

// All zeros until employee data loads from the database
const ZERO_SUMMARY: LeaveSummary = {
    assignedLeaves: [
        { id: '1', name: 'Annual Leave', totalDays: 0, usedDays: 0, remainingDays: 0 },
        { id: '2', name: 'Sick Leave', totalDays: 0, usedDays: 0, remainingDays: 0 },
        { id: '3', name: 'Casual Leave', totalDays: 0, usedDays: 0, remainingDays: 0 },
        { id: '4', name: 'Maternity Leave', totalDays: 0, usedDays: 0, remainingDays: 0 },
    ],
    totalRemaining: 0,
    absentThisMonth: 0,
};

export default function LeaveDashboard() {
    const router = useRouter();

    // Start with all zeros — no spinner, content is visible immediately
    const [summary, setSummary] = useState<LeaveSummary>(ZERO_SUMMARY);

    // Pending count also starts at 0
    const [pendingCount, setPendingCount] = useState(0);

    // When the component loads, try to get real data from the backend
    // If the backend isn't running this silently fails and zeros stay shown
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch leave summary (assigned days, remaining, absent)
            const summaryData = await getLeaveSummary(EMPLOYEE_ID);
            setSummary(summaryData);
        } catch (error) {
            // Backend not running — keep zeros showing
        }

        try {
            // Fetch pending request count separately
            const pendingData = await getPendingRequests(EMPLOYEE_ID);
            setPendingCount(pendingData.length);
        } catch (error) {
            // Backend not running — keep 0
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* ---- Assigned Leaves Table ---- */}
            <Text style={styles.sectionTitle}>Your Assigned Leaves</Text>

            <View style={styles.leaveTable}>
                {summary.assignedLeaves.map((leave) => (
                    <View key={leave.id} style={styles.leaveRow}>
                        <Text style={styles.leaveRowName}>{leave.name}</Text>
                        {/* Show days from database when connected, or 0 */}
                        <Text style={styles.leaveRowDays}>{leave.totalDays} Days</Text>
                    </View>
                ))}
            </View>

            {/* ---- Green Card: Remaining Leaves ---- */}
            <View style={[styles.infoCard, styles.greenCard]}>
                <View style={[styles.iconCircle, { backgroundColor: '#4caf50' }]}>
                    <Text style={styles.iconText}>🕐</Text>
                </View>
                <Text style={styles.cardNumber}>{summary.totalRemaining}</Text>
                <Text style={styles.cardLabel}> Leaves Remaining</Text>
            </View>

            {/* ---- Red Card: Absent This Month ---- */}
            <View style={[styles.infoCard, styles.redCard]}>
                <View style={[styles.iconCircle, { backgroundColor: '#ef5350' }]}>
                    <Text style={styles.iconText}>📅</Text>
                </View>
                <Text style={styles.cardNumber}>{summary.absentThisMonth}</Text>
                <Text style={styles.cardLabel}> Absent this month</Text>
            </View>

            {/* ---- Button: Apply for Leave ---- */}
            <TouchableOpacity
                style={styles.applyButton}
                onPress={() => router.push('/(employee)/leave/apply' as any)}
                activeOpacity={0.8}
            >
                <Text style={styles.applyButtonText}>Apply for a Leave</Text>
            </TouchableOpacity>

            {/* ---- Button: View Pending Requests ---- */}
            <TouchableOpacity
                style={styles.pendingButton}
                onPress={() => router.push('/(employee)/leave/pending' as any)}
                activeOpacity={0.8}
            >
                <Text style={styles.pendingButtonText}>View Pending Requests</Text>
                {pendingCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{pendingCount}</Text>
                    </View>
                )}
            </TouchableOpacity>



        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
        marginBottom: 10,
    },
    leaveTable: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        marginBottom: 16,
        overflow: 'hidden',
    },
    leaveRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    leaveRowName: {
        fontSize: 14,
        color: '#333',
    },
    leaveRowDays: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    greenCard: {
        backgroundColor: '#e8f5e9',
    },
    redCard: {
        backgroundColor: '#fce4ec',
    },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    iconText: {
        fontSize: 18,
    },
    cardNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
    },
    cardLabel: {
        fontSize: 14,
        color: '#444',
        marginLeft: 4,
    },
    applyButton: {
        backgroundColor: '#1a73e8',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    pendingButton: {
        backgroundColor: '#1a73e8',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    pendingButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    badge: {
        backgroundColor: '#e53935',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
