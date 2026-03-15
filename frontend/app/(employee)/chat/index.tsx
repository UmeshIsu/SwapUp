import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Image, ActivityIndicator, SafeAreaView, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getConversations, getSentSwapRequests } from '@/src/services/chatService';

const USER_ID = '1'; // TODO: replace with your auth context user ID

const fmt = (iso: string) => {
    const d = new Date(iso), h = d.getHours() % 12 || 12;
    return `${h}.${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
};

const Avatar = ({ uri, size = 46 }: { uri?: string; size?: number }) =>
    uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
    ) : (
        <View style={[S.avatarFb, { width: size, height: size, borderRadius: size / 2 }]} />
    );

function ConvoRow({ item, onPress }: any) {
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

function SwapRow({ item }: any) {
    return (
        <View style={S.swapCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Avatar uri={item.recipientAvatar} size={38} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={S.name}>{item.recipientName}</Text>
                    <Text style={S.sub}>wants to swap with you</Text>
                </View>
                <Text style={S.time}>{fmt(item.createdAt)}</Text>
            </View>
            <View style={S.shiftBox}>
                <Text style={S.shiftLbl}>Requested Shift:</Text>
                <Text style={S.shiftTxt}>📅 Their Shift: {item.theirShift}</Text>
                <Text style={S.shiftTxt}>📅 Requested: {item.requestedShift}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <View style={[S.badge, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 13 }}>{item.status}</Text>
                </View>
            </View>
        </View>
    );
}

export default function ChatInbox() {
    const router = useRouter();
    const [tab, setTab] = useState<'msg' | 'swap'>('msg');
    const [convos, setConvos] = useState<any[]>([]);
    const [swaps, setSwaps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const [c, s] = await Promise.all([
                getConversations(USER_ID),
                getSentSwapRequests(USER_ID),
            ]);

            setConvos(Array.isArray(c) ? c : []);
            setSwaps(Array.isArray(s) ? s : []);
        } catch (e) {
            console.error('Failed to load chat data:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const tabs: ['msg' | 'swap', string][] = [['msg', 'Messages'], ['swap', 'Sent Swap Request']];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={S.header}><Text style={S.headerTitle}>Inbox</Text></View>
            <View style={S.tabBar}>
                {tabs.map(([key, label]) => (
                    <TouchableOpacity key={key} style={[S.tab, tab === key && S.tabOn]} onPress={() => setTab(key)}>
                        <Text style={[S.tabTxt, tab === key && { color: '#2563EB' }]}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {loading ? <ActivityIndicator style={{ flex: 1 }} color="#2563EB" size="large" /> :
                tab === 'msg' ? (
                    <FlatList data={convos} keyExtractor={(i: any) => i.id}
                        renderItem={({ item }: any) => <ConvoRow item={item} onPress={() =>
                            router.push({
                                pathname: '/(employee)/chat/[conversationId]' as any,
                                params: { conversationId: item.id, participantName: item.participantName, participantAvatar: item.participantAvatar ?? '' }
                            })} />}
                        ItemSeparatorComponent={() => <View style={S.sep} />}
                        ListEmptyComponent={<Text style={S.empty}>No messages yet</Text>}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2563EB" />}
                    />
                ) : (
                    <FlatList data={swaps} keyExtractor={(i: any) => i.id}
                        renderItem={({ item }: any) => <SwapRow item={item} />}
                        contentContainerStyle={{ padding: 16 }}
                        ListEmptyComponent={<Text style={S.empty}>No swap requests sent</Text>}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2563EB" />}
                    />
                )
            }
        </SafeAreaView>
    );
}

const S = StyleSheet.create({
    header: { alignItems: 'center', paddingVertical: 14 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabOn: { borderBottomColor: '#2563EB' },
    tabTxt: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    name: { fontSize: 15, fontWeight: '700', color: '#111' },
    sub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    time: { fontSize: 12, color: '#9CA3AF', marginLeft: 8 },
    sep: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 74 },
    avatarFb: { backgroundColor: '#D1D5DB' },
    swapCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
    shiftBox: { backgroundColor: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    shiftLbl: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
    shiftTxt: { fontSize: 12, color: '#374151', marginTop: 3 },
    badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, alignItems: 'center' },
    empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 80 },
});
