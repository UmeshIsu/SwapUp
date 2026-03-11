import { StyleSheet, TouchableOpacity, ScrollView, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/src/components/themed-text";
import { ThemedView } from "@/src/components/themed-view";
import { colors } from "../../../src/constants/colors";
import HeaderBar from "@/src/components/layout/HeaderBar";
import { monthOptions } from "@/src/data/mock";
import { useState } from "react";
import Card from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";

const ProgressCircle = ({ percentage }: { percentage: number }) => {
    return (
        <View style={styles.circleContainer}>
            <View style={[styles.circle, { borderColor: colors.success + "95" }]}>
                <View style={[styles.circleFill, { height: `${percentage}%`, backgroundColor: colors.success }]} />
            </View>
            <View style={styles.circleOverlay}>
                <ThemedText style={styles.circleText}>{percentage}%</ThemedText>
            </View>
        </View>
    );
};

export default function AnalysisIndex() {
    const [month, setMonth] = useState(monthOptions[0].value);
    const router = useRouter();

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
                <HeaderBar title="Monthly Analytical Reports" monthValue={month} onMonthChange={setMonth} />
            </ThemedView>

            <View style={styles.content}>
                {/* Punctuality Card */}
                <Card style={styles.reportCard}>
                    <View style={styles.cardHeader}>
                        <View>
                            <ThemedText style={styles.cardLabel}>Punctuality Rate <Ionicons name="information-circle-outline" size={14} color={colors.muted} /></ThemedText>
                            <ThemedText style={styles.cardValue}>98 %</ThemedText>
                            <ThemedText style={styles.trendUp}><Ionicons name="trending-up" size={14} /> +2% vs last month</ThemedText>
                            <ThemedText style={styles.cardSub}>2 late check-ins this month</ThemedText>
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
                            <ThemedText style={[styles.cardValue, { color: colors.danger }]}>2%</ThemedText>
                            <ThemedText style={styles.cardSub}>1 absent this month</ThemedText>
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
                            <ThemedText style={[styles.cardValue, { color: "#F59E0B" }]}>12.5 <ThemedText style={styles.unit}>hrs</ThemedText></ThemedText>
                            <ThemedText style={styles.cardSub}>Total for October</ThemedText>
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
            </View>
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
    circleContainer: {
        width: 60,
        height: 60,
    },
    circle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 4,
        overflow: "hidden",
        justifyContent: "flex-end",
    },
    circleFill: {
        width: "100%",
    },
    circleOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    circleText: {
        fontSize: 12,
        fontWeight: "bold",
    }
});
