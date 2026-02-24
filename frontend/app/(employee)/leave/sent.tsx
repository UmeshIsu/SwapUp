// sent.tsx - Leave Request Sent Confirmation Screen
// Shown after user successfully submits a leave request
// Displays a success message and summary of the submitted request

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function LeaveSent() {
    const router = useRouter();

    // Get request details passed from the apply screen
    const params = useLocalSearchParams<{
        leaveTypeName: string;
        startDate: string;
        endDate: string;
    }>();

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* ---- Success checkmark and title ---- */}
            <View style={styles.centerContent}>
                <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text style={styles.title}>Leave Request Sent!</Text>
                <Text style={styles.subtitle}>
                    Your request has been submitted and is now waiting for manager approval.
                </Text>
            </View>

            {/* ---- Summary card ---- */}
            {params.leaveTypeName ? (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Request Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Leave Type</Text>
                        <Text style={styles.summaryValue}>{params.leaveTypeName}</Text>
                    </View>
                    {params.startDate ? (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>From</Text>
                            <Text style={styles.summaryValue}>{formatDate(params.startDate)}</Text>
                        </View>
                    ) : null}
                    {params.endDate ? (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>To</Text>
                            <Text style={styles.summaryValue}>{formatDate(params.endDate)}</Text>
                        </View>
                    ) : null}
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Status</Text>
                        <Text style={styles.statusBadge}>Pending</Text>
                    </View>
                </View>
            ) : null}

            {/* ---- Action Buttons ---- */}
            <TouchableOpacity
                style={styles.viewPendingButton}
                onPress={() => router.replace('/(employee)/leave/pending')}
            >
                <Text style={styles.viewPendingText}>View Pending Requests</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.replace('/(employee)/leave')}
            >
                <Text style={styles.homeButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 24,
        justifyContent: 'center',
    },
    centerContent: {
        alignItems: 'center',
        marginBottom: 30,
    },
    checkCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4caf50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkMark: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    summaryCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 14,
        padding: 18,
        marginBottom: 24,
    },
    summaryTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
        marginBottom: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#777',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
    },
    statusBadge: {
        fontSize: 13,
        fontWeight: '600',
        color: '#f57c00',
        backgroundColor: '#fff3e0',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        overflow: 'hidden',
    },
    viewPendingButton: {
        backgroundColor: '#1a73e8',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    viewPendingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    homeButton: {
        borderWidth: 1.5,
        borderColor: '#1a73e8',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    homeButtonText: {
        color: '#1a73e8',
        fontSize: 16,
        fontWeight: '600',
    },
});
