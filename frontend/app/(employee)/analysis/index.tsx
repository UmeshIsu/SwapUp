import { StyleSheet, TouchableOpacity, ScrollView, View, ActivityIndicator, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../../src/constants/colors";
import { monthOptions } from "@/src/data/mock";
import { useEffect, useState } from "react";
import { fetchMonthlyAnalytics, MonthlyAnalytics } from "@/src/services/analyticsService";
import HeaderBar from "@/src/components/layout/HeaderBar";
import { palette } from "@/src/constants/palette";

const C = {
    bg: '#F8F9FA',
    card: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    primary: palette.primary,
    primarySoft: '#EFF6FF',
    divider: '#E8ECF1',
    successText: '#15803D',
    successSoft: '#ECFDF5',
    warning: '#D97706',
    warningSoft: '#FFFBEB',
    danger: '#DC2626',
    dangerSoft: '#FEF2F2',
};

export default function AnalysisIndex() {
    const [month, setMonth] = useState(monthOptions[0].value);
    const [data, setData] = useState<MonthlyAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const c = useColors();
    const insets = useSafeAreaInsets();

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

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* ── Header ── */}
            <View style={[styles.headerBox, { paddingTop: insets.top + 14, backgroundColor: C.card }]}>
                <HeaderBar title="Monthly Analytical Reports" monthValue={month} onMonthChange={setMonth} />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={[styles.loadingText, { color: C.textMuted }]}>Loading analytics...</Text>
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Ionicons name="alert-circle" size={48} color={C.danger} />
                    <Text style={[styles.errorText, { color: C.danger }]}>{error}</Text>
                </View>
            ) : data ? (
                <View style={styles.content}>

                    {/* ── Punctuality Card ── */}
                    <View style={styles.card}>
                        <View style={styles.cardBody}>
                            <View style={styles.cardTextGroup}>
                                <View style={styles.cardTitleRow}>
                                    <Text style={styles.cardTitle}>Punctuality Rate</Text>
                                    <Ionicons name="information-circle-outline" size={15} color={C.textMuted} />
                                </View>
                                <Text style={[styles.cardValue, { color: C.successText }]}>
                                    {data.punctualityRate}
                                    <Text style={styles.cardValueUnit}> %</Text>
                                </Text>
                                <Text style={styles.cardSub}>
                                    {data.lateCount} late check-in{data.lateCount !== 1 ? 's' : ''} this month
                                </Text>
                            </View>
                            <View style={[styles.iconContainer, { backgroundColor: C.successSoft }]}>
                                <View style={[styles.ringOuter, { borderColor: '#BBF7D0' }]}>
                                    <View style={[styles.ringInner, { borderRightColor: C.successText, borderTopColor: C.successText }]} />
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => router.push("/analysis/punctuality" as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.actionBtnText}>View Details</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Absentee Rate Card ── */}
                    <View style={styles.card}>
                        <View style={styles.cardBody}>
                            <View style={styles.cardTextGroup}>
                                <View style={styles.cardTitleRow}>
                                    <Text style={styles.cardTitle}>Absentee Rate</Text>
                                    <Ionicons name="information-circle-outline" size={15} color={C.textMuted} />
                                </View>
                                <Text style={[styles.cardValue, { color: C.danger }]}>
                                    {data.absenteeRate}
                                    <Text style={styles.cardValueUnit}>%</Text>
                                </Text>
                                <Text style={styles.cardSub}>
                                    {data.absentCount} absent this month
                                </Text>
                            </View>
                            <View style={[styles.iconContainer, { backgroundColor: C.dangerSoft }]}>
                                <View style={[styles.calCircle, { backgroundColor: C.dangerSoft }]}>
                                    <Ionicons name="calendar" size={30} color={C.danger} />
                                    <View style={styles.checkBadge}>
                                        <Ionicons name="checkmark" size={10} color="#fff" />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => router.push("/analysis/absentee" as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.actionBtnText}>View Details</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Overtime Tracking Card ── */}
                    <View style={styles.card}>
                        <View style={styles.cardBody}>
                            <View style={styles.cardTextGroup}>
                                <View style={styles.cardTitleRow}>
                                    <Text style={styles.cardTitle}>Overtime Tracking</Text>
                                    <Ionicons name="information-circle-outline" size={15} color={C.textMuted} />
                                </View>
                                <Text style={[styles.cardValue, { color: C.warning }]}>
                                    {data.overtimeHours}
                                    <Text style={styles.cardValueUnit}> hrs</Text>
                                </Text>
                                <Text style={styles.cardSub}>Total for the month</Text>
                            </View>
                            <View style={[styles.iconContainer, { backgroundColor: C.warningSoft }]}>
                                <View style={styles.barGraphic}>
                                    <View style={[styles.bar, { height: 10, backgroundColor: C.textMuted, opacity: 0.3 }]} />
                                    <View style={[styles.bar, { height: 20, backgroundColor: C.textMuted, opacity: 0.4 }]} />
                                    <View style={[styles.bar, { height: 15, backgroundColor: C.textMuted, opacity: 0.35 }]} />
                                    <View style={[styles.bar, { height: 28, backgroundColor: C.warning }]} />
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => router.push("/analysis/overview" as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.actionBtnText}>View Details</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Export Reports Card ── */}
                    <View style={styles.card}>
                        <View style={styles.cardBody}>
                            <View style={styles.cardTextGroup}>
                                <View style={styles.cardTitleRow}>
                                    <Text style={styles.cardTitle}>Export Reports</Text>
                                    <Ionicons name="download-outline" size={15} color={C.textMuted} />
                                </View>
                                <Text style={styles.cardSub}>Download your monthly{'\n'}attendance report</Text>
                            </View>
                            <View style={[styles.iconContainer, { backgroundColor: C.primarySoft }]}>
                                <Ionicons name="document-text" size={36} color={C.primary} />
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => router.push("/analysis/reports" as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.actionBtnText}>Export Report</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            ) : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    headerBox: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        marginBottom: 8,
    },
    content: {
        padding: 16,
        gap: 14,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        gap: 12,
        marginTop: 60,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 14,
        textAlign: "center",
        fontWeight: '500',
    },

    /* ── Card ── */
    card: {
        backgroundColor: C.card,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    cardTextGroup: {
        flex: 1,
        paddingRight: 12,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: C.text,
        letterSpacing: -0.2,
    },
    cardValue: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -1,
        lineHeight: 42,
    },
    cardValueUnit: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0,
    },
    cardSub: {
        fontSize: 12,
        color: C.textMuted,
        fontWeight: '500',
        marginTop: 4,
    },

    /* ── Icon containers ── */
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringOuter: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 5,
        borderColor: '#BBF7D0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringInner: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 5,
        borderColor: 'transparent',
        transform: [{ rotate: '45deg' }],
    },
    calCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: C.successText,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: C.card,
    },
    barGraphic: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 5,
    },
    bar: {
        width: 9,
        borderRadius: 4,
    },

    /* ── Action button ── */
    actionBtn: {
        backgroundColor: C.primary,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: C.primary,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});
