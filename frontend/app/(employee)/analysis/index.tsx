import { StyleSheet, TouchableOpacity, ScrollView, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/src/components/themed-text";
import { ThemedView } from "@/src/components/themed-view";
import { colors } from "../../../src/constants/colors";
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
        <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
                <HeaderBar title="Monthly Analytical Reports" monthValue={month} onMonthChange={setMonth} />
            </ThemedView>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText style={styles.loadingText}>Loading analytics...</ThemedText>
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Ionicons name="alert-circle" size={48} color={colors.danger} />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                </View>
            ) : data ? (
                <View style={styles.content}>
                    {/* Punctuality Card */}
                    <Card style={styles.reportCard}>
                        <View style={styles.cardHeader}>
                            <View>
                                <ThemedText style={styles.cardLabel}>Punctuality Rate <Ionicons name="information-circle-outline" size={14} color={colors.muted} /></ThemedText>
                                <ThemedText style={styles.cardValue}>{data.punctualityRate} %</ThemedText>
                                <ThemedText style={styles.cardSub}>{data.lateCount} late check-in{data.lateCount !== 1 ? 's' : ''} this month</ThemedText>
                            </View>
                            <View style={styles.visualContainer}>
                                <View style={styles.dummyCircle}>
                                    <View style={[styles.dummyCircleFill, { borderRightColor: colors.success, borderTopColor: colors.success }]} />
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
                                <ThemedText style={styles.cardLabel}>Absentee Rate <Ionicons name="information-circle-outline" size={14} color={colors.muted} /></ThemedText>
                                <ThemedText style={[styles.cardValue, { color: colors.danger }]}>{data.absenteeRate}%</ThemedText>
                                <ThemedText style={styles.cardSub}>{data.absentCount} absent this month</ThemedText>
                            </View>
                            <View style={styles.visualContainer}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="calendar" size={32} color={colors.danger} />
                                    <View style={styles.checkBadge}>
                                        <Ionicons name="checkmark" size={12} color={colors.white} />
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
                                <ThemedText style={styles.cardLabel}>Overtime Tracking <Ionicons name="information-circle-outline" size={14} color={colors.muted} /></ThemedText>
                                <ThemedText style={[styles.cardValue, { color: "#F59E0B" }]}>{data.overtimeHours} <ThemedText style={styles.unit}>hrs</ThemedText></ThemedText>
                                <ThemedText style={styles.cardSub}>Total for the month</ThemedText>
                            </View>
                            <View style={styles.visualContainer}>
                                <View style={styles.barGraphic}>
                                    <View style={[styles.bar, { height: 10, opacity: 0.3 }]} />
                                    <View style={[styles.bar, { height: 20, opacity: 0.5 }]} />
                                    <View style={[styles.bar, { height: 15, opacity: 0.4 }]} />
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
                                <ThemedText style={styles.cardLabel}>Export Reports <Ionicons name="download-outline" size={14} color={colors.muted} /></ThemedText>
                                <ThemedText style={styles.cardSub}>Download your monthly attendance report</ThemedText>
                            </View>
                            <View style={styles.visualContainer}>
                                <Ionicons name="document-text" size={36} color={colors.primary} />
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
        backgroundColor: "#f8f9fa",
    },
    header: {
        padding: 24,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
        color: colors.muted,
    },
    errorText: {
        fontSize: 14,
        color: colors.danger,
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
        color: colors.text,
        marginBottom: 10,
    },
    cardValue: {
        fontSize: 32,
        fontWeight: "800",
        color: colors.success,
    },
    unit: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.muted,
    },
    trendUp: {
        fontSize: 12,
        color: colors.success,
        fontWeight: "600",
        marginTop: 4,
    },
    cardSub: {
        fontSize: 12,
        color: colors.muted,
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
        borderColor: colors.soft,
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
        backgroundColor: "#FEE2E2",
        justifyContent: "center",
        alignItems: "center",
    },
    checkBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: colors.success,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.white,
    },
    barGraphic: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 4,
    },
    bar: {
        width: 8,
        backgroundColor: colors.muted,
        borderRadius: 4,
    },
    viewDetailsBtn: {
        borderRadius: 8,
    },
});
