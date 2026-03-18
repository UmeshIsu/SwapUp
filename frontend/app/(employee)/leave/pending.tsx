// pending.tsx - Pending Leave Requests Screen (Picture 4)
// Shows the employee's pending leave requests
// Starts empty (0 requests) — real data loads from the backend when connected
// Each card has a "Withdraw Request" button

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getPendingRequests, withdrawLeaveRequest, LeaveRequest } from '@/src/services/leaveApi';

// Employee ID — in the future this comes from your auth/login system
const EMPLOYEE_ID = '00000000-0000-0000-0000-000000000000';

export default function PendingRequests() {
    const router = useRouter();

    // Empty list — fills automatically when backend is connected
    const [requests, setRequests] = useState<LeaveRequest[]>([]);

    // Try to load real pending requests from the backend
    useEffect(() => {
        loadPending();
    }, []);

    const loadPending = async () => {
        try {
            const data = await getPendingRequests(EMPLOYEE_ID);
            setRequests(data);
        } catch (error) {
            // Backend not running — show empty state
            setRequests([]);
        }
    };

    // Format date like "Oct 30" from "2025-10-30"
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Handle tapping "Withdraw Request"
    const handleWithdraw = (request: LeaveRequest) => {
        Alert.alert(
            'Withdraw Request',
            `Withdraw leave request from ${formatDate(request.startDate)} to ${formatDate(request.endDate)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await withdrawLeaveRequest(request.id);
                        } catch (error) {
                            // Backend offline — remove locally anyway
                        }
                        // Remove from the list right away so UI updates immediately
                        setRequests((prev: LeaveRequest[]) =>
                            prev.filter((r: LeaveRequest) => r.id !== request.id)
                        );
                    },
                },
            ]
        );
    };

    // ---- Empty state (no pending requests) ----
    if (requests.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🗓️</Text>
                <Text style={styles.emptyTitle}>No Pending Requests</Text>
                <Text style={styles.emptySubtitle}>
                    You have no pending leave requests.{'\n'}Apply for a new leave below.
                </Text>
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => router.push('/(employee)/leave/apply')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.applyButtonText}>Apply for a Leave</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ---- List of pending request cards ----
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {requests.map((request: LeaveRequest) => (
                <View key={request.id} style={styles.card}>

                    {/* Top row: avatar + employee name + subtitle */}
                    <View style={styles.cardHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>👤</Text>
                        </View>
                        <View>
                            {/* Employee name comes from the database via the API */}
                            <Text style={styles.employeeName}>{request.employee_name}</Text>
                            <Text style={styles.requestSubtitle}>You sent a request</Text>
                        </View>
                    </View>

                    {/* Leave details box */}
                    <View style={styles.detailsBox}>
                        <Text style={styles.requestedLabel}>Requested Leave:</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.calIcon}>📅</Text>
                            <View>
                                <Text style={styles.leaveDates}>
                                    {formatDate(request.startDate)} – {formatDate(request.endDate)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Withdraw button */}
                    <TouchableOpacity
                        style={styles.withdrawButton}
                        onPress={() => handleWithdraw(request)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.withdrawButtonText}>Withdraw Request</Text>
                    </TouchableOpacity>

                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { padding: 16, paddingBottom: 40, gap: 14 },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#f5f5f5',
    },
    emptyEmoji: { fontSize: 52, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 8 },
    emptySubtitle: {
        fontSize: 14, color: '#777', textAlign: 'center',
        lineHeight: 21, marginBottom: 28,
    },
    applyButton: {
        backgroundColor: '#1a73e8', borderRadius: 30,
        paddingHorizontal: 32, paddingVertical: 14,
    },
    applyButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    card: { backgroundColor: '#eeeeee', borderRadius: 14, padding: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#b0bec5', justifyContent: 'center',
        alignItems: 'center', marginRight: 12,
    },
    avatarText: { fontSize: 22 },
    employeeName: { fontSize: 15, fontWeight: '700', color: '#111' },
    requestSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },

    detailsBox: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10 },
    requestedLabel: { fontSize: 12, color: '#999', marginBottom: 8 },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    calIcon: { fontSize: 22, marginRight: 10 },
    leaveType: { fontSize: 14, fontWeight: '600', color: '#111' },
    leaveDates: { fontSize: 13, color: '#666', marginTop: 2 },

    withdrawButton: {
        borderWidth: 1.5, borderColor: '#e53935',
        borderRadius: 8, paddingVertical: 11,
        alignItems: 'center', backgroundColor: '#fff',
    },
    withdrawButtonText: { color: '#e53935', fontSize: 14, fontWeight: '600' },
});
