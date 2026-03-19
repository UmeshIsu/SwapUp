// index.tsx - Manager Leave Management Screen
// Matches Column 1, 3, and 4 from the design mockup

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getManagerLeaveRequests, approveLeaveRequest, declineLeaveRequest, LeaveRequest } from '@/src/services/leaveApi';
import { useAuth } from '@/src/contexts/AuthContext';

type Tab = 'Pending' | 'Approved' | 'Declined';

export default function ManagerLeaveDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const MANAGER_ID = user?.id || '';
    const [activeTab, setActiveTab] = useState<Tab>('Pending');
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getManagerLeaveRequests(MANAGER_ID);
            setRequests(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        // Format for mockup: "25th November 2025"
        const day = d.getDate();
        const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor(day % 100 / 10) === 1) ? 0 : day % 10];
        const month = d.toLocaleDateString('en-US', { month: 'long' });
        const year = d.getFullYear();
        return `${day}${suffix} ${month} ${year}`;
    };

    const filteredRequests = requests.filter((r) => r.status === activeTab.toLowerCase());

    const handleAccept = async (request: LeaveRequest) => {
        try {
            await approveLeaveRequest(request.id);

            // Navigate to confirmation screen
            router.push({
                pathname: '/(manager)/leaveManagment/approved',
                params: {
                    id: request.id,
                    name: request.employee_name,
                    role: request.employee_role || 'Waiter',
                    startDate: request.startDate,
                    endDate: request.endDate,
                }
            } as any);
        } catch (error) {
            console.error('Approval failed:', error);
        }
    };

    const handleDecline = async (request: LeaveRequest) => {
        try {
            await declineLeaveRequest(request.id);
            // Refresh the list so the card moves to the Declined tab
            loadData();
        } catch (error) {
            console.error('Decline failed:', error);
            // Local fallback so the UI feels responsive even if offline
            setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'declined' } : r));
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Leave Requests</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {(['Pending', 'Approved', 'Declined'] as Tab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            <ScrollView contentContainerStyle={styles.content}>
                {filteredRequests.length === 0 ? (
                    <Text style={styles.emptyText}>No {activeTab.toLowerCase()} requests</Text>
                ) : (
                    filteredRequests.map((request) => (
                        <View key={request.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.avatar}>
                                    <Text style={{ fontSize: 24 }}>👤</Text>
                                </View>
                                <View>
                                    <Text style={styles.employeeName}>{request.employee_name}</Text>
                                    <Text style={styles.sentSubtext}>sent a leave request</Text>
                                </View>
                            </View>

                            <View style={styles.innerBox}>
                                <View style={styles.innerIcon}>
                                    <Text style={{ fontSize: 18 }}>📋</Text>
                                </View>
                                <View>
                                    <Text style={styles.roleText}>{request.employee_role || 'Waiter'}</Text>
                                    <Text style={styles.dateText}>{formatDate(request.startDate)}</Text>
                                </View>
                            </View>

                            {activeTab === 'Pending' ? (
                                <View style={styles.btnRow}>
                                    <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(request)}>
                                        <Text style={styles.declineBtnText}>Decline</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(request)}>
                                        <Text style={styles.acceptBtnText}>Accept</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={[
                                    styles.statusBanner,
                                    activeTab === 'Approved' ? styles.approvedBanner : styles.declinedBanner
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        activeTab === 'Approved' ? styles.approvedText : styles.declinedText
                                    ]}>
                                        {activeTab === 'Approved' ? 'Approved' : 'Declined'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fb' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    backButton: { padding: 8 },
    backArrow: { fontSize: 24, fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#1a73e8' },
    tabText: { fontSize: 14, color: '#888', fontWeight: '600' },
    activeTabText: { color: '#1a73e8' },
    content: { padding: 16, paddingBottom: 100 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e3f2fd', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    employeeName: { fontSize: 15, fontWeight: '700' },
    sentSubtext: { fontSize: 12, color: '#888', marginTop: 2 },
    innerBox: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    innerIcon: { marginRight: 12, opacity: 0.5 },
    roleText: { fontSize: 13, fontWeight: '600', color: '#444' },
    dateText: { fontSize: 12, color: '#777', marginTop: 2 },
    btnRow: { flexDirection: 'row', gap: 12 },
    declineBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ffcdd2', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
    declineBtnText: { color: '#ef5350', fontSize: 13, fontWeight: '700' },
    acceptBtn: { flex: 1, backgroundColor: '#c8e6c9', borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
    acceptBtnText: { color: '#2e7d32', fontSize: 13, fontWeight: '700' },
    statusBanner: { width: '100%', borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
    approvedBanner: { backgroundColor: '#c8e6c9' },
    declinedBanner: { backgroundColor: '#ffcdd2' },
    statusText: { fontSize: 13, fontWeight: '700' },
    approvedText: { color: '#2e7d32' },
    declinedText: { color: '#c62828' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#aaa' },
});
