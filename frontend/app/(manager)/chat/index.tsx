import { palette } from '@/src/constants/palette';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, TextInput, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { getConversations, getManagerSwapApprovals, respondToSwapRequest, searchDepartmentUsers, createConversation } from '@/src/services/chatService';
import type { DepartmentUser } from '@/src/services/chatService';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';
import ScreenHeader from '@/src/components/ScreenHeader';
import { getInitials, getAvatarColor } from '@/src/utils/avatar';

const fmt = (iso: string) => {
    const d = new Date(iso), h = d.getHours() % 12 || 12;
    return `${h}.${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
};

const Avatar = ({ name, size = 46 }: { name: string; size?: number }) => (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, { width: size, height: size, borderRadius: size / 2, backgroundColor: getAvatarColor(name) }]}>
        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: size * 0.32 }}>{getInitials(name)}</Text>
    </View>
);

function ConvoRow({ item, onPress, S }: { item: any; onPress: () => void; S: any }) {
    return (
        <TouchableOpacity style={S.row} onPress={onPress} activeOpacity={0.7}>
            <Avatar name={item.participantName} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={S.name}>{item.participantName}</Text>
                <Text style={S.sub} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text style={S.time}>{fmt(item.lastMessageTime)}</Text>
        </TouchableOpacity>
    );
}

function ApprovalRow({ item, onRespond, S, isDark }: { item: any; onRespond: (id: string, s: string) => void; S: any; isDark: boolean }) {
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
            case 'APPROVED_BY_MANAGER': return { bg: isDark ? '#14532D' : '#DCFCE7', text: isDark ? '#86EFAC' : '#166534' };
            case 'REJECTED_BY_MANAGER': return { bg: isDark ? '#450A0A' : '#FEE2E2', text: isDark ? '#FCA5A5' : '#EF4444' };
            default: return { bg: isDark ? '#451A03' : '#FEF3C7', text: isDark ? '#FDE68A' : '#92400E' };
        }
    };

    const colors = getStatusColor(item.status);

    return (
        <View style={S.swapCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Avatar name={item.senderName} size={38} />
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
    const { tab: initialTab } = useLocalSearchParams<{ tab?: string }>();
    const [tab, setTab] = useState<'msg' | 'swap'>(initialTab === 'swap' ? 'swap' : 'msg');
    const [convos, setConvos] = useState<any[]>([]);
    const [swaps, setSwaps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const S = makeStyles(theme, isDark);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<DepartmentUser[]>([]);
    const [searching, setSearching] = useState(false);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (initialTab === 'swap') setTab('swap');
    }, [initialTab]);

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
                const results = await searchDepartmentUsers(searchQuery, userId);
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
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <ScreenHeader title="Messages" showBack={false} />
            <View style={S.tabBar}>
                <TouchableOpacity style={[S.tab, tab === 'msg' && S.tabOn]} onPress={() => setTab('msg')}>
                    <Text style={[S.tabTxt, tab === 'msg' && { color: theme.primary }]}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[S.tab, tab === 'swap' && S.tabOn]} onPress={() => setTab('swap')}>
                    <Text style={[S.tabTxt, tab === 'swap' && { color: theme.primary }]}>Swap Approvals</Text>
                </TouchableOpacity>
            </View>

            {tab === 'msg' && (
                <View style={S.searchContainer}>
                    <Ionicons name="search" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
                    <TextInput
                        style={S.searchInput}
                        placeholder="Search employees & managers..."
                        placeholderTextColor={theme.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {tab === 'msg' && searchQuery.trim().length > 0 && (
                <View style={S.searchResultsContainer}>
                    {searching ? (
                        <ActivityIndicator style={{ paddingVertical: 20 }} color={palette.primary} />
                    ) : searchResults.length === 0 ? (
                        <Text style={S.searchEmpty}>No users found in your department</Text>
                    ) : (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(u) => u.id}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item: u }) => (
                                <TouchableOpacity style={S.searchRow} onPress={() => handleSelectUser(u)} activeOpacity={0.7}>
                                    <Avatar name={u.name} size={40} />
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

            {loading ? <ActivityIndicator style={{ flex: 1 }} color={palette.primary} size="large" /> :
                tab === 'msg' && searchQuery.trim().length === 0 ? (
                    <FlatList
                        data={convos}
                        keyExtractor={(i: any) => i.id}
                        renderItem={({ item }: any) => (
                            <ConvoRow item={item} S={S} onPress={() =>
                                router.push({
                                    pathname: '/(manager)/chat/[conversationId]' as any,
                                    params: { conversationId: item.id, participantName: item.participantName, participantAvatar: item.participantAvatar ?? '' }
                                })}
                            />
                        )}
                        ItemSeparatorComponent={() => <View style={S.sep} />}
                        ListEmptyComponent={<Text style={S.empty}>No messages</Text>}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={palette.primary} />}
                    />
                ) : tab === 'swap' ? (
                    <FlatList
                        data={swaps}
                        keyExtractor={(i: any) => i.id}
                        renderItem={({ item }: any) => <ApprovalRow item={item} onRespond={respond} S={S} isDark={isDark} />}
                        contentContainerStyle={{ padding: 16 }}
                        ListEmptyComponent={<Text style={S.empty}>No swap requests to review</Text>}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={palette.primary} />}
                    />
                ) : null
            }
        </View>
    );
}

const makeStyles = (theme: any, isDark: boolean) => StyleSheet.create({
    header: { alignItems: 'center', paddingVertical: 14 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.border },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabOn: { borderBottomColor: palette.primary },
    tabTxt: { fontSize: 14, fontWeight: '600', color: theme.textMuted },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    name: { fontSize: 15, fontWeight: '700', color: theme.text },
    sub: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
    time: { fontSize: 12, color: theme.textMuted, marginLeft: 8 },
    sep: { height: 1, backgroundColor: theme.border, marginLeft: 74 },
    swapCard: {
        backgroundColor: isDark ? '#1E1E1E' : '#F9FAFB',
        borderRadius: 12, padding: 14, marginBottom: 12,
        borderWidth: 1, borderColor: isDark ? '#2C2C2C' : '#E5E7EB',
    },
    shiftBox: {
        backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF',
        borderRadius: 8, padding: 10,
        borderWidth: 1, borderColor: isDark ? '#3C3C3C' : '#E5E7EB',
    },
    shiftLbl: { fontSize: 13, fontWeight: '600' as const, color: theme.text, marginBottom: 4 },
    shiftTxt: { fontSize: 12, color: theme.textSecondary, marginTop: 3 },
    btnD: { flex: 1, alignItems: 'center' as const, paddingVertical: 10, backgroundColor: isDark ? '#3A1515' : '#FEE2E2', borderRadius: 8 },
    btnA: { flex: 1, alignItems: 'center' as const, paddingVertical: 10, backgroundColor: palette.primary, borderRadius: 8 },
    badge: { paddingVertical: 8, borderRadius: 8, alignItems: 'center' as const },
    empty: { textAlign: 'center' as const, color: theme.textMuted, marginTop: 80 },
    searchContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: isDark ? '#2C2C2C' : '#F3F4F6',
        borderRadius: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: theme.text,
        padding: 0,
    },
    searchResultsContainer: {
        flex: 1,
        backgroundColor: theme.background,
    },
    searchRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchEmpty: {
        textAlign: 'center' as const,
        color: theme.textMuted,
        marginTop: 30,
        fontSize: 14,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    roleBadgeManager: { backgroundColor: isDark ? '#2D1B69' : '#EDE9FE' },
    roleBadgeEmployee: { backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE' },
    roleBadgeText: { fontSize: 11, fontWeight: '600' as const },
    roleBadgeTextManager: { color: isDark ? '#C4B5FD' : '#6D28D9' },
    roleBadgeTextEmployee: { color: palette.primary },
});
