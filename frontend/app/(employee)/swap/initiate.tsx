import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShiftSlot {
    id: string;
    time: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ROLE = 'Waiter';

const MOCK_SHIFTS: ShiftSlot[] = [
    { id: '1', time: '01:00 - 02:00 AM' },
    { id: '2', time: '02:00 - 03:00 AM' },
    { id: '3', time: '03:00 - 04:00 AM' },
    { id: '4', time: '04:00 - 05:00 AM' },
    { id: '5', time: '05:00 - 06:00 AM' },
    { id: '6', time: '06:00 - 07:00 AM' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function InitiateSwapScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ date?: string }>();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedShift, setSelectedShift] = useState<ShiftSlot | null>(null);
    const [reason, setReason] = useState('');

    const handleSwapPress = (shift: ShiftSlot) => {
        setSelectedShift(shift);
        setReason('');
        setModalVisible(true);
    };

    const handleFindColleagues = () => {
        if (!selectedShift) return;
        setModalVisible(false);
        router.push({
            pathname: '/(employee)/swap/find-colleague',
            params: {
                shiftId: selectedShift.id,
                shiftTime: selectedShift.time,
                role: MOCK_ROLE,
                reason: reason.trim(),
                date: params.date ?? 'Tuesday, 30 October',
            },
        });
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Request a swap</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Page title */}
                <Text style={styles.pageTitle}>Initiate Shift Swap</Text>
                <Text style={styles.pageSubtitle}>Select your shift and a colleague to swap with.</Text>

                {/* Your Role */}
                <Text style={styles.sectionLabel}>Your Role</Text>
                <View style={styles.roleCard}>
                    <View style={styles.roleIconWrap}>
                        <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#555" />
                    </View>
                    <View>
                        <Text style={styles.roleName}>{MOCK_ROLE}</Text>
                        <Text style={styles.roleHint}>Only {MOCK_ROLE.toLowerCase()}s can be select to swap</Text>
                    </View>
                </View>

                {/* Your Schedule */}
                <Text style={styles.sectionLabel}>Your Schedule</Text>
                <View style={styles.scheduleCard}>
                    {MOCK_SHIFTS.map((shift, index) => (
                        <View key={shift.id}>
                            <View style={styles.shiftRow}>
                                <Text style={styles.shiftTime}>{shift.time}</Text>
                                <TouchableOpacity
                                    style={styles.swapBtn}
                                    onPress={() => handleSwapPress(shift)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.swapBtnText}>Swap</Text>
                                </TouchableOpacity>
                            </View>
                            {index < MOCK_SHIFTS.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* ─── Request Swap Modal ────────────────────────────────────────────── */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', alignItems: 'center', paddingHorizontal: 24 }}>
                        <View style={styles.modalCard}>
                            {/* Close */}
                            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={16} color="#FFF" />
                            </TouchableOpacity>

                            <Text style={styles.modalTitle}>Request  Swap</Text>

                            {/* Question icon */}
                            <View style={styles.questionCircle}>
                                <Text style={styles.questionMark}>?</Text>
                            </View>

                            {/* Reason input */}
                            <TextInput
                                style={styles.reasonInput}
                                placeholder="Why do you want to Swap ?"
                                placeholderTextColor="#BBBBBB"
                                multiline
                                value={reason}
                                onChangeText={setReason}
                                textAlignVertical="top"
                            />

                            {/* Find Colleagues button */}
                            <TouchableOpacity
                                style={styles.findBtn}
                                onPress={handleFindColleagues}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.findBtnText}>Find Collogues</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
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
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        fontSize: 19,
        fontWeight: '600',
        color: '#111',
        textAlign: 'center',
        marginRight: 38,
    },

    // Scroll
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    // Page title
    pageTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111',
        marginBottom: 4,
    },
    pageSubtitle: {
        fontSize: 13,
        color: '#888',
        marginBottom: 24,
    },

    // Section label
    sectionLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        marginBottom: 10,
    },

    // Role card
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEEEEE',
        borderRadius: 10,
        padding: 14,
        marginBottom: 28,
        gap: 12,
    },
    roleIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#DDDDDD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },
    roleHint: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },

    // Schedule card
    scheduleCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    shiftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    shiftTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },
    swapBtn: {
        backgroundColor: PRIMARY,
        borderRadius: 6,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    swapBtnText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 28,
        paddingTop: 28,
        paddingBottom: 28,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 10,
    },
    modalCloseBtn: {
        position: 'absolute',
        top: -12,
        right: -12,
        backgroundColor: '#E53935',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E53935',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
        marginBottom: 20,
        letterSpacing: 0.2,
    },
    questionCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2.5,
        borderColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    questionMark: {
        fontSize: 28,
        fontWeight: '700',
        color: PRIMARY,
    },
    reasonInput: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 14,
        minHeight: 80,
        fontSize: 14,
        color: '#333',
        marginBottom: 20,
    },
    findBtn: {
        backgroundColor: PRIMARY,
        borderRadius: 30,
        paddingHorizontal: 36,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
    },
    findBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});