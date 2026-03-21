import React, { useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/src/components/layout/Screen";
import HeaderBar from "@/src/components/layout/HeaderBar";
import Card from "@/src/components/ui/Card";
import MiniSparkline from "@/src/components/Charts/MiniSparkline";
import { ThemedText } from "@/src/components/themed-text";
import { colors } from "@/src/constants/colors";
import { monthOptions, mockPunctuality } from "@/src/data/mock";
import HeaderSimple from "@/src/components/layout/HeaderSimple";

export default function PunctualityScreen() {
    const [month, setMonth] = useState(monthOptions[0].value);

    const data = useMemo(() => mockPunctuality[month] ?? mockPunctuality[monthOptions[0].value], [month]);

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
                        <TouchableOpacity>
                            <Ionicons name="share-outline" size={20} color={colors.text} />
                        </TouchableOpacity>
                        <ThemedText style={styles.trendText}><Ionicons name="trending-up" size={14} /> +2% vs Sep</ThemedText>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <MiniSparkline values={data.weekTrend} />
                        <View style={styles.chartLabels}>
                            <ThemedText style={styles.chartLabel}>Week 1</ThemedText>
                            <ThemedText style={styles.chartLabel}>Week 1</ThemedText>
                            <ThemedText style={styles.chartLabel}>Week 1</ThemedText>
                            <ThemedText style={styles.chartLabel}>Week 1</ThemedText>
                        </View>
                    </View>
                </Card>

                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>Punctuality Events ({data.events.length})</ThemedText>
                </View>

                {data.events.map((e: any) => (
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
                ))}

                <Card>
                    <Card.Title>Comparison</Card.Title>
                    <View style={styles.comparisonGrid}>
                        <View style={styles.compareItem}>
                            <ThemedText style={styles.compareValue}>{data.comparison.you}%</ThemedText>
                            <ThemedText style={styles.compareLabel}>Your Rate</ThemedText>
                        </View>
                        <View style={styles.compareItem}>
                            <ThemedText style={styles.compareValue}>{data.comparison.prev}%</ThemedText>
                            <ThemedText style={styles.compareLabel}>Previous Month</ThemedText>
                        </View>
                        <View style={styles.compareItem}>
                            <ThemedText style={styles.compareValue}>{data.comparison.dept}%</ThemedText>
                            <ThemedText style={styles.compareLabel}>Dept. Average</ThemedText>
                        </View>
                    </View>
                </Card>

                <Card style={styles.tipsCard}>
                    <View style={styles.tipsHeader}>
                        <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                        <ThemedText style={styles.tipsTitle}>Tips for Improvement</ThemedText>
                    </View>
                    <ThemedText style={styles.tipsText}>
                        Try to set your alarm 15 minutes earlier to ensure you have enough time for your morning routine.
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
