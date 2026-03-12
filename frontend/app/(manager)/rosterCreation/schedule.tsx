import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ScheduleScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Schedule</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Empty State */}
            <View style={styles.body}>
                <View style={styles.noEntryCard}>
                    <Text style={styles.noEntryText}>No Entry</Text>
                </View>

                {/* + New Button */}
                <TouchableOpacity
                    style={styles.newButton}
                    onPress={() => router.push('/(manager)/rosterCreation/week-select')}
                >
                    <Text style={styles.newButtonText}>+ New</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Nav */}
            <View style={styles.bottomNavContainer}>
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(manager)/rosterCreation')}>
                        <Ionicons name="home" size={26} color="#9E9E9E" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navItem, styles.navActive]}>
                        <View style={styles.activeIndicator} />
                        <MaterialIcons name="calendar-today" size={24} color="#000" />
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
    backButton: { width: 40 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
    headerRight: { width: 40 },
    body: { flex: 1, paddingHorizontal: 20, paddingTop: 30 },
    noEntryCard: {
        backgroundColor: '#F3F4F6', borderRadius: 16,
        paddingVertical: 35, alignItems: 'center', marginBottom: 20,
    },
    noEntryText: { fontSize: 15, color: '#333', fontWeight: '600' },
    newButton: {
        backgroundColor: '#1976D2', borderRadius: 12,
        paddingVertical: 16, alignItems: 'center',
        shadowColor: '#1976D2', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    newButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
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
