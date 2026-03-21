import React, { useEffect, useState } from "react";
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
import { fetchAbsenteeDetails, AbsenteeDetails } from "@/src/services/analyticsService";

export default function AbsenteeScreen() {
    const [month, setMonth] = useState(monthOptions[0].value);
    const [data, setData] = useState<AbsenteeDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchAbsenteeDetails(month)
            .then(res => { if (!cancelled) setData(res); })
            .catch(err => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [month]);

    if (loading) {
        return (
            <Screen>
                <HeaderSimple title="Absentee Rate Details" />
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
                <HeaderSimple title="Absentee Rate Details" />
                <View style={styles.centered}>
                    <Ionicons name="alert-circle" size={48} color={colors.danger} />
                    <ThemedText style={styles.errorText}>{error || 'No data available'}</ThemedText>
                </View>
            </Screen>
        );
    }

    return (
        <Screen>
            <HeaderSimple title="Absentee Rate Details" />

            <View style={styles.headerRow}>
                <HeaderBar title="" monthValue={month} onMonthChange={setMonth} />
            </View>

            <View style={styles.content}>
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <ThemedText style={styles.statLabel}>Absent Days</ThemedText>
                        <ThemedText style={styles.statValue}>{data.absentDays}</ThemedText>
                    </Card>
                    <Card style={styles.statCard}>
                        <ThemedText style={styles.statLabel}>Absent Rate</ThemedText>
                        <ThemedText style={[styles.statValue, { color: colors.danger }]}>{data.absentRate}%</ThemedText>
                    </Card>
                </View>

                <Card>
                    <View style={styles.cardHeader}>
                        <Card.Title>Absent Trend (Last 4 months)</Card.Title>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <MiniSparkline values={data.last4Months} variant="bars" />
                        <View style={styles.chartLabels}>
                            {data.last4MonthLabels.map((label: string, i: number) => (
                                <ThemedText key={i} style={styles.chartLabel}>{label}</ThemedText>
                            ))}
                        </View>
                    </View>
                </Card>

                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>Absent Records for {data.label}</ThemedText>
                </View>

                {data.records.length === 0 ? (
                    <Card><ThemedText style={styles.emptyText}>No absences recorded for this month.</ThemedText></Card>
                ) : (
                    data.records.map((r: any) => (
                        <Card key={r.id} style={styles.recordCard}>
                            <TouchableOpacity style={styles.recordRow}>
                                <View style={styles.recordInfo}>
                                    <ThemedText style={styles.recordDate}>{r.date}</ThemedText>
                                    <ThemedText style={styles.recordReason}>Reason: {r.reason}</ThemedText>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                            </TouchableOpacity>
                        </Card>
                    ))
                )}

                <Card style={styles.comparisonCard}>
                    <Card.Title>Performance & Comparison</Card.Title>
                    <View style={{ marginTop: 12, gap: 10 }}>
                        {data.absentRate > 2 ? (
                            <Card.InfoBox
                                tone="danger"
                                title="Comparison"
                                text={`Your absentee rate of ${data.absentRate}% is above the typical threshold.`}
                            />
                        ) : (
                            <Card.InfoBox
                                tone="success"
                                title="Great Performance"
                                text={`Your absentee rate of ${data.absentRate}% is within an excellent range.`}
                            />
                        )}
                        <Card.InfoBox
                            tone="success"
                            title="Note"
                            text="Approved swaps and leave days are not counted as absences."
                        />
                    </View>
                </Card>

                <Card style={styles.tipsCard}>
                    <View style={styles.tipsHeader}>
                        <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                        <ThemedText style={styles.tipsTitle}>Tips for Improvement</ThemedText>
                    </View>
                    <ThemedText style={styles.tipsText}>
                        {data.absentDays === 0
                            ? "Perfect attendance! You're doing great."
                            : "Consider scheduling non-urgent appointments outside of work hours to minimize unplanned absences."}
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
    statsRow: {
        flexDirection: "row",
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
    },
    statLabel: {
        fontSize: 12,
        color: colors.muted,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.danger,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
    recordCard: {
        padding: 12,
    },
    recordRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    recordInfo: {
        flex: 1,
    },
    recordDate: {
        fontSize: 14,
        fontWeight: "600",
    },
    recordReason: {
        fontSize: 12,
        color: colors.muted,
        marginTop: 2,
    },
    emptyText: {
        fontSize: 13,
        color: colors.muted,
        textAlign: "center",
        padding: 10,
    },
    comparisonCard: {
        padding: 16,
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