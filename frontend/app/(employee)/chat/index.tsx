import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Image, ActivityIndicator, SafeAreaView, RefreshControl, Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { getConversations } from '@/src/services/chatService';
import { getIncomingSwapRequests, getMySwapRequests, respondToSwapRequest } from '@/src/services/swapService';
import type { Conversation } from '@/src/services/chatService';
import type { IncomingSwapRequest, MySwapRequest } from '@/src/services/swapService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (iso: string) => {
    const d = new Date(iso), h = d.getHours() % 12 || 12;
    return `${h}.${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
};

const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({ uri, size = 46, color }: { uri?: string | null; size?: number; color?: string }) =>
    uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
    ) : (
        <View style={[S.avatarFb, { width: size, height: size, borderRadius: size / 2, backgroundColor: color || '#D1D5DB' }]}>
            <Ionicons name="person" size={size * 0.45} color="#FFF" />
        </View>
    );

// ─── Conversation Row ─────────────────────────────────────────────────────────

function ConvoRow({ item, onPress }: { item: Conversation; onPress: () => void }) {
    return (
        <TouchableOpacity style={S.row} onPress={onPress} activeOpacity={0.7}>
            <Avatar uri={item.participantAvatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={S.name}>{item.participantName}</Text>
                <Text style={S.sub} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text style={S.time}>{fmt(item.lastMessageTime)}</Text>
        </TouchableOpacity>
    );
}

// ─── Incoming Swap Card (Accept/Decline) ──────────────────────────────────────

function IncomingSwapCard({ item, onRespond }: { item: IncomingSwapRequest; onRespond: (id: string, action: 'ACCEPT' | 'REJECT') => void }) {
    const isResponded = item.status !== 'PENDING';

    return (
        <View style={S.swapCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Avatar uri={null} size={42} color="#3949AB" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={S.name}>{item.requester.name}</Text>
                    <Text style={S.sub}>wants to swap with you</Text>
                </View>
                <Text style={S.time}>{timeAgo(item.createdAt)}</Text>
            </View>

            <View style={S.shiftBox}>
                <Text style={S.shiftLbl}>Requested Shift:</Text>
                {item.myShift && (
                    <Text style={S.shiftTxt}>📅 Your Shift: {item.myShift.date.split('T')[0]} {item.myShift.startTime.substring(11, 16)} - {item.myShift.endTime.substring(11, 16)}</Text>
                )}
                {item.proposedShift && (
                    <Text style={S.shiftTxt}>📅 Proposed Shift: {item.proposedShift.date.split('T')[0]} {item.proposedShift.startTime.substring(11, 16)} - {item.proposedShift.endTime.substring(11, 16)}</Text>
                )}
            </View>

            {!isResponded ? (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity
                        style={S.declineBtn}
                        onPress={() => onRespond(item.id, 'REJECT')}
                        activeOpacity={0.8}
                    >
                        <Text style={S.declineBtnText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={S.acceptBtn}
                        onPress={() => onRespond(item.id, 'ACCEPT')}
                        activeOpacity={0.8}
                    >
                        <Text style={S.acceptBtnText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={[S.statusBadge, item.status.includes('ACCEPTED') ? S.statusAccepted : S.statusDeclined]}>
                    <Text style={S.statusBadgeText}>
                        {item.status.includes('ACCEPTED') ? '✓ Accepted — Sent to Manager' : '✕ Declined'}
                    </Text>
                </View>
            )}
        </View>
    );
}

// ─── Sent Swap Row (Matches Screenshot Design) ──────────────────────────────────────────────

const formatDateSpec = (dateStr: string, start: string, end: string, role: string = 'Waiter') => {
    try {
        const d = new Date(dateStr);
        const day = d.toLocaleDateString('en-US', { weekday: 'short' });
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const date = d.getDate();
        
        const formatTime = (iso: string) => {
            const time = new Date(iso);
            return `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`;
        };
        
        return `${role}, ${day}, ${month} ${date}, ${formatTime(start)}-${formatTime(end)}`;
    } catch {
        return dateStr;
    }
};

function SentSwapRow({ item }: { item: MySwapRequest }) {
    const targetName = item.target?.name || 'Colleague';
    
    let reqShiftStr = '';
    let tgtShiftStr = '';
    if (item.requesterShift) {
        reqShiftStr = formatDateSpec(item.requesterShift.date, item.requesterShift.startTime, item.requesterShift.endTime);
    }
    if (item.targetShift) {
        tgtShiftStr = formatDateSpec(item.targetShift.date, item.targetShift.startTime, item.targetShift.endTime);
    }

    return (
        <View style={S.swapCardDesign}>
            <View style={S.swapCardHeader}>
                <Avatar uri={null} size={42} color="#C9DDFA" />
                <View style={S.swapCardHeaderTextWrapper}>
                    <Text style={S.swapCardName}>{targetName}</Text>
                    <Text style={S.swapCardSub}>You want to swap with {targetName}</Text>
                </View>
                <Text style={S.swapCardTime}>{timeAgo(item.createdAt)}</Text>
            </View>

            <View style={S.swapCardBody}>
                <Text style={S.swapCardBodyTitle}>Requested Shift:</Text>
                <View style={S.swapCardBodyContent}>
                    <Ionicons name="calendar-outline" size={24} color="#666" style={S.swapCardBodyIcon} />
                    <View style={S.swapCardBodyTextCol}>
                        <Text style={[S.swapCardBodyText, { marginBottom: 8 }]}>Their Shift: {tgtShiftStr}</Text>
                        <Text style={S.swapCardBodyText}>Requested Shift: {reqShiftStr}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}


// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const userId = user?.id ?? '';
    const insets = useSafeAreaInsets();

    const [tab, setTab] = useState<'msg' | 'incoming' | 'sent'>('msg');
    const [convos, setConvos] = useState<Conversation[]>([]);
    const [incomingSwaps, setIncomingSwaps] = useState<IncomingSwapRequest[]>([]);
    const [sentSwaps, setSentSwaps] = useState<MySwapRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        if (!userId) return;
        try {
            const [c, incoming, sent] = await Promise.all([
                getConversations(userId),
                getIncomingSwapRequests(),
                getMySwapRequests(),
            ]);
            console.log('DEBUG CHAT LOAD - userId:', userId);
            console.log('DEBUG INCOMING:', incoming);
            console.log('DEBUG SENT:', sent);
            setConvos(Array.isArray(c) ? c : []);
            setIncomingSwaps(Array.isArray(incoming) ? incoming : []);
            setSentSwaps(Array.isArray(sent) ? sent : []);
        } catch (e) {
            console.error('Failed to load chat data:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    const handleSwapRespond = async (swapId: string, action: 'ACCEPT' | 'REJECT') => {
        try {
            await respondToSwapRequest(swapId, action);
            
            // Map the frontend ACCEPT/REJECT to backend status string
            const newStatus = action === 'ACCEPT' ? 'ACCEPTED_BY_EMPLOYEE' : 'DECLINED_BY_EMPLOYEE';
            
            // Update local state
            setIncomingSwaps(prev =>
                prev.map(s => s.id === swapId ? { ...s, status: newStatus } : s)
            );
            Alert.alert(
                'Success',
                action === 'ACCEPT'
                    ? 'Swap request accepted! Sent to manager for approval.'
                    : 'Swap request declined.'
            );
        } catch (err: any) {
            console.error('Failed to respond to swap:', err);
            Alert.alert('Error', err.message || 'Failed to respond to swap request');
        }
    };

    const tabs: { key: 'msg' | 'incoming' | 'sent'; label: string }[] = [
        { key: 'msg', label: 'Messages' },
        { key: 'incoming', label: 'Swap Requests' },
        { key: 'sent', label: 'Sent Requests' },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={[S.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                    <Ionicons name="arrow-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={S.headerTitle}>Messages</Text>
                <View style={{ width: 30 }} />
            </View>

            <View style={S.tabBar}>
                {tabs.map((t) => (
                    <TouchableOpacity
                        key={t.key}
                        style={[S.tab, tab === t.key && S.tabOn]}
                        onPress={() => setTab(t.key)}
                    >
                        <Text style={[S.tabTxt, tab === t.key && { color: '#2563EB' }]}>{t.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} color="#2563EB" size="large" />
            ) : tab === 'msg' ? (
                <FlatList
                    data={convos}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => (
                        <ConvoRow
                            item={item}
                            onPress={() =>
                                router.push({
                                    pathname: '/(employee)/chat/[conversationId]' as any,
                                    params: {
                                        conversationId: item.id,
                                        participantName: item.participantName,
                                        participantAvatar: item.participantAvatar ?? '',
                                    },
                                })
                            }
                        />
                    )}
                    ItemSeparatorComponent={() => <View style={S.sep} />}
                    ListEmptyComponent={<Text style={S.empty}>No messages yet</Text>}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); load(); }}
                            tintColor="#2563EB"
                        />
                    }
                />
            ) : tab === 'incoming' ? (
                <FlatList
                    data={incomingSwaps}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => (
                        <IncomingSwapCard item={item} onRespond={handleSwapRespond} />
                    )}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={<Text style={S.empty}>No incoming swap requests</Text>}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); load(); }}
                            tintColor="#2563EB"
                        />
                    }
                />
            ) : (
                <FlatList
                    data={sentSwaps}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => <SentSwapRow item={item} />}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={<Text style={S.empty}>No swap requests sent</Text>}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); load(); }}
                            tintColor="#2563EB"
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 14,
    },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center' },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabOn: { borderBottomColor: '#2563EB' },
    tabTxt: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    name: { fontSize: 15, fontWeight: '700', color: '#111' },
    sub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    time: { fontSize: 12, color: '#9CA3AF', marginLeft: 8 },
    sep: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 74 },
    avatarFb: { alignItems: 'center', justifyContent: 'center' },
    empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 80 },

    // Swap card
    swapCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    shiftBox: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    shiftLbl: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
    shiftTxt: { fontSize: 12, color: '#374151', marginTop: 3 },
    badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, alignItems: 'center' },

    // Sent Swap Card Design (New)
    swapCardDesign: {
        backgroundColor: '#F3F4F6',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    swapCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    swapCardHeaderTextWrapper: {
        flex: 1,
        marginLeft: 12,
    },
    swapCardName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
    },
    swapCardSub: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    swapCardTime: {
        fontSize: 13,
        color: '#6B7280',
    },
    swapCardBody: {
        backgroundColor: '#E5E7EB',
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    swapCardBodyTitle: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
    swapCardBodyContent: {
        flexDirection: 'row',
    },
    swapCardBodyIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    swapCardBodyTextCol: {
        flex: 1,
    },
    swapCardBodyText: {
        fontSize: 13,
        color: '#111',
        lineHeight: 20,
    },


    // Accept / Decline buttons
    declineBtn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#EF4444',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
    },
    declineBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
    acceptBtn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 8,
        backgroundColor: '#2563EB',
        alignItems: 'center',
    },
    acceptBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

    // Status badge (after responding)
    statusBadge: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    statusAccepted: { backgroundColor: '#D1FAE5' },
    statusDeclined: { backgroundColor: '#FEE2E2' },
    statusBadgeText: { fontWeight: '600', fontSize: 13, color: '#374151' },
});
