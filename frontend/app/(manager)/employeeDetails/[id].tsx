import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ActivityIndicator,
    Image,
    ScrollView,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { analyticsAPI } from '@/src/services/api';

interface EmployeeAnalytics {
    month: string;
    employee: {
        name: string;
        email: string;
        phone: string | null;
        avatarUrl: string | null;
        department: string;
        workerId: string;
    };
    totalShifts: number;
    effectiveShifts: number;
    dailyOvertime: number[];
    punctualityRate: number;
    absenteeRate: number;
    overtimeHours: number;
    lateCount: number;
    absentCount: number;
    onTimeCount: number;
}

export default function EmployeeAnalyticsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [data, setData] = useState<EmployeeAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async () => {
        try {
            const response = await analyticsAPI.getEmployeeAnalytics(id as string);
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch employee analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchAnalytics();
        }
    }, [id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
                <Stack.Screen options={{ title: 'Employee deatils', headerShadowVisible: false, headerStyle: { backgroundColor: '#F8F9FA' } }} />
                <View style={[styles.center, { flex: 1 }]}>
                    <ActivityIndicator size="large" color="#1373D0" />
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
                <Stack.Screen options={{ title: 'Employee deatils', headerShadowVisible: false }} />
                <View style={[styles.center, { flex: 1 }]}>
                    <Text style={{ color: '#6B7280' }}>Failed to load employee details.</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Chart helpers
    const maxOvertime = Math.max(...(data.dailyOvertime || [0, 0, 0, 0, 0, 0, 0]), 1); // Avoid div by 0
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <Stack.Screen options={{ title: 'Employee deatils', headerShadowVisible: false, headerStyle: { backgroundColor: '#F8F9FA' } }} />
            <ScrollView 
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1373D0']} />
                }
            >
                {/* Profile Header */}
                <View style={styles.profileSection}>
                    <Image 
                        source={{ uri: data.employee.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.employee.name)}&background=random` }} 
                        style={styles.avatar}
                    />
                    <Text style={styles.employeeName}>{data.employee.name}</Text>
                    <Text style={styles.workerId}>workerID : {data.employee.workerId || 'N/A'}</Text>
                    
                    <TouchableOpacity style={styles.contactBtn}>
                        <Ionicons name="call" size={16} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.contactBtnText}>Contact</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Overtime</Text>
                        <Text style={styles.statValue}>{data.overtimeHours.toFixed(1)} hrs</Text>
                        <Text style={[styles.statChange, { color: '#EAB308' }]}>+2.1%</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Punctuality</Text>
                        <Text style={styles.statValue}>{data.punctualityRate} %</Text>
                        <Text style={[styles.statChange, { color: '#22C55E' }]}>+2.0%</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Absences</Text>
                        <Text style={styles.statValue}>{data.absentCount}</Text>
                        <Text style={[styles.statChange, { color: '#6B7280' }]}>-</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Avg Shift Rating</Text>
                        <Text style={styles.statValue}>4.8</Text>
                        <Text style={[styles.statChange, { color: '#22C55E' }]}>+0.3</Text>
                    </View>
                </View>

                {/* Overtime Performance Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Overtime Performance</Text>
                    <View style={styles.chartContainer}>
                        {/* Red dotted line for threshold */}
                        <View style={styles.thresholdLine} />
                        
                        <View style={styles.barsContainer}>
                            {data.dailyOvertime?.map((val, idx) => (
                                <View key={idx} style={styles.barWrapper}>
                                    <View style={[styles.bar, { height: `${(val / maxOvertime) * 100}%` }, val > maxOvertime * 0.8 ? styles.barHigh : styles.barNormal]} />
                                    <Text style={styles.barLabel}>{dayLabels[idx]}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Punctuality Rate Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Punctuality Rate</Text>
                    <View style={styles.center}>
                        <View style={styles.circleChart}>
                            <View style={styles.circleInner}>
                                <Text style={styles.circlePercent}>{data.punctualityRate}%</Text>
                                <Text style={styles.circleText}>On Time</Text>
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.punctualityLegend}>
                        <View style={styles.legendItem}>
                            <Text style={styles.legendValue}>{data.onTimeCount}</Text>
                            <Text style={styles.legendLabel}>On Time</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <Text style={styles.legendValue}>{data.lateCount}</Text>
                            <Text style={styles.legendLabel}>Late</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <Text style={styles.legendValue}>0</Text>
                            <Text style={styles.legendLabel}>Very Late</Text>
                        </View>
                    </View>
                </View>

                {/* Absent Days */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Absent Days</Text>
                    <Text style={styles.absentDaysCount}>{data.absentCount} Days</Text>
                    
                    <Text style={styles.absentWeekText}>
                        <Text style={{ color: '#9CA3AF' }}>This Week </Text>
                        <Text style={{ color: '#22C55E' }}>No absences record</Text>
                    </Text>

                    <View style={styles.weekSquares}>
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                            <View key={idx} style={styles.daySquare}>
                                <Text style={styles.daySquareText}>{day}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 12,
        backgroundColor: '#E5E7EB',
    },
    employeeName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    workerId: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 16,
    },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1373D0',
        paddingVertical: 10,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        justifyContent: 'center',
    },
    contactBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    statChange: {
        fontSize: 11,
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    chartContainer: {
        height: 160,
        justifyContent: 'flex-end',
        position: 'relative'
    },
    thresholdLine: {
        position: 'absolute',
        top: '30%', // Arbitrary threshold
        left: 0,
        right: 0,
        height: 1,
        borderStyle: 'dotted',
        borderWidth: 1,
        borderColor: '#EF4444',
        borderRadius: 1
    },
    barsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: '100%',
    },
    barWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
        width: 30,
    },
    bar: {
        width: 24,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        minHeight: 10,
    },
    barNormal: {
        backgroundColor: '#A7C8FE',
    },
    barHigh: {
        backgroundColor: '#5A95FF',
    },
    barLabel: {
        fontSize: 10,
        color: '#111827',
        marginTop: 8,
    },
    circleChart: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 12,
        borderColor: '#10B981', // green
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    circleInner: {
        alignItems: 'center',
    },
    circlePercent: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
    },
    circleText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    punctualityLegend: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 16,
    },
    legendItem: {
        alignItems: 'center',
        flex: 1,
    },
    legendValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    legendLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    absentDaysCount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    absentWeekText: {
        fontSize: 13,
        marginBottom: 16,
    },
    weekSquares: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    daySquare: {
        width: 36,
        height: 36,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    daySquareText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
    }
});
