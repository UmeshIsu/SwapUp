import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Image, ActivityIndicator, SafeAreaView, RefreshControl, TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { getConversations, getManagerSwapApprovals, respondToSwapRequest, searchDepartmentUsers, createConversation } from '@/src/services/chatService';
import type { DepartmentUser } from '@/src/services/chatService';



const fmt = (iso: string) => {
    const d = new Date(iso), h = d.getHours() % 12 || 12;
    return `${h}.${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
};

const Avatar = ({ uri, size = 46, color }: { uri?: string; size?: number; color?: string }) =>
    uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
    ) : (
        <View style={[S.avatarFb, { width: size, height: size, borderRadius: size / 2, backgroundColor: color || '#D1D5DB' }]}>
            <Ionicons name="person" size={size * 0.45} color="#FFF" />
        </View>
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

function ApprovalRow({ item, onRespond }: { item: any; onRespond: (id: string, s: string) => void }) {
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'APPROVED_BY_MANAGER': return '✅ Approved';
            case 'REJECTED_BY_MANAGER': return '❌ Rejected';
            case 'ACCEPTED_BY_EMPLOYEE': return '⌛ Awaiting Your Decision';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED_BY_MANAGER': return { bg: '#DCFCE7', text: '#166534' };
            case 'REJECTED_BY_MANAGER': return { bg: '#FEE2E2', text: '#EF4444' };
            default: return { bg: '#FEF3C7', text: '#92400E' };
        }
    };

    const colors = getStatusColor(item.status);

    return (
        <View style={S.swapCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Avatar uri={item.senderAvatar} size={38} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={S.name}>{item.senderName}</Text>
                    <Text style={S.sub}>wants to swap with {item.recipientName}</Text>
                </View>
                <Text style={S.time}>{fmt(item.createdAt)}</Text>
            </View>
            <View style={S.shiftBox}>
                <Text style={S.shiftLbl}>Requested Shift:</Text>
                <Text style={S.shiftTxt}>📅 {item.proposedShift}</Text>
                <Text style={S.shiftTxt}>📅 {item.requestedShift}</Text>
            </View>
            {item.status === 'ACCEPTED_BY_EMPLOYEE' ? (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <TouchableOpacity style={S.btnD} onPress={() => onRespond(item.id, 'REJECTED_BY_MANAGER')}>
                        <Text style={{ color: '#EF4444', fontWeight: '700' }}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={S.btnA} onPress={() => onRespond(item.id, 'APPROVED_BY_MANAGER')}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Approve</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={[S.badge, { backgroundColor: colors.bg, marginTop: 10 }]}>
                    <Text style={{ color: colors.text, fontWeight: '700' }}>
                        {getStatusLabel(item.status)}
                    </Text>
                </View>
            )}
        </View>
    );
}

export default function ManagerChatInbox() {
    const router = useRouter();
    const { user } = useAuth();
    const userId = user?.id ?? '';
    const [tab, setTab] = useState<'msg' | 'swap'>('msg');
    const [convos, setConvos] = useState<any[]>([]);
    const [swaps, setSwaps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // ── Search state ──
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<DepartmentUser[]>([]);
    const [searching, setSearching] = useState(false);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Debounced search ──
    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setSearching(false);
            return;
        }
        setSearching(true);
        searchTimer.current = setTimeout(async () => {
            try {
                const results = await searchDepartmentUsers(
                    searchQuery,
                    user?.department ?? '',
                    userId,
                    user?.tenantId ?? '',
                );
                setSearchResults(results);
            } catch (e) {
                console.error('Search failed:', e);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchQuery]);

    const handleSelectUser = async (selectedUser: DepartmentUser) => {
        try {
            const convo = await createConversation([userId, selectedUser.id]);
            setSearchQuery('');
            setSearchResults([]);
            router.push({
                pathname: '/(manager)/chat/[conversationId]' as any,
                params: {
                    conversationId: convo.id,
                    participantName: selectedUser.name,
                    participantAvatar: selectedUser.avatarUrl ?? '',
                },
            });
        } catch (e) {
            Alert.alert('Error', 'Failed to start conversation');
        }
    };

    const load = useCallback(async () => {
        if (!userId) return;
        try {
            const [c, s] = await Promise.all([
                getConversations(userId),
                getManagerSwapApprovals(),
            ]);

            setConvos(Array.isArray(c) ? c : []);
            setSwaps(Array.isArray(s) ? s : []);
        } catch (e) {
            console.error('Failed to load manager chat data:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    const respond = async (id: string, status: string) => {
        try {
            await respondToSwapRequest(id, status);
            load();
        } catch (e) {
            console.error('Failed to respond to swap request:', e);
        }
    };

    useEffect(() => { load(); }, [load]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={S.header}><Text style={S.headerTitle}>Messages</Text></View>
            <View style={S.tabBar}>
                <TouchableOpacity style={[S.tab, tab === 'msg' && S.tabOn]} onPress={() => setTab('msg')}>
                    <Text style={[S.tabTxt, tab === 'msg' && { color: '#2563EB' }]}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[S.tab, tab === 'swap' && S.tabOn]} onPress={() => setTab('swap')}>
                    <Text style={[S.tabTxt, tab === 'swap' && { color: '#2563EB' }]}>Swap Approvals</Text>
                </TouchableOpacity>
            </View>

            {/* ── Search Bar (Messages tab only) ── */}
            {tab === 'msg' && (
                <View style={S.searchContainer}>
                    <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                    <TextInput
                        style={S.searchInput}
                        placeholder="Search employees & managers..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* ── Search Results Overlay ── */}
            {tab === 'msg' && searchQuery.trim().length > 0 && (
                <View style={S.searchResultsContainer}>
                    {searching ? (
                        <ActivityIndicator style={{ paddingVertical: 20 }} color="#2563EB" />
                    ) : searchResults.length === 0 ? (
                        <Text style={S.searchEmpty}>No users found in your department</Text>
                    ) : (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(u) => u.id}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item: u }) => (
                                <TouchableOpacity style={S.searchRow} onPress={() => handleSelectUser(u)} activeOpacity={0.7}>
                                    <Avatar uri={u.avatarUrl ?? undefined} size={40} color={u.role === 'MANAGER' ? '#3949AB' : '#2563EB'} />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={S.name}>{u.name}</Text>
                                        <Text style={S.sub}>{u.email}</Text>
                                    </View>
                                    <View style={[S.roleBadge, u.role === 'MANAGER' ? S.roleBadgeManager : S.roleBadgeEmployee]}>
                                        <Text style={[S.roleBadgeText, u.role === 'MANAGER' ? S.roleBadgeTextManager : S.roleBadgeTextEmployee]}>
                                            {u.role === 'MANAGER' ? 'Manager' : 'Employee'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={S.sep} />}
                        />
                    )}
                </View>
            )}

            {loading ? <ActivityIndicator style={{ flex: 1 }} color="#2563EB" size="large" /> :
                tab === 'msg' && searchQuery.trim().length === 0 ? (
                    <FlatList data={convos} keyExtractor={(i: any) => i.id}
                        renderItem={({ item }: any) => <ConvoRow item={item} onPress={() =>
                            router.push({
                                pathname: '/(manager)/chat/[conversationId]' as any,
                                params: { conversationId: item.id, participantName: item.participantName, participantAvatar: item.participantAvatar ?? '' }
                            })} />}
                        ItemSeparatorComponent={() => <View style={S.sep} />}
                        ListEmptyComponent={<Text style={S.empty}>No messages</Text>}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2563EB" />}
                    />
                ) : tab === 'swap' ? (
                    <FlatList data={swaps} keyExtractor={(i: any) => i.id}
                        renderItem={({ item }: any) => <ApprovalRow item={item} onRespond={respond} />}
                        contentContainerStyle={{ padding: 16 }}
                        ListEmptyComponent={<Text style={S.empty}>No swap requests to review</Text>}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2563EB" />}
                    />
                ) : null
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
    avatarFb: { backgroundColor: '#D1D5DB', alignItems: 'center' as const, justifyContent: 'center' as const },
    swapCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
    shiftBox: { backgroundColor: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    shiftLbl: { fontSize: 13, fontWeight: '600' as const, color: '#374151', marginBottom: 4 },
    shiftTxt: { fontSize: 12, color: '#374151', marginTop: 3 },
    btnD: { flex: 1, alignItems: 'center' as const, paddingVertical: 10, backgroundColor: '#FEE2E2', borderRadius: 8 },
    btnA: { flex: 1, alignItems: 'center' as const, paddingVertical: 10, backgroundColor: '#2563EB', borderRadius: 8 },
    badge: { paddingVertical: 8, borderRadius: 8, alignItems: 'center' as const },
    empty: { textAlign: 'center' as const, color: '#9CA3AF', marginTop: 80 },

    // Search bar
    searchContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#111',
        padding: 0,
    },
    searchResultsContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchEmpty: {
        textAlign: 'center' as const,
        color: '#9CA3AF',
        marginTop: 30,
        fontSize: 14,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    roleBadgeManager: { backgroundColor: '#EDE9FE' },
    roleBadgeEmployee: { backgroundColor: '#DBEAFE' },
    roleBadgeText: { fontSize: 11, fontWeight: '600' as const },
    roleBadgeTextManager: { color: '#6D28D9' },
    roleBadgeTextEmployee: { color: '#2563EB' },
});
