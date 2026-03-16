// approved.tsx - Manager Approval Confirmation Screen
// Matches Column 2 from the design mockup

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ManagerApprovedScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        id: string;
        name: string;
        role: string;
        startDate: string;
        endDate: string;
    }>();

    const formatDateShort = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const firstName = params.name?.split(' ')[0] || 'Employee';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.mainContent}>
                {/* Tick Circle */}
                <View style={styles.checkCircle}>
                    <Text style={styles.checkIcon}>✓</Text>
                </View>

                {/* Title and Subtext */}
                <Text style={styles.title}>Leave Request Approves</Text>
                <Text style={styles.subtitle}>
                    {firstName}'s request to leave has been approved.
                </Text>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryHeader}>Summary</Text>

                    {/* Item 1: User */}
                    <View style={styles.summaryItem}>
                        <View style={styles.iconCircle}>
                            <Text style={{ fontSize: 20 }}>👤</Text>
                        </View>
                        <View>
                            <Text style={styles.itemName}>{params.name}</Text>
                            <Text style={styles.itemRole}>{params.role}</Text>
                        </View>
                    </View>

                    {/* Item 2: Date */}
                    <View style={styles.summaryItem}>
                        <View style={styles.iconCircle}>
                            <Text style={{ fontSize: 20 }}>📅</Text>
                        </View>
                        <Text style={styles.itemDates}>
                            {formatDateShort(params.startDate)} to {formatDateShort(params.endDate)}
                        </Text>
                    </View>
                </View>

                {/* Buttons */}
                <TouchableOpacity
                    style={styles.blueButton}
                    onPress={() => router.replace('/(manager)/leaveManagment')}
                >
                    <Text style={styles.blueButtonText}>View Pending Requests</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.grayButton}
                    onPress={() => router.replace('/(manager)/leaveManagment')}
                >
                    <Text style={styles.grayButtonText}>Back to Dashboard</Text>
                </TouchableOpacity>
            </View>


        </SafeAreaView>
    );
}

function NavItem({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) {
    return (
        <View style={styles.navItem}>
            <Text style={[styles.navIcon, active && { opacity: 1 }]}>{icon}</Text>
            <Text style={[styles.navLabel, active && styles.activeNavLabel]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    mainContent: { flex: 1, padding: 24, alignItems: 'center', paddingTop: 60 },
    checkCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2ecc71', justifyContent: 'center', alignItems: 'center', marginBottom: 24, elevation: 4 },
    checkIcon: { color: '#fff', fontSize: 50, fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 10 },
    subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 40 },
    summaryCard: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 30, borderWidth: 1, borderColor: '#f0f0f0', elevation: 2 },
    summaryHeader: { fontSize: 18, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 20 },
    summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f8f9fb', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#eee' },

    itemName: { fontSize: 16, fontWeight: '700' },
    itemRole: { fontSize: 13, color: '#888', marginTop: 2 },
    itemDates: { fontSize: 15, fontWeight: '600', color: '#333' },
    blueButton: { width: '100%', backgroundColor: '#1a73e8', borderRadius: 12, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
    blueButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    grayButton: { width: '100%', backgroundColor: '#f0f0f0', borderRadius: 12, paddingVertical: 18, alignItems: 'center' },
    grayButtonText: { color: '#888', fontSize: 16, fontWeight: '700' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: '#fff', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    navIcon: { fontSize: 20, opacity: 0.4 },
    navLabel: { fontSize: 10, color: '#888', marginTop: 4 },
    activeNavLabel: { color: '#000', fontWeight: '700' },
});
