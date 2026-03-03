import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "@/src/components/layout/Screen";
import Card from "@/src/components/ui/Card";
import SegmentedToggle from "@/src/components/ui/SegmentedToggle";
import MiniSparkline from "@/src/components/charts/MiniSparkline";
import Button from "@/src/components/ui/Button";
import OvertimeLogItem from "@/src/components/lists/OvertimeLogItem";
import HeaderSimple from "@/src/components/layout/HeaderSimple";
import { mockOvertime } from "@/src/data/mock";
import { usePremium } from "@/src/hooks/usePremium";
import { formatCurrency, formatHours } from "@/src/utils/format";

export default function OvertimeForPremiumScreen() {
    const router = useRouter();
    const { isPremium } = usePremium();

    const [mode, setMode] = useState<"Month" | "Weekly">("Month");
    const data = useMemo(() => mockOvertime, []);

    useEffect(() => {
        if (!isPremium) router.replace("/overtime-premium");
    }, [isPremium, router]);

    if (!isPremium) return null;

    return (
        <Screen>
            <HeaderSimple title="Overtime Tracking Details" />

            <View style={{ marginTop: 12, gap: 12 }}>
                <Card>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <SegmentedToggle
                            value={mode}
                            options={["Month", "Weekly"]}
                            onChange={(v) => setMode(v as any)}
                        />
                    </View>

                    <View style={{ marginTop: 12, flexDirection: "row", justifyContent: "space-between" }}>
                        <Card.BigStat value={formatHours(data.totalHours)} />
                        <Card.BigStat value={formatCurrency(data.earnings)} tone="success" />
                    </View>

                    <View style={{ marginTop: 12 }}>
                        <Card.Title>Weekly Trend</Card.Title>
                        <View style={{ marginTop: 10 }}>
                            <MiniSparkline values={mode === "Weekly" ? data.weekTrend : data.monthTrend} variant="bars" />
                        </View>
                    </View>
                </Card>

                <Card>
                    <Card.Title>Overtime Log</Card.Title>
                    <View style={{ marginTop: 10, gap: 10 }}>
                        {data.logs.map((l) => (
                            <OvertimeLogItem key={l.id} date={l.date} timeRange={l.timeRange} duration={l.duration} />
                        ))}
                    </View>

                    <View style={{ marginTop: 12 }}>
                        <Button label="Export Report" onPress={() => router.push("/(modals)/export-report" as any)} />
                    </View>
                </Card>
            </View>
        </Screen>
    );
}