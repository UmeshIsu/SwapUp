import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getColleaguesByDate, Colleague } from '../../../src/services/shiftService';
import { createSwapRequest } from '../../../src/services/swapService';
import { format, parseISO } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ColleagueItem extends Colleague {
    requestSent: boolean;
    loading: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatShiftTime(startTime: string, endTime: string): string {
    try {
        const start = format(parseISO(startTime), 'hh:mm a');
        const end = format(parseISO(endTime), 'hh:mm a');
        return `${start} - ${end}`;
    } catch {
        return `${startTime} - ${endTime}`;
    }
}

function formatDate(dateStr: string): string {
    try {
        return format(parseISO(dateStr), 'EEEE, dd MMMM');
    } catch {
        return dateStr;
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FindColleagueScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        shiftId?: string;
        shiftTime?: string;
        role?: string;
        reason?: string;
        date?: string;
    }>();

    const [searchQuery, setSearchQuery] = useState('');
    const [colleagues, setColleagues] = useState<ColleagueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch colleagues from the same department on the given date
    useEffect(() => {
        async function loadColleagues() {
            try {
                setLoading(true);
                setError('');

                // Extract date for query — the date param is an ISO string from the shift
                let dateStr = params.date ?? '';
                // Convert ISO to YYYY-MM-DD format for the API
                try {
                    const parsed = new Date(dateStr);
                    dateStr = parsed.toISOString().split('T')[0];
                } catch { /* use as-is */ }

                const data = await getColleaguesByDate(dateStr);
                setColleagues(data.map(c => ({ ...c, requestSent: false, loading: false })));
            } catch (err: any) {
                console.error('Failed to load colleagues:', err);
                setError(err.message || 'Failed to find colleagues.');
            } finally {
                setLoading(false);
            }
        }
        loadColleagues();
    }, [params.date]);

    const filtered = useMemo(
        () =>
            colleagues.filter((c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [colleagues, searchQuery]
    );

    const handleRequestSwap = async (colleague: ColleagueItem) => {
        if (!params.shiftId) {
            Alert.alert('Error', 'Missing your shift ID');
            return;
        }

        // Set loading state on this colleague
        setColleagues(prev =>
            prev.map(c => c.employeeId === colleague.employeeId ? { ...c, loading: true } : c)
        );

        try {
            await createSwapRequest({
                requesterShiftId: params.shiftId,
                targetEmployeeId: colleague.employeeId,
                targetShiftId: colleague.shiftId,
                reason: params.reason || '',
            });

            // Mark as sent
            setColleagues(prev =>
                prev.map(c =>
                    c.employeeId === colleague.employeeId
                        ? { ...c, requestSent: true, loading: false }
                        : c
                )
            );

            // Navigate to summary
            router.push({
                pathname: '/(employee)/swap/swap-summary',
                params: {
                    yourRole: params.role ?? 'Waiter',
                    yourShiftTime: params.shiftTime ?? '',
                    yourDate: params.date ? formatDate(params.date) : '',
                    colleagueName: colleague.name,
                    colleagueShiftTime: formatShiftTime(colleague.startTime, colleague.endTime),
                    colleagueDate: params.date ? formatDate(params.date) : '',
                },
            });
        } catch (err: any) {
            console.error('Swap request failed:', err);
            Alert.alert('Error', err.message || 'Failed to send swap request');
            setColleagues(prev =>
                prev.map(c =>
                    c.employeeId === colleague.employeeId ? { ...c, loading: false } : c
                )
            );
        }
    };

    const renderColleague = ({ item }: { item: ColleagueItem }) => (
        <View style={styles.colleagueCard}>
            {/* Avatar */}
            <View style={styles.avatar}>
                <Ionicons name="person" size={28} color="#7A8AA0" />
            </View>

            {/* Info */}
            <View style={styles.colleagueInfo}>
                <Text style={styles.colleagueName}>{item.name}</Text>
                <Text style={styles.availableText}>Available</Text>
                <Text style={styles.hoursText}>
                    {formatShiftTime(item.startTime, item.endTime)}
                </Text>
            </View>

            {/* Action button */}
            {item.loading ? (
                <ActivityIndicator size="small" color={PRIMARY} />
            ) : (
                <TouchableOpacity
                    style={[styles.actionBtn, item.requestSent && styles.actionBtnSent]}
                    onPress={() => !item.requestSent && handleRequestSwap(item)}
                    activeOpacity={item.requestSent ? 1 : 0.8}
                >
                    <Text style={styles.actionBtnText}>
                        {item.requestSent ? 'Request Sent' : 'Request Swap'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Find Colleague</Text>
            </View>

            {/* Shift Info Card */}
            <View style={styles.shiftInfoCard}>
                <Text style={styles.shiftInfoRole}>{params.role ?? 'Waiter'}</Text>
                <Text style={styles.shiftInfoDate}>
                    {params.date ? formatDate(params.date) : 'Unknown date'}
                </Text>
                <Text style={styles.shiftInfoTime}>
                    {params.shiftTime ?? 'Unknown time'} at Hilton Colombo
                </Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name.."
                    placeholderTextColor="#BBBBBB"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <Ionicons name="search-outline" size={20} color="#BBBBBB" />
            </View>

            {/* Colleague List */}
            {loading ? (
                <View style={styles.centerWrap}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                    <Text style={styles.loadingText}>Finding colleagues...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerWrap}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.shiftId}
                    renderItem={renderColleague}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No colleagues found for this date.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PRIMARY = '#1373D0';
const SENT_COLOR = '#F09B46';

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
    },
    headerTitle: {
        flex: 1,
        fontSize: 19,
        fontWeight: '600',
        color: '#111',
        textAlign: 'center',
        marginRight: 38,
    },

    // Shift Info Card
    shiftInfoCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 12,
    },
    shiftInfoRole: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111',
        marginBottom: 4,
    },
    shiftInfoDate: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    shiftInfoTime: {
        fontSize: 13,
        color: '#666',
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEEEEE',
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },

    // List
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        gap: 10,
    },

    // Loading / Error
    centerWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#888',
        fontSize: 14,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
    },

    // Colleague card
    colleagueCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#D8DDE5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    colleagueInfo: {
        flex: 1,
    },
    colleagueName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
        marginBottom: 2,
    },
    availableText: {
        fontSize: 12,
        color: '#2ECC71',
        fontWeight: '600',
        marginBottom: 2,
    },
    hoursText: {
        fontSize: 11,
        color: '#999',
    },
    actionBtn: {
        backgroundColor: PRIMARY,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 9,
    },
    actionBtnSent: {
        backgroundColor: SENT_COLOR,
    },
    actionBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#AAA',
        fontSize: 14,
    },
});