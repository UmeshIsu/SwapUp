import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── Component ────────────────────────────────────────────────────────────────
export default function SwapSummaryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        yourRole?: string;
        yourShiftTime?: string;
        yourDate?: string;
        colleagueName?: string;
        colleagueShiftTime?: string;
        colleagueDate?: string;
    }>();

    const yourRole = params.yourRole ?? 'Waiter';
    const yourShiftTime = params.yourShiftTime ?? '5:00 PM - 11:00 PM';
    const yourDate = params.yourDate ?? 'Oct 30';
    const colleagueName = params.colleagueName ?? 'Colleague';
    const colleagueShift = params.colleagueShiftTime ?? '9:00 AM - 5:00 PM';
    const colleagueDate = params.colleagueDate ?? 'Oct 30';

    const handleViewPending = () => {
        router.replace('/(employee)/swap/pending-requests' as any);
    };

    const handleBackToDashboard = () => {
        router.replace('/(employee)/schedule' as any);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F6FA" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Request a swap</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Success Icon */}
                <View style={styles.successCircle}>
                    <Ionicons name="checkmark" size={38} color="#FFFFFF" />
                </View>

                {/* Title */}
                <Text style={styles.successTitle}>Swap Request Sent</Text>
                <Text style={styles.successSubtitle}>
                    Your request to swap shift has been sent to your manager for approval. You'll be notified once it's confirmed
                </Text>

                {/* Swap Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryCardTitle}>Swap Summary</Text>

                    {/* Your Original Shift */}
                    <Text style={styles.summaryLabel}>Your Original Shift</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryIconWrap}>
                            <Ionicons name="calendar-outline" size={20} color="#555" />
                        </View>
                        <View>
                            <Text style={styles.summaryRole}>{yourRole}</Text>
                            <Text style={styles.summaryTime}>
                                {yourDate}, {yourShiftTime}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.summaryDivider} />

                    {/* Requested Shift From */}
                    <Text style={styles.summaryLabel}>Requested Shift From</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryIconWrap}>
                            <Ionicons name="person-circle-outline" size={22} color="#555" />
                        </View>
                        <View>
                            <Text style={styles.summaryRole}>{colleagueName}</Text>
                            <Text style={styles.summaryTime}>
                                {colleagueDate}, {colleagueShift}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity style={styles.primaryBtn} onPress={handleViewPending} activeOpacity={0.85}>
                    <Text style={styles.primaryBtnText}>View Pending Request</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={handleBackToDashboard} activeOpacity={0.85}>
                    <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PRIMARY = '#1373D0';

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 19,
        fontWeight: '600',
        color: '#111',
        textAlign: 'center',
        marginRight: 38,
    },

    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
    },

    // Success
    successCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111',
        marginBottom: 10,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
    },

    // Summary Card
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    summaryCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        textAlign: 'center',
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 10,
        fontWeight: '500',
        textAlign: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    summaryIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryRole: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
        marginBottom: 2,
    },
    summaryTime: {
        fontSize: 12,
        color: '#777',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 14,
    },

    // Buttons
    primaryBtn: {
        backgroundColor: PRIMARY,
        borderRadius: 10,
        paddingVertical: 16,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    secondaryBtn: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 16,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
    },
    secondaryBtnText: {
        color: PRIMARY,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});