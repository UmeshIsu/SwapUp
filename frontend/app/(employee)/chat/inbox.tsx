import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Thread {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    avatarColor: string;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────
// Messages tab — regular chat threads
const MOCK_MESSAGES: Thread[] = [
    { id: 'm1', name: 'Dhammika Perera', lastMessage: 'Sure, I will approve it', time: '10.30 AM', avatarColor: '#E53935' },
];

// Sent Swap Request tab — swap requests received by you (incoming from others)
// API: GET /api/swap-requests/incoming
const MOCK_INCOMING_REQUESTS: Thread[] = [
    { id: 's1', name: 'Don Dulaj', lastMessage: 'Sure, I will approve it', time: '10.30 AM', avatarColor: '#E53935' },
    { id: 's2', name: 'Vishwa Kamal', lastMessage: 'Already got it.', time: '03.03 PM', avatarColor: '#3949AB' },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function InboxScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'messages' | 'swap'>('messages');

    // When backend is ready:
    // Messages tab → fetch from  GET /api/chat/threads
    // Swap tab     → fetch from  GET /api/swap-requests/incoming
    const data = activeTab === 'messages' ? MOCK_MESSAGES : MOCK_INCOMING_REQUESTS;

    const renderThread = ({ item }: { item: Thread }) => (
        <TouchableOpacity
            style={styles.threadCard}
            onPress={() =>
                router.push({
                    pathname: '/(employee)/chat/[requestId]' as any,
                    params: { requestId: item.id, name: item.name, tab: activeTab },
                })
            }
            activeOpacity={0.75}
        >
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
                <Ionicons name="person" size={22} color="#FFF" />
            </View>

            {/* Info */}
            <View style={styles.threadInfo}>
                <Text style={styles.threadName}>{item.name}</Text>
                <Text style={styles.threadPreview} numberOfLines={1}>{item.lastMessage}</Text>
            </View>

            {/* Time */}
            <Text style={styles.threadTime}>{item.time}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Inbox</Text>
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

            {/* Thread list */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderThread}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {activeTab === 'messages' ? 'No messages yet.' : 'No incoming swap requests.'}
                    </Text>
                }
            />
        </SafeAreaView>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const PRIMARY = '#1373D0';

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },

    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 6,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111',
        textAlign: 'center',
    },

    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
        marginBottom: 4,
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
    tabTextActive: {
        color: PRIMARY,
    },
    tabUnderline: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
        height: 2.5,
        backgroundColor: PRIMARY,
        borderRadius: 2,
    },

    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 30,
    },
    threadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        gap: 14,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    threadInfo: { flex: 1 },
    threadName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
        marginBottom: 3,
    },
    threadPreview: {
        fontSize: 13,
        color: '#888',
    },
    threadTime: {
        fontSize: 12,
        color: '#AAAAAA',
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 60,
        fontSize: 14,
        color: '#BBB',
    },
});
