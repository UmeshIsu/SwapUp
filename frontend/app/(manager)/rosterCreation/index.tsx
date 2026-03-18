import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Image,
    Dimensions,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function ManagerHomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="menu" size={28} color="#1a1a1a" />
                    <Text style={styles.companyName}>  Company name</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <Ionicons name="notifications" size={24} color="#1a1a1a" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={20} color="#fff" />
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Greeting */}
                <View style={styles.greetingSection}>
                    <Text style={styles.managerTitle}>Manager</Text>
                    <Text style={styles.greetingSubtitle}>Have a nice day</Text>
                </View>

                {/* Check In Button */}
                <TouchableOpacity style={styles.checkInButton} onPress={() => router.push('/(manager)/rosterCreation/checkin' as any)}>
                    <Text style={styles.checkInText}>Check in</Text>
                </TouchableOpacity>

                {/* Today's Shifts */}
                <Text style={styles.sectionTitle}>Today's Shifts</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Employees on Duty</Text>
                        <Text style={styles.statValue}>67</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Late Check-ins</Text>
                        <Text style={styles.statValue}>8</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Absentees</Text>
                        <Text style={styles.statValue}>1</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Shortages</Text>
                        <Text style={styles.statValue}>5</Text>
                    </View>
                </View>

                {/* Critical Alerts */}
                <Text style={styles.sectionTitle}>Critical Alerts</Text>
                <TouchableOpacity style={styles.alertCard}>
                    <View style={[styles.alertIcon, { backgroundColor: '#FDECE8' }]}>
                        <MaterialIcons name="schedule" size={22} color="#E53935" />
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Vihara nearing overtime</Text>
                        <Text style={styles.alertTime}>5 mins ago</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.alertCard}>
                    <View style={[styles.alertIcon, { backgroundColor: '#FFF8E1' }]}>
                        <Ionicons name="moon" size={20} color="#FBC02D" />
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Ashwin flagged for fatigue</Text>
                        <Text style={styles.alertTime}>1 hour ago</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
                </TouchableOpacity>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={styles.actionIcon}>
                            <MaterialCommunityIcons name="swap-horizontal" size={24} color="#1565C0" />
                        </View>
                        <Text style={styles.actionLabel}>Approve{'\n'}Swaps</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={styles.actionIcon}>
                            <MaterialIcons name="event-note" size={24} color="#1565C0" />
                        </View>
                        <Text style={styles.actionLabel}>Manage{'\n'}Leveas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={styles.actionIcon}>
                            <MaterialCommunityIcons name="bullhorn-outline" size={24} color="#1565C0" />
                        </View>
                        <Text style={styles.actionLabel}>Send{'\n'}Annoucments</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={styles.actionIcon}>
                            <MaterialIcons name="insert-chart-outlined" size={24} color="#1565C0" />
                        </View>
                        <Text style={styles.actionLabel}>View{'\n'}Analysis</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNavContainer}>
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={[styles.navItem, styles.navActive]}>
                        <View style={styles.activeIndicator} />
                        <Ionicons name="home" size={26} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(manager)/rosterCreation/schedule')}>
                        <MaterialIcons name="calendar-today" size={24} color="#9E9E9E" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <Ionicons name="people" size={26} color="#9E9E9E" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <Ionicons name="chatbubble-ellipses" size={26} color="#9E9E9E" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialCommunityIcons name="account-search-outline" size={28} color="#9E9E9E" />
                    </TouchableOpacity>
                </View>
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
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    companyName: { fontSize: 13, color: '#333', marginLeft: 4, fontWeight: '500' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    notificationBtn: { position: 'relative' },
    notificationDot: {
        position: 'absolute', top: 2, right: 3, width: 8, height: 8,
        backgroundColor: '#333', borderRadius: 4, borderWidth: 1.5, borderColor: '#FAFAFA'
    },
    avatar: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#90CAF9', justifyContent: 'center', alignItems: 'center',
    },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    greetingSection: { marginBottom: 15 },
    managerTitle: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', letterSpacing: -0.5 },
    greetingSubtitle: { fontSize: 13, color: '#666', marginTop: 2, fontWeight: '500' },
    checkInButton: {
        backgroundColor: '#1976D2', borderRadius: 12, paddingVertical: 16,
        alignItems: 'center', marginBottom: 25,
        shadowColor: '#1976D2', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    checkInText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 15 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 25 },
    statCard: {
        flex: 1, minWidth: '45%', backgroundColor: '#EEF2FF',
        borderRadius: 16, padding: 16,
    },
    statLabel: { fontSize: 12, color: '#555', fontWeight: '500', marginBottom: 10 },
    statValue: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
    alertCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF',
        borderRadius: 16, padding: 12, marginBottom: 12,
    },
    alertIcon: {
        width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    alertContent: { flex: 1 },
    alertTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
    alertTime: { fontSize: 12, color: '#888' },
    quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 20 },
    actionItem: { alignItems: 'center', width: '22%' },
    actionIcon: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#E3F2FD',
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    actionLabel: { fontSize: 11, color: '#333', textAlign: 'center', fontWeight: '500', lineHeight: 14 },
    bottomNavContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: -5 }, elevation: 15,
    },
    bottomNav: {
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        paddingVertical: 15, paddingHorizontal: 10,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    },
    navItem: { alignItems: 'center', justifyContent: 'center', height: 40, width: 50 },
    navActive: { position: 'relative' },
    activeIndicator: {
        position: 'absolute', backgroundColor: '#E3F2FD',
        width: 60, height: 60, borderRadius: 20, zIndex: -1,
    },
});
