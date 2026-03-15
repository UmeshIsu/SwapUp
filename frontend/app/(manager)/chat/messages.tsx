import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SwapApprovalCard {
    id: string;
    requesterName: string;        // "Esala Gamage"
    wantsToSwapWith: string;      // "Umesh"
    timeAgo: string;              // "2h ago"
    theirShift: string;           // "Waiter, Mon, Nov 23, 9:00-15:00"
    requestedShift: string;       // "Waiter, Wed, Nov 25, 9:00-15:00"
    managerStatus: 'AWAITING' | 'APPROVED' | 'DENIED';
}

// ─── Mock data ─────────────────────────────────────────────────────────────────
// API: GET /api/swap-requests/manager-queue
const MOCK_PENDING: SwapApprovalCard[] = [
    {
        id: 'req_001',
        requesterName: 'Esala Gamage',
        wantsToSwapWith: 'Umesh',
        timeAgo: '2h ago',
        theirShift: 'Waiter, Mon, Nov 23, 9:00-15:00',
        requestedShift: 'Waiter, Wed, Nov 25, 9:00-15:00',
        managerStatus: 'AWAITING',
    },
    {
        id: 'req_002',
        requesterName: 'Vihara Senanayake',
        wantsToSwapWith: 'Ashwin',
        timeAgo: '3h ago',
        theirShift: 'Waiter, Mon, Nov 24, 9:00-15:00',
        requestedShift: 'Waiter, Wed, Nov 26, 9:00-15:00',
        managerStatus: 'AWAITING',
    },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ManagerMessagesScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'messages' | 'swap'>('swap');
    const [cards, setCards] = useState<SwapApprovalCard[]>(MOCK_PENDING);

    // When backend is ready:
    // GET /api/swap-requests/manager-queue → all ACCEPTED + managerStatus=AWAITING requests
    // PATCH /api/swap-requests/:id/manager-respond  body: { action: 'APPROVED' | 'DENIED' }

    const handleApprove = (id: string) => {
        // TODO: PATCH /api/swap-requests/:id/manager-respond  { action: 'APPROVED' }
        setCards((prev) =>
            prev.map((c) => (c.id === id ? { ...c, managerStatus: 'APPROVED' } : c))
        );
    };

    const handleDecline = (id: string) => {
        // TODO: PATCH /api/swap-requests/:id/manager-respond  { action: 'DENIED' }
        setCards((prev) =>
            prev.map((c) => (c.id === id ? { ...c, managerStatus: 'DENIED' } : c))
        );
    };

    const pendingCards = cards.filter((c) => c.managerStatus === 'AWAITING');
    const decidedCards = cards.filter((c) => c.managerStatus !== 'AWAITING');

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('messages')}>
                    <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
                        Messages
                    </Text>
                    {activeTab === 'messages' && <View style={styles.tabUnderline} />}
                </TouchableOpacity>

                <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('swap')}>
                    <Text style={[styles.tabText, activeTab === 'swap' && styles.tabTextActive]}>
                        Sent Swap Request
                    </Text>
                    {activeTab === 'swap' && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
            </View>

            {activeTab === 'messages' ? (
                /* ── Messages Tab (placeholder) ── */
                <View style={styles.emptyState}>
                    <Ionicons name="chatbubbles-outline" size={48} color="#DDD" />
                    <Text style={styles.emptyText}>No messages yet.</Text>
                </View>
            ) : (
                /* ── Sent Swap Request Tab: Approval Cards ── */
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {pendingCards.length === 0 && decidedCards.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="checkmark-circle-outline" size={48} color="#DDD" />
                            <Text style={styles.emptyText}>No pending swap requests.</Text>
                        </View>
                    )}

                    {/* Pending cards */}
                    {pendingCards.map((card) => (
                        <SwapCard
                            key={card.id}
                            card={card}
                            onApprove={() => handleApprove(card.id)}
                            onDecline={() => handleDecline(card.id)}
                        />
                    ))}

                    {/* Decided cards (greyed out) */}
                    {decidedCards.map((card) => (
                        <SwapCard
                            key={card.id}
                            card={card}
                            onApprove={() => { }}
                            onDecline={() => { }}
                        />
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// ─── Swap Card Sub-component ────────────────────────────────────────────────────
function SwapCard({
    card,
    onApprove,
    onDecline,
}: {
    card: SwapApprovalCard;
    onApprove: () => void;
    onDecline: () => void;
}) {
    const decided = card.managerStatus !== 'AWAITING';

    return (
        <View style={[styles.card, decided && styles.cardDecided]}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
                <View style={styles.cardAvatar}>
                    <Ionicons name="person" size={22} color="#3949AB" />
                </View>
                <View style={styles.cardHeaderText}>
                    <Text style={styles.cardName}>{card.requesterName}</Text>
                    <Text style={styles.cardSubtitle}>
                        wants to swap with{' '}
                        <Text style={styles.cardSubtitleBold}>{card.wantsToSwapWith}</Text>
                    </Text>
                </View>
                <Text style={styles.cardTime}>{card.timeAgo}</Text>
            </View>

            {/* Shift info */}
            <View style={styles.shiftBox}>
                <Text style={styles.shiftBoxLabel}>Requested Shift:</Text>
                <View style={styles.shiftRow}>
                    <Ionicons name="calendar-outline" size={15} color="#666" />
                    <View style={styles.shiftTexts}>
                        <Text style={styles.shiftLine}>Their Shift: {card.theirShift}</Text>
                        <Text style={styles.shiftLine}>Requested Shift: {card.requestedShift}</Text>
                    </View>
                </View>
            </View>

            {/* Status banner if already decided */}
            {decided && (
                <View style={[
                    styles.statusBanner,
                    card.managerStatus === 'APPROVED' ? styles.statusApproved : styles.statusDenied,
                ]}>
                    <Ionicons
                        name={card.managerStatus === 'APPROVED' ? 'checkmark-circle' : 'close-circle'}
                        size={14}
                        color="#FFF"
                    />
                    <Text style={styles.statusBannerText}>
                        {card.managerStatus === 'APPROVED' ? 'Swap Approved' : 'Swap Denied'}
                    </Text>
                </View>
            )}

            {/* Action buttons (hidden if decided) */}
            {!decided && (
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.declineBtn}
                        onPress={onDecline}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.declineBtnText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={onApprove}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const PRIMARY = '#1373D0';

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: { padding: 4 },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        textAlign: 'center',
    },

    // Tabs
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
    },
    tabTextActive: { color: PRIMARY },
    tabUnderline: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
        height: 2.5,
        backgroundColor: PRIMARY,
        borderRadius: 2,
    },

    scrollContent: {
        padding: 16,
        paddingBottom: 40,
        gap: 12,
    },

    // Empty state
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#BBB',
    },

    // ── Swap Approval Card ──
    card: {
        backgroundColor: '#F7F7F7',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EBEBEB',
    },
    cardDecided: {
        opacity: 0.65,
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 14,
    },
    cardAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#D1D9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardHeaderText: { flex: 1 },
    cardName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#777',
    },
    cardSubtitleBold: {
        fontWeight: '700',
        color: '#555',
    },
    cardTime: {
        fontSize: 11,
        color: '#AAA',
        marginTop: 2,
    },

    // Shift box
    shiftBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    shiftBoxLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
        fontWeight: '500',
    },
    shiftRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    shiftTexts: { flex: 1 },
    shiftLine: {
        fontSize: 12,
        color: '#444',
        lineHeight: 20,
    },

    // Status banner
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 4,
    },
    statusApproved: { backgroundColor: '#2E7D32' },
    statusDenied: { backgroundColor: '#C62828' },
    statusBannerText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 13,
    },

    // Buttons
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    declineBtn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 8,
        backgroundColor: '#FFEAEA',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    declineBtnText: {
        color: '#E53935',
        fontWeight: '700',
        fontSize: 14,
    },
    approveBtn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 8,
        backgroundColor: PRIMARY,
        alignItems: 'center',
    },
    approveBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
});
