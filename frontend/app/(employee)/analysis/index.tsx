import { StyleSheet, TouchableOpacity, ScrollView, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/src/components/themed-text";
import { ThemedView } from "@/src/components/themed-view";
import { useColors } from "../../../src/constants/colors";
import HeaderBar from "@/src/components/layout/HeaderBar";
import { monthOptions } from "@/src/data/mock";
import { useEffect, useState } from "react";
import Card from "@/src/components/ui/card";
import Button from "@/src/components/ui/Button";
import { fetchMonthlyAnalytics, MonthlyAnalytics } from "@/src/services/analyticsService";

export default function AnalysisIndex() {
    const [month, setMonth] = useState(monthOptions[0].value);
    const [data, setData] = useState<MonthlyAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const c = useColors();

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchMonthlyAnalytics(month)
            .then(res => { if (!cancelled) setData(res); })
            .catch(err => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [month]);

    const trendDiff = data
        ? Math.round((data.punctualityRate - (100 - data.absenteeRate)) * 10) / 10
        : 0;

    return (
        <ScrollView style={[styles.container, { backgroundColor: c.bg }]}>
            <ThemedView style={[styles.header, { backgroundColor: c.cardBg, borderBottomColor: c.border }]}>
                <HeaderBar title="Monthly Analytical Reports" monthValue={month} onMonthChange={setMonth} />
            </ThemedView>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={c.primary} />
                    <ThemedText style={[styles.loadingText, { color: c.muted }]}>Loading analytics...</ThemedText>
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Ionicons name="alert-circle" size={48} color={c.danger} />
                    <ThemedText style={[styles.errorText, { color: c.danger }]}>{error}</ThemedText>
                </View>
            ) : data ? (
                <View style={styles.content}>
                    {/* Punctuality Card */}
                    <Card style={styles.reportCard}>
                        <View style={styles.cardHeader}>
                            <View>
                                <ThemedText style={[styles.cardLabel, { color: c.text }]}>Punctuality Rate <Ionicons name="information-circle-outline" size={14} color={c.muted} /></ThemedText>
                                <ThemedText style={[styles.cardValue, { color: c.success }]}>{data.punctualityRate} %</ThemedText>
                                <ThemedText style={[styles.cardSub, { color: c.muted }]}>{data.lateCount} late check-in{data.lateCount !== 1 ? 's' : ''} this month</ThemedText>
                            </View>
                            <View style={styles.visualContainer}>
                                <View style={[styles.dummyCircle, { borderColor: c.soft }]}>
                                    <View style={[styles.dummyCircleFill, { borderRightColor: c.success, borderTopColor: c.success }]} />
                                </View>
                            </View>
                        </View>
                        <Button
                            label="View Details"
                            onPress={() => router.push("/analysis/punctuality" as any)}
                            style={styles.viewDetailsBtn}
                        />
                    </Card>

                    {/* Absentee Rate Card */}
                    <Card style={styles.reportCard}>
                        <View style={styles.cardHeader}>
                            <View>
                                <ThemedText style={[styles.cardLabel, { color: c.text }]}>Absentee Rate <Ionicons name="information-circle-outline" size={14} color={c.muted} /></ThemedText>
                                <ThemedText style={[styles.cardValue, { color: c.danger }]}>{data.absenteeRate}%</ThemedText>
                                <ThemedText style={[styles.cardSub, { color: c.muted }]}>{data.absentCount} absent this month</ThemedText>
                            </View>
                            <View style={styles.visualContainer}>
                                <View style={[styles.iconCircle, { backgroundColor: c.iconCircleDangerBg }]}>
                                    <Ionicons name="calendar" size={32} color={c.danger} />
                                    <View style={[styles.checkBadge, { backgroundColor: c.success, borderColor: c.cardBg }]}>
                                        <Ionicons name="checkmark" size={12} color="#FFF" />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <Button
                            label="View Details"
                            onPress={() => router.push("/analysis/absentee" as any)}
                            style={styles.viewDetailsBtn}
                        />
                    </Card>

                    {/* Overtime Tracking Card */}
                    <Card style={styles.reportCard}>
                        <View style={styles.cardHeader}>
                            <View>
                                <ThemedText style={[styles.cardLabel, { color: c.text }]}>Overtime Tracking <Ionicons name="information-circle-outline" size={14} color={c.muted} /></ThemedText>
                                <ThemedText style={[styles.cardValue, { color: "#F59E0B" }]}>{data.overtimeHours} <ThemedText style={[styles.unit, { color: c.muted }]}>hrs</ThemedText></ThemedText>
                                <ThemedText style={[styles.cardSub, { color: c.muted }]}>Total for the month</ThemedText>
                            </View>
                            <View style={styles.visualContainer}>
                                <View style={styles.barGraphic}>
                                    <View style={[styles.bar, { height: 10, opacity: 0.3, backgroundColor: c.muted }]} />
                                    <View style={[styles.bar, { height: 20, opacity: 0.5, backgroundColor: c.muted }]} />
                                    <View style={[styles.bar, { height: 15, opacity: 0.4, backgroundColor: c.muted }]} />
                                    <View style={[styles.bar, { height: 25, backgroundColor: "#F59E0B" }]} />
                                </View>
                            </View>
                        </View>
                        <Button
                            label="View Details"
                            onPress={() => router.push("/analysis/overview" as any)}
                            style={styles.viewDetailsBtn}
                        />
                    </Card>

                    {/* Export Reports Card */}
                    <Card style={styles.reportCard}>
                        <View style={styles.cardHeader}>
                            <View>
                                <ThemedText style={[styles.cardLabel, { color: c.text }]}>Export Reports <Ionicons name="download-outline" size={14} color={c.muted} /></ThemedText>
                                <ThemedText style={[styles.cardSub, { color: c.muted }]}>Download your monthly attendance report</ThemedText>
                            </View>
                            <View style={styles.visualContainer}>
                                <Ionicons name="document-text" size={36} color={c.primary} />
                            </View>
                        </View>
                        <Button
                            label="Export Report"
                            onPress={() => router.push("/analysis/reports" as any)}
                            style={styles.viewDetailsBtn}
                        />
                    </Card>
                </View>
            ) : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        borderBottomWidth: 1,
    },
    content: {
        padding: 16,
        gap: 16,
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
    reportCard: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 10,
    },
    cardValue: {
        fontSize: 32,
        fontWeight: "800",
    },
    unit: {
        fontSize: 18,
        fontWeight: "600",
    },
    trendUp: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
    cardSub: {
        fontSize: 12,
        marginTop: 4,
    },
    visualContainer: {
        width: 80,
        height: 80,
        justifyContent: "center",
        alignItems: "center",
    },
    dummyCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    dummyCircleFill: {
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 6,
        borderColor: "transparent",
        transform: [{ rotate: "45deg" }],
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    checkBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
    },
    barGraphic: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 4,
    },
    bar: {
        width: 8,
        borderRadius: 4,
    },
    viewDetailsBtn: {
        borderRadius: 8,
    },
});
