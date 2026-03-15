import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    sentAt: string;
    isMe: boolean;
}

interface SwapRequestCard {
    id: string;
    requesterName: string;
    role: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

// ─── Mock data ─────────────────────────────────────────────────────────────────
// Swap card — loaded from GET /api/swap-requests/incoming (filtered by requestId)
const MOCK_SWAP_CARD: SwapRequestCard = {
    id: 'req_001',
    requesterName: 'Esala Gamage',
    role: 'Waiter',
    date: 'Tomorrow',
    startTime: '8:00PM',
    endTime: '11:00PM',
    status: 'PENDING',
};

// Messages — loaded from GET /api/chat/messages/:swapRequestId
const MOCK_MESSAGES: ChatMessage[] = [];

// ─── API hooks (replace mock data when backend is ready) ────────────────────────
// Accept:  PATCH /api/swap-requests/:id/respond  body: { action: 'ACCEPT' }
// Decline: PATCH /api/swap-requests/:id/respond  body: { action: 'REJECT' }
// Send msg: POST /api/chat/messages/:swapRequestId  body: { content }
// Load msgs: GET /api/chat/messages/:swapRequestId

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ChatDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        requestId?: string;
        name?: string;
        tab?: string;
    }>();

    // tab === 'swap'  →  show the swap request card (this is the Sent Swap Request tab)
    // tab === 'messages'  →  just show chat bubbles (regular messages tab)
    const isSwapThread = params.tab === 'swap';

    const [swapCard, setSwapCard] = useState<SwapRequestCard>(MOCK_SWAP_CARD);
    const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
    const [newMessage, setNewMessage] = useState('');

    const handleAccept = () => {
        // TODO: PATCH /api/swap-requests/:requestId/respond  { action: 'ACCEPT' }
        setSwapCard((prev) => ({ ...prev, status: 'ACCEPTED' }));
    };

    const handleDecline = () => {
        // TODO: PATCH /api/swap-requests/:requestId/respond  { action: 'REJECT' }
        setSwapCard((prev) => ({ ...prev, status: 'REJECTED' }));
    };

    const handleSend = () => {
        if (!newMessage.trim()) return;
        // TODO: POST /api/chat/messages/:requestId  { content: newMessage }
        const msg: ChatMessage = {
            id: Date.now().toString(),
            senderId: 'me',
            senderName: 'Me',
            content: newMessage.trim(),
            sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
        };
        setMessages((prev) => [...prev, msg]);
        setNewMessage('');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{params.name ?? 'Chat'}</Text>
                <TouchableOpacity style={styles.phoneBtn}>
                    <Ionicons name="call-outline" size={22} color="#111" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Swap Request Card — shown only on Sent Swap Request tab ── */}
                    {isSwapThread && swapCard.status === 'PENDING' && (
                        <View style={styles.swapCard}>
                            {/* Requester info */}
                            <View style={styles.swapCardHeader}>
                                <View style={styles.swapAvatar}>
                                    <Ionicons name="person" size={22} color="#3949AB" />
                                </View>
                                <View>
                                    <Text style={styles.swapRequesterName}>{swapCard.requesterName}</Text>
                                    <Text style={styles.swapSentText}>sent you a request</Text>
                                </View>
                            </View>

                            {/* Proposed shift */}
                            <View style={styles.shiftBox}>
                                <Text style={styles.proposedLabel}>Proposed Shift:</Text>
                                <View style={styles.shiftRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#555" />
                                    <View style={{ marginLeft: 8 }}>
                                        <Text style={styles.shiftRole}>{swapCard.role}</Text>
                                        <Text style={styles.shiftTime}>
                                            {swapCard.date}, {swapCard.startTime} - {swapCard.endTime}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Accept / Decline */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.declineBtn} onPress={handleDecline} activeOpacity={0.8}>
                                    <Text style={styles.declineBtnText}>Decline</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} activeOpacity={0.8}>
                                    <Text style={styles.acceptBtnText}>Accept</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Status banner after responding */}
                    {isSwapThread && swapCard.status !== 'PENDING' && (
                        <View style={[
                            styles.statusBanner,
                            swapCard.status === 'ACCEPTED' ? styles.statusAccepted : styles.statusRejected,
                        ]}>
                            <Ionicons
                                name={swapCard.status === 'ACCEPTED' ? 'checkmark-circle' : 'close-circle'}
                                size={16}
                                color="#FFF"
                            />
                            <Text style={styles.statusBannerText}>
                                {swapCard.status === 'ACCEPTED'
                                    ? 'Request accepted — sent to manager'
                                    : 'Request declined'}
                            </Text>
                        </View>
                    )}

                    {/* ── Chat messages ── */}
                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[styles.bubbleRow, msg.isMe ? styles.bubbleRowRight : styles.bubbleRowLeft]}
                        >
                            {!msg.isMe && (
                                <View style={styles.msgAvatar}>
                                    <Ionicons name="person" size={16} color="#777" />
                                </View>
                            )}
                            <View style={[styles.bubble, msg.isMe ? styles.bubbleMe : styles.bubbleOther]}>
                                <Text style={[styles.bubbleText, msg.isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
                                    {msg.content}
                                </Text>
                                <Text style={[styles.bubbleTime, msg.isMe ? styles.bubbleTimeMe : styles.bubbleTimeOther]}>
                                    {msg.sentAt}
                                </Text>
                            </View>
                            {msg.isMe && (
                                <View style={styles.msgAvatar}>
                                    <Ionicons name="person" size={16} color="#777" />
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>

                {/* Message input */}
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#BBB"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.8}>
                        <Ionicons name="send" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const PRIMARY = '#1373D0';

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: { padding: 4, marginRight: 8 },
    headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#111', textAlign: 'center' },
    phoneBtn: { padding: 4 },

    scrollContent: { padding: 16, paddingBottom: 8 },

    // ── Swap Request Card ──
    swapCard: {
        backgroundColor: '#F9F9F9',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ECECEC',
    },
    swapCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
    },
    swapAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#D1D9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    swapRequesterName: { fontSize: 15, fontWeight: '700', color: '#111' },
    swapSentText: { fontSize: 12, color: '#888', marginTop: 1 },

    shiftBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#ECECEC',
    },
    proposedLabel: { fontSize: 12, color: '#888', marginBottom: 8 },
    shiftRow: { flexDirection: 'row', alignItems: 'flex-start' },
    shiftRole: { fontSize: 14, fontWeight: '700', color: '#111' },
    shiftTime: { fontSize: 12, color: '#666', marginTop: 2 },

    actionRow: { flexDirection: 'row', gap: 12 },
    declineBtn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#E53935',
        alignItems: 'center',
    },
    declineBtnText: { color: '#E53935', fontWeight: '700', fontSize: 14 },
    acceptBtn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 8,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
    },
    acceptBtnText: { color: '#2E7D32', fontWeight: '700', fontSize: 14 },

    // Status banner
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    statusAccepted: { backgroundColor: '#2E7D32' },
    statusRejected: { backgroundColor: '#C62828' },
    statusBannerText: { color: '#FFF', fontWeight: '600', fontSize: 13 },

    // ── Chat Bubbles ──
    bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
    bubbleRowLeft: { justifyContent: 'flex-start' },
    bubbleRowRight: { justifyContent: 'flex-end' },

    msgAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },

    bubble: {
        maxWidth: '72%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    bubbleMe: { backgroundColor: PRIMARY, borderBottomRightRadius: 4 },
    bubbleOther: { backgroundColor: '#F0F0F0', borderBottomLeftRadius: 4 },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextMe: { color: '#FFF' },
    bubbleTextOther: { color: '#111' },
    bubbleTime: { fontSize: 10, marginTop: 4 },
    bubbleTimeMe: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
    bubbleTimeOther: { color: '#AAA' },

    // Input bar
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: 10,
        backgroundColor: '#FFF',
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        color: '#333',
        maxHeight: 100,
    },
    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
