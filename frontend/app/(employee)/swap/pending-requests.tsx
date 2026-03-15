import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import {
    getMySwapRequests,
    withdrawSwapRequest,
    MySwapRequest,
} from '../../../src/services/swapService';

// ─── Constants & Types ────────────────────────────────────────────────────────
const PRIMARY = '#1373D0';
type TabType = 'Pending' | 'Approved' | 'Declined';

export default function PendingRequestsScreen() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<TabType>('Pending');
    const [requests, setRequests] = useState<MySwapRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getMySwapRequests();
            setRequests(data);
        } catch (err: any) {
            console.error('Failed to fetch requests', err);
            setError(err.message || 'Failed to load swap requests.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleWithdraw = async (id: string) => {
        Alert.alert(
            'Withdraw Request',
            'Are you sure you want to withdraw this swap request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await withdrawSwapRequest(id);
                            fetchRequests();
                        } catch (err: any) {
                            Alert.alert('Error', err.message || 'Failed to withdraw request');
                        }
                    },
                },
            ]
        );
    };

    // ─── Filtering Logic ───────────────────────────────────────────────────────
    const filteredRequests = requests.filter((req) => {
        if (activeTab === 'Pending') {
            return req.status === 'PENDING' || (req.status === 'ACCEPTED' && req.managerStatus === 'AWAITING');
        }
        if (activeTab === 'Approved') {
            return req.status === 'ACCEPTED' && req.managerStatus === 'APPROVED';
        }
        if (activeTab === 'Declined') {
            return req.status === 'REJECTED' || req.managerStatus === 'DENIED';
        }
        return false;
    });

    // ─── Rendering Helpers ─────────────────────────────────────────────────────
    const getTabStyle = (tab: TabType) => [
        styles.tab,
        activeTab === tab && styles.tabActive,
    ];

    const getTabText = (tab: TabType) => [
        styles.tabText,
        activeTab === tab && styles.tabTextActive,
    ];

    const renderCard = (req: MySwapRequest) => {
        const isPending = activeTab === 'Pending';
        const isApproved = activeTab === 'Approved';
        const isDeclined = activeTab === 'Declined';

        let statusColor = '#EAA300'; // Default pending
        let statusText = 'Pending';

        if (isApproved) {
            statusColor = '#22C55E';
            statusText = 'Approved';
        } else if (isDeclined) {
            statusColor = '#EF4444';
            statusText = 'Declined';
        } else if (req.status === 'ACCEPTED' && req.managerStatus === 'AWAITING') {
            statusColor = '#EAA300';
            statusText = 'Manager Approval';
        }

        // Determine who declined it if in Declined tab
        let declineReason = '';
        if (isDeclined) {
            if (req.status === 'REJECTED') {
                declineReason = `Declined by ${req.target.name}`;
            } else if (req.managerStatus === 'DENIED') {
                declineReason = 'Declined by Manager';
            }
        }

        // Format Date safely
        let formattedDate = req.requesterShift.date;
        try {
            formattedDate = format(parseISO(req.requesterShift.date), 'do MMMM yyyy');
        } catch { }

        return (
            <View key={req.id} style={styles.card}>
                {/* Header (Top section with Avatar and Name) */}
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={20} color={PRIMARY} />
                    </View>
                    <View>
                        <Text style={styles.targetName}>{req.target.name}</Text>
                        <Text style={styles.actionText}>sent a swap request</Text>
                    </View>
                </View>

                {/* Body (Shift details and Status) */}
                <View style={styles.cardBody}>
                    <View style={styles.shiftInfoRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                        </View>
                        <View style={styles.shiftDetails}>
                            {/* NOTE: The backend API `getMyRequests` doesn't return the Requesting Role explicitly 
                                in the current response. It returns dates and times. 
                                We mock 'Waiter' here as in the design, but ideally backend 
                                adds `role` to `requesterShift`. 
                            */}
                            <Text style={styles.roleText}>Your Shift</Text>
                            <Text style={styles.dateText}>{formattedDate}</Text>
                        </View>

                        <View style={styles.statusBadgeWrap}>
                            <Text style={styles.statusLabel}>Status</Text>
                            <Text style={[styles.statusValue, { color: statusColor }]}>{statusText}</Text>
                        </View>
                    </View>

                    {isDeclined && declineReason ? (
                        <Text style={styles.declineReasonText}>{declineReason}</Text>
                    ) : null}
                </View>

                {/* Footer (Actions) */}
                {isPending && (
                    <TouchableOpacity
                        style={styles.withdrawBtn}
                        onPress={() => handleWithdraw(req.id)}
                    >
                        <Text style={styles.withdrawText}>Withdraw</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pending Swap Request</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {(['Pending', 'Approved', 'Declined'] as TabType[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={getTabStyle(tab)}
                        onPress={() => setActiveTab(tab)}
                        activeOpacity={0.7}
                    >
                        <Text style={getTabText(tab)}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchRequests} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredRequests.length === 0 ? (
                        <View style={styles.emptyWrap}>
                            <Ionicons name="document-text-outline" size={48} color="#CCC" />
                            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} requests found.</Text>
                        </View>
                    ) : (
                        filteredRequests.map(renderCard)
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        marginLeft: 16,
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#EBF3FB', // Light blue background from design
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: '#1373D0',
        shadowColor: '#1373D0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
    },
    tabTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },

    // Content
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#EF4444',
        marginBottom: 12,
    },
    retryBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    retryText: {
        color: '#333',
        fontWeight: '500',
    },
    emptyWrap: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: '#888',
        fontSize: 15,
        marginTop: 12,
    },

    // Card
    card: {
        backgroundColor: '#F7F7F7',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E1EEFA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    targetName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111',
    },
    actionText: {
        fontSize: 13,
        color: '#777',
        marginTop: 2,
    },
    cardBody: {
        backgroundColor: '#EEEEEE',
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
    },
    shiftInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        backgroundColor: '#F9F9F9',
    },
    shiftDetails: {
        flex: 1,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    dateText: {
        fontSize: 13,
        color: '#666',
    },
    statusBadgeWrap: {
        alignItems: 'flex-end',
    },
    statusLabel: {
        fontSize: 12,
        color: '#444',
        fontWeight: '600',
        marginBottom: 2,
    },
    statusValue: {
        fontSize: 12,
        fontWeight: '800',
    },
    declineReasonText: {
        marginTop: 12,
        fontSize: 13,
        fontWeight: '500',
        color: '#EF4444',
        fontStyle: 'italic',
    },

    // Footer actions
    withdrawBtn: {
        backgroundColor: '#FAD4D4',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    withdrawText: {
        color: '#D92D20',
        fontSize: 14,
        fontWeight: '600',
    },
});
