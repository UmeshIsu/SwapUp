import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/src/components/layout/Screen";
import HeaderBar from "@/src/components/layout/HeaderBar";
import Card from "@/src/components/ui/card";
import MiniSparkline from "@/src/components/Charts/MiniSparkline";
import { ThemedText } from "@/src/components/themed-text";
import { useColors } from "@/src/constants/colors";
import { monthOptions } from "@/src/data/mock";
import HeaderSimple from "@/src/components/layout/HeaderSimple";
import { fetchPunctualityDetails, PunctualityDetails } from "@/src/services/analyticsService";

export default function PunctualityScreen() {
    const [month, setMonth] = useState(monthOptions[0].value);
    const [data, setData] = useState<PunctualityDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const c = useColors();

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
                    <ActivityIndicator size="large" color={c.primary} />
                    <ThemedText style={[styles.loadingText, { color: c.muted }]}>Loading...</ThemedText>
                </View>
            </Screen>
        );
    }

    if (error || !data) {
        return (
            <Screen>
                <HeaderSimple title="Punctuality Analysis" />
                <View style={styles.centered}>
                    <Ionicons name="alert-circle" size={48} color={c.danger} />
                    <ThemedText style={[styles.errorText, { color: c.danger }]}>{error || 'No data available'}</ThemedText>
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
                        <ThemedText style={[styles.trendText, { color: c.success }]}>
                            <Ionicons name={data.comparison.current >= data.comparison.prevMonth ? "trending-up" : "trending-down"} size={14} />{' '}
                            {data.comparison.current >= data.comparison.prevMonth ? '+' : ''}
                            {Math.round((data.comparison.current - data.comparison.prevMonth) * 10) / 10}% vs {comparisonLabels.prevMonth}
                        </ThemedText>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <MiniSparkline values={data.weekTrend} />
                        <View style={styles.chartLabels}>
                            <ThemedText style={[styles.chartLabel, { color: c.muted }]}>Week 1</ThemedText>
                            <ThemedText style={[styles.chartLabel, { color: c.muted }]}>Week 2</ThemedText>
                            <ThemedText style={[styles.chartLabel, { color: c.muted }]}>Week 3</ThemedText>
                            <ThemedText style={[styles.chartLabel, { color: c.muted }]}>Week 4</ThemedText>
                        </View>
                    </View>
                </Card>

                <View style={styles.sectionHeader}>
                    <ThemedText style={[styles.sectionTitle, { color: c.text }]}>Punctuality Events ({data.events.length})</ThemedText>
                </View>

                {data.events.length === 0 ? (
                    <Card style={styles.eventCard}>
                        <ThemedText style={[styles.emptyText, { color: c.muted }]}>No late check-ins this month. Great work!</ThemedText>
                    </Card>
                ) : (
                    data.events.map((e: any) => (
                        <Card key={e.id} style={styles.eventCard}>
                            <View style={styles.eventRow}>
                                <View style={[styles.iconCircle, { backgroundColor: c.iconCircleBg }]}>
                                    <Ionicons name="time" size={20} color="#F59E0B" />
                                </View>
                                <View style={styles.eventInfo}>
                                    <ThemedText style={styles.eventTitle}>{e.title}</ThemedText>
                                    <ThemedText style={[styles.eventSubtitle, { color: c.muted }]}>{e.subtitle} ({e.badge})</ThemedText>
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
                            <ThemedText style={[styles.compareValue, { color: c.success }]}>{data.comparison.twoMonthsAgo}%</ThemedText>
                            <ThemedText style={[styles.compareLabel, { color: c.muted }]}>{comparisonLabels.twoMonthsAgo}</ThemedText>
                        </View>
                        <View style={styles.compareItem}>
                            <ThemedText style={[styles.compareValue, { color: c.success }]}>{data.comparison.prevMonth}%</ThemedText>
                            <ThemedText style={[styles.compareLabel, { color: c.muted }]}>{comparisonLabels.prevMonth}</ThemedText>
                        </View>
                        <View style={[styles.compareItem, styles.compareItemActive, { backgroundColor: c.soft }]}>
                            <ThemedText style={[styles.compareValue, { color: c.primary }]}>{data.comparison.current}%</ThemedText>
                            <ThemedText style={[styles.compareLabel, { color: c.primary, fontWeight: '700' }]}>{comparisonLabels.current} (Current)</ThemedText>
                        </View>
                    </View>
                </Card>

                <Card style={[styles.tipsCard, { backgroundColor: c.soft, borderColor: c.primary + "30" }]}>
                    <View style={styles.tipsHeader}>
                        <Ionicons name="bulb-outline" size={20} color={c.primary} />
                        <ThemedText style={[styles.tipsTitle, { color: c.primary }]}>Tips for Improvement</ThemedText>
                    </View>
                    <ThemedText style={[styles.tipsText, { color: c.muted }]}>
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
    },
    errorText: {
        fontSize: 14,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 13,
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
        fontWeight: "600",
    },
    chartLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    chartLabel: {
        fontSize: 10,
    },
    sectionHeader: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
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
    compareItemActive: {},
    compareValue: {
        fontSize: 18,
        fontWeight: "800",
    },
    compareLabel: {
        fontSize: 10,
        marginTop: 4,
        textAlign: "center",
    },
    tipsCard: {
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
    },
    tipsText: {
        fontSize: 13,
        lineHeight: 18,
    },
});
