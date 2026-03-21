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
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

export default function ManagerScheduleScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft} />
                <Text style={[styles.headerTitle, { color: theme.text }]}>Schedule</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Empty State */}
            <View style={styles.body}>
                <View style={[styles.noEntryCard, { backgroundColor: theme.surface }]}>
                    <Ionicons name="calendar-outline" size={48} color={theme.textMuted} style={{ marginBottom: 10 }} />
                    <Text style={[styles.noEntryText, { color: theme.text }]}>No Entry</Text>
                    <Text style={[styles.noEntrySubtext, { color: theme.textMuted }]}>Create a new roster to get started</Text>
                </View>

                {/* + New Button */}
                <TouchableOpacity
                    style={[styles.newButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/(manager)/rosterCreation/week-select' as any)}
                >
                    <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.newButtonText}>New</Text>
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
    headerLeft: { width: 40 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
    headerRight: { width: 40 },
    body: { flex: 1, paddingHorizontal: 20, paddingTop: 30 },
    noEntryCard: {
        backgroundColor: '#F3F4F6', borderRadius: 16,
        paddingVertical: 35, alignItems: 'center', marginBottom: 20,
    },
    noEntryText: { fontSize: 15, color: '#333', fontWeight: '600' },
    noEntrySubtext: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
    newButton: {
        flexDirection: 'row',
        backgroundColor: '#1976D2', borderRadius: 12,
        paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#1976D2', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    newButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
