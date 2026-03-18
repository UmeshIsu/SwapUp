import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    Image, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '@/src/hooks/useSocket';
import { getMessages, respondToSwapRequest, sendMessage } from '@/src/services/chatService';
import { useAuth } from '@/src/contexts/AuthContext';



const fmt = (iso: string) => {
    const d = new Date(iso), h = d.getHours() % 12 || 12;
    return `${h}.${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
};

const Av = ({ uri }: { uri?: string }) =>
    uri ? <Image source={{ uri }} style={S.av} />
        : <View style={[S.av, { backgroundColor: '#D1D5DB' }]} />;

//  Swap Request Card 
function SwapCard({ msg, userId }: { msg: any; userId: string }) {
    const isMe = msg.senderId === userId;
    const sr = msg.swapRequest;

    const respond = async (status: string) => {
        try {
            await respondToSwapRequest(sr.id, status);
            // Refresh or update state if needed
        } catch (e) {
            console.error('Failed to respond to swap request:', e);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACCEPTED_BY_EMPLOYEE': return '⌛ Waiting for Manager';
            case 'DECLINED_BY_EMPLOYEE': return '❌ Declined';
            case 'APPROVED_BY_MANAGER': return '✅ Approved';
            case 'REJECTED_BY_MANAGER': return '❌ Manager Rejected';
            default: return '';
        }
    };

    return (
        <View style={[S.swapWrap, { alignSelf: isMe ? 'flex-end' : 'flex-start' }]}>
            <View style={S.swapCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Av uri={isMe ? sr.targetAvatar : msg.senderAvatar} />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={S.swapTitle}>
                            {isMe ? sr.targetName : msg.senderName}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#6B7280' }}>
                            {isMe ? 'sent a request' : 'sent you a request'}
                        </Text>
                    </View>
                </View>

                <View style={S.shiftBox}>
                    <Text style={S.shiftLbl}>Proposed Shift:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                        <View style={S.calIcon}>
                            <Ionicons name="calendar-outline" size={24} color="#6B7280" />
                        </View>
                        <View>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>Waiter</Text>
                            <Text style={{ fontSize: 13, color: '#6B7280' }}>{sr.proposedShift}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                    <TouchableOpacity><Text style={{ color: '#2563EB', fontWeight: '600' }}>View All</Text></TouchableOpacity>

                    {!isMe && sr.status === 'PENDING' && (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity style={S.btnD} onPress={() => respond('DECLINED_BY_EMPLOYEE')}>
                                <Text style={{ color: '#EF4444', fontWeight: '600' }}>Decline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={S.btnA} onPress={() => respond('ACCEPTED_BY_EMPLOYEE')}>
                                <Text style={{ color: '#10B981', fontWeight: '600' }}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {(isMe || sr.status !== 'PENDING') && (
                        <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '500' }}>
                            {getStatusLabel(sr.status)}
                        </Text>
                    )}
                </View>
            </View>
            <Text style={[S.ts, { alignSelf: isMe ? 'flex-end' : 'flex-start' }]}>{fmt(msg.createdAt)}</Text>
        </View>
    );
}

// Regular Message Bubble 
function Bubble({ msg, userId }: { msg: any; userId: string }) {
    const isMe = msg.senderId === userId;
    if (msg.type === 'SWAP_REQUEST') return <SwapCard msg={msg} userId={userId} />;
    return (
        <View style={[S.row, isMe && { justifyContent: 'flex-end' }]}>
            {!isMe && <Av uri={msg.senderAvatar} />}
            <View style={{ maxWidth: '72%', marginHorizontal: 6 }}>
                <View style={[S.bubble, isMe ? S.bubbleMe : S.bubbleThem]}>
                    <Text style={{ color: isMe ? '#fff' : '#111', fontSize: 14, lineHeight: 20 }}>{msg.content}</Text>
                </View>
                <Text style={[S.ts, { alignSelf: isMe ? 'flex-end' : 'flex-start' }]}>{fmt(msg.createdAt)}</Text>
            </View>
            {isMe && <Av uri={msg.senderAvatar} />}
        </View>
    );
}

// Chat Screen 
export default function ChatScreen() {
    const { conversationId, participantName, participantAvatar } =
        useLocalSearchParams<{ conversationId: string; participantName: string; participantAvatar: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const userId = user?.id ?? '';

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const listRef = useRef<any>(null);

    const addMessage = useCallback((msg: any) => {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, []);

    const handleStatusUpdate = useCallback(({ swapRequestId, status }: { swapRequestId: string; status: string }) => {
        setMessages(prev => prev.map(m => {
            if (m.type === 'SWAP_REQUEST' && m.swapRequest?.id === swapRequestId) {
                return { ...m, swapRequest: { ...m.swapRequest, status } };
            }
            return m;
        }));
    }, []);

    const { send } = useSocket(conversationId, addMessage, handleStatusUpdate);

    useEffect(() => {
        getMessages(conversationId)
            .then(data => { if (Array.isArray(data)) setMessages(data); })
            .catch(e => console.error('Failed to load messages:', e));
    }, [conversationId]);

    const sendMsg = () => {
        if (!text.trim()) return;
        
        // Optimistic UI update handled by socket soon, 
        // but we can let chatService handle the backend call
        sendMessage(conversationId, userId, text.trim())
            .catch(e => console.error('Failed to send text', e));

        send({ conversationId, senderId: userId, content: text.trim(), type: 'TEXT' });
        setText('');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Header */}
            <View style={S.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {participantAvatar ? <Image source={{ uri: participantAvatar }} style={{ width: 32, height: 32, borderRadius: 16 }} /> : null}
                    <Text style={S.headerTitle}>{participantName}</Text>
                </View>
                <Ionicons name="call-outline" size={22} color="#111" />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                {/* Date label */}
                <View style={S.dateLbl}><Text style={S.dateTxt}>Today</Text></View>

                <FlatList ref={listRef} data={messages} keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item }) => <Bubble msg={item} userId={userId} />}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8, gap: 10 }}
                    onContentSizeChange={() => listRef.current?.scrollToEnd()}
                />

                {/* Input bar */}
                <View style={S.inputBar}>
                    <TouchableOpacity style={S.plusBtn}>
                        <Text style={{ color: '#6B7280', fontSize: 22, lineHeight: 26 }}>+</Text>
                    </TouchableOpacity>
                    <TextInput style={S.input} placeholder="Type a message.." placeholderTextColor="#9CA3AF"
                        value={text} onChangeText={setText} multiline
                        onSubmitEditing={sendMsg} returnKeyType="send" />
                    <TouchableOpacity style={S.sendBtn} onPress={sendMsg}>
                        <Ionicons name="send" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Styles 
const S = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
    row: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 2 },
    bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleMe: { backgroundColor: '#2563EB', borderBottomRightRadius: 4 },
    bubbleThem: { backgroundColor: '#F3F4F6', borderBottomLeftRadius: 4 },
    ts: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
    av: { width: 34, height: 34, borderRadius: 17 },
    dateLbl: { alignItems: 'center', marginVertical: 10 },
    dateTxt: { fontSize: 12, color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 8 },
    plusBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center' },
    input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#111', maxHeight: 100 },
    sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
    // Swap card
    swapWrap: { marginVertical: 8 },
    swapCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, minWidth: 260 },
    swapTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
    shiftBox: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F3F4F6' },
    shiftLbl: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
    calIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
    btnD: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FEE2E2', borderRadius: 8 },
    btnA: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#D1FAE5', borderRadius: 8 },
});
