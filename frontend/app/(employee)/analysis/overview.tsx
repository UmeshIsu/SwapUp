import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/src/components/layout/Screen";
import HeaderSimple from "@/src/components/layout/HeaderSimple";
import HeaderBar from "@/src/components/layout/HeaderBar";
import Card from "@/src/components/ui/card";
import SegmentedToggle from "@/src/components/ui/SegmentedToggle";
import BarChart from "@/src/components/Charts/BarChart";
import WarningBanner from "@/src/components/ui/WarningBanner";
import { ThemedText } from "@/src/components/themed-text";
import { colors } from "@/src/constants/colors";
import { monthOptions } from "@/src/data/mock";
import { fetchOvertimeDetails, OvertimeDetails } from "@/src/services/analyticsService";

export default function OverviewScreen() {
    const [month, setMonth] = useState(monthOptions[0].value);
    const [mode, setMode] = useState<"Daily" | "Weekly">("Daily");
    const [data, setData] = useState<OvertimeDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchOvertimeDetails(month)
            .then(res => { if (!cancelled) setData(res); })
            .catch(err => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [month]);

    if (loading) {
        return (
            <Screen>
                <HeaderSimple title="My Hours Overview" />
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
                <HeaderSimple title="My Hours Overview" />
                <View style={styles.centered}>
                    <Ionicons name="alert-circle" size={48} color={colors.danger} />
                    <ThemedText style={styles.errorText}>{error || 'No data available'}</ThemedText>
                </View>
            </Screen>
        );
    }

    return (
        <Screen>
            <HeaderSimple title="My Hours Overview" />

            <View style={styles.headerRow}>
                <HeaderBar title="" monthValue={month} onMonthChange={setMonth} />
            </View>

            <View style={{ marginTop: 12, gap: 12 }}>
                <Card>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Card.Title>Hours this month</Card.Title>
                        <SegmentedToggle value={mode} options={["Daily", "Weekly"]} onChange={(v: string) => setMode(v as any)} />
                    </View>

                    <View style={{ marginTop: 12 }}>
                        <BarChart
                            labels={mode === "Daily" ? data.labels : data.weekLabels}
                            values={mode === "Daily" ? data.daily : data.weekly}
                        />
                    </View>

                    {data.totalOvertimeHours > 20 && (
                        <View style={{ marginTop: 12 }}>
                            <WarningBanner text="Warning! Working long hours can impact your health. Remember to take breaks." />
                        </View>
                    )}
                </Card>

                <Card>
                    <Card.Title>Overtime Tracker</Card.Title>
                    <View style={{ marginTop: 12, flexDirection: "row", justifyContent: "space-between" }}>
                        <Card.StatPill label="Overtime Hours" value={`${data.totalOvertimeHours}h`} />
                        <Card.StatPill label="Sessions" value={`${data.logs.length}`} tone="primary" />
                    </View>
                </Card>

                {/* Overtime Logs */}
                {data.logs.length > 0 && (
                    <>
                        <ThemedText style={styles.sectionTitle}>Overtime Sessions ({data.logs.length})</ThemedText>
                        {data.logs.map((log: any) => (
                            <Card key={log.id} style={styles.logCard}>
                                <View style={styles.logRow}>
                                    <View style={styles.logIcon}>
                                        <Ionicons name="time-outline" size={20} color="#F59E0B" />
                                    </View>
                                    <View style={styles.logInfo}>
                                        <ThemedText style={styles.logDate}>{log.date}</ThemedText>
                                        <ThemedText style={styles.logTime}>{log.timeRange}</ThemedText>
                                    </View>
                                    <ThemedText style={styles.logDuration}>{log.duration}</ThemedText>
                                </View>
                            </Card>
                        ))}
                    </>
                )}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        marginTop: -10,
        marginBottom: 10,
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
        marginTop: 4,
    },
    logCard: {
        padding: 12,
    },
    logRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    logIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FEF3C7",
        justifyContent: "center",
        alignItems: "center",
    },
    logInfo: {
        flex: 1,
    },
    logDate: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
    },
    logTime: {
        fontSize: 12,
        color: colors.muted,
        marginTop: 2,
    },
    logDuration: {
        fontSize: 14,
        fontWeight: "700",
        color: "#F59E0B",
    },
});