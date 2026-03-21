import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/src/components/layout/Screen";
import HeaderBar from "@/src/components/layout/HeaderBar";
import Card from "@/src/components/ui/card";
import MiniSparkline from "@/src/components/Charts/MiniSparkline";
import { ThemedText } from "@/src/components/themed-text";
import { colors } from "@/src/constants/colors";
import { monthOptions } from "@/src/data/mock";
import HeaderSimple from "@/src/components/layout/HeaderSimple";
import { fetchPunctualityDetails, PunctualityDetails } from "@/src/services/analyticsService";

export default function PunctualityScreen() {
    const [month, setMonth] = useState(monthOptions[0].value);
    const [data, setData] = useState<PunctualityDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchPunctualityDetails(month)
            .then(res => { if (!cancelled) setData(res); })
            .catch(err => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [month]);

    // Derive month labels for comparison
    const comparisonLabels = useMemo(() => {
        const [y, m] = month.split('-').map(Number);
        const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const prev1 = m === 1 ? 12 : m - 1;
        const prev2 = m <= 2 ? 12 + m - 2 : m - 2;
        return {
            current: names[m - 1],
            prevMonth: names[prev1 - 1],
            twoMonthsAgo: names[prev2 - 1],
        };
    }, [month]);

    if (loading) {
        return (
            <Screen>
                <HeaderSimple title="Punctuality Analysis" />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText style={styles.loadingText}>Loading...</ThemedText>
                </View>
            </Screen>
        );
    }

    if (error || !data) {
        return (
            <Screen>
                <HeaderSimple title="Punctuality Analysis" />
                <View style={styles.centered}>
                    <Ionicons name="alert-circle" size={48} color={colors.danger} />
                    <ThemedText style={styles.errorText}>{error || 'No data available'}</ThemedText>
                </View>
            </Screen>
        );
    }

    return (
        <Screen>
            <HeaderSimple title="Punctuality Analysis" />

            <View style={styles.headerRow}>
                <HeaderBar title="" monthValue={month} onMonthChange={setMonth} />
            </View>

            <View style={styles.content}>
                <Card>
                    <View style={styles.cardHeader}>
                        <Card.Title>Weekly Punctuality Trend</Card.Title>
                        <ThemedText style={styles.trendText}>
                            <Ionicons name={data.comparison.current >= data.comparison.prevMonth ? "trending-up" : "trending-down"} size={14} />{' '}
                            {data.comparison.current >= data.comparison.prevMonth ? '+' : ''}
                            {Math.round((data.comparison.current - data.comparison.prevMonth) * 10) / 10}% vs {comparisonLabels.prevMonth}
                        </ThemedText>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <MiniSparkline values={data.weekTrend} />
                        <View style={styles.chartLabels}>
                            <ThemedText style={styles.chartLabel}>Week 1</ThemedText>
                            <ThemedText style={styles.chartLabel}>Week 2</ThemedText>
                            <ThemedText style={styles.chartLabel}>Week 3</ThemedText>
                            <ThemedText style={styles.chartLabel}>Week 4</ThemedText>
                        </View>
                    </View>
                </Card>

                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>Punctuality Events ({data.events.length})</ThemedText>
                </View>

                {data.events.length === 0 ? (
                    <Card style={styles.eventCard}>
                        <ThemedText style={styles.emptyText}>No late check-ins this month. Great work!</ThemedText>
                    </Card>
                ) : (
                    data.events.map((e: any) => (
                        <Card key={e.id} style={styles.eventCard}>
                            <View style={styles.eventRow}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="time" size={20} color="#F59E0B" />
                                </View>
                                <View style={styles.eventInfo}>
                                    <ThemedText style={styles.eventTitle}>{e.title}</ThemedText>
                                    <ThemedText style={styles.eventSubtitle}>{e.subtitle} ({e.badge})</ThemedText>
                                </View>
                            </View>
                        </Card>
                    ))
                )}

                {/* 3-Month Comparison */}
                <Card>
                    <Card.Title>3-Month Comparison</Card.Title>
                    <View style={styles.comparisonGrid}>
                        <View style={styles.compareItem}>
                            <ThemedText style={styles.compareValue}>{data.comparison.twoMonthsAgo}%</ThemedText>
                            <ThemedText style={styles.compareLabel}>{comparisonLabels.twoMonthsAgo}</ThemedText>
                        </View>
                        <View style={styles.compareItem}>
                            <ThemedText style={styles.compareValue}>{data.comparison.prevMonth}%</ThemedText>
                            <ThemedText style={styles.compareLabel}>{comparisonLabels.prevMonth}</ThemedText>
                        </View>
                        <View style={[styles.compareItem, styles.compareItemActive]}>
                            <ThemedText style={[styles.compareValue, { color: colors.primary }]}>{data.comparison.current}%</ThemedText>
                            <ThemedText style={[styles.compareLabel, { color: colors.primary, fontWeight: '700' }]}>{comparisonLabels.current} (Current)</ThemedText>
                        </View>
                    </View>
                </Card>

                <Card style={styles.tipsCard}>
                    <View style={styles.tipsHeader}>
                        <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                        <ThemedText style={styles.tipsTitle}>Tips for Improvement</ThemedText>
                    </View>
                    <ThemedText style={styles.tipsText}>
                        {data.lateCount === 0
                            ? "Excellent punctuality! Keep up the great work and maintain your routine."
                            : "Try to set your alarm 15 minutes earlier to ensure you have enough time for your morning routine."}
                    </ThemedText>
                </Card>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        marginTop: -10,
        marginBottom: 10,
    },
    content: {
        gap: 12,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: colors.muted,
    },
    errorText: {
        fontSize: 14,
        color: colors.danger,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 13,
        color: colors.muted,
        textAlign: "center",
        padding: 10,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    trendText: {
        fontSize: 10,
        color: colors.success,
        fontWeight: "600",
    },
    chartLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    chartLabel: {
        fontSize: 10,
        color: colors.muted,
    },
    sectionHeader: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
    },
    eventCard: {
        padding: 12,
    },
    eventRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FEF3C7",
        justifyContent: "center",
        alignItems: "center",
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: "600",
    },
    eventSubtitle: {
        fontSize: 12,
        color: colors.muted,
    },
    comparisonGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
    },
    compareItem: {
        alignItems: "center",
        flex: 1,
        padding: 12,
        borderRadius: 8,
    },
    compareItemActive: {
        backgroundColor: colors.soft,
    },
    compareValue: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.success,
    },
    compareLabel: {
        fontSize: 10,
        color: colors.muted,
        marginTop: 4,
        textAlign: "center",
    },
    tipsCard: {
        backgroundColor: colors.soft,
        borderColor: colors.primary + "30",
        marginBottom: 20,
    },
    tipsHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.primary,
    },
    tipsText: {
        fontSize: 13,
        color: colors.muted,
        lineHeight: 18,
    },
});
