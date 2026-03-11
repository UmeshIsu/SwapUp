import React, { useMemo, useState } from "react";
import { View } from "react-native";
import Screen from "@/src/components/layout/Screen";
import HeaderBar from "@/src/components/layout/HeaderBar";
import Card from "@/src/components/ui/Card";
import SegmentedToggle from "@/src/components/ui/SegmentedToggle";
import MiniSparkline from "@/src/components/Charts/MiniSparkline";
import EventItem from "@/src/components/Lists/EventItem";
import { monthOptions, mockPunctuality } from "@/src/data/mock";

export default function PunctualityScreen() {
    const [month, setMonth] = useState(monthOptions[0].value);
    const [mode, setMode] = useState<"Weekly" | "Monthly">("Weekly");

    const data = useMemo(() => mockPunctuality[month] ?? mockPunctuality[monthOptions[0].value], [month]);

    return (
        <Screen>
            <HeaderBar title="Punctuality Analysis" monthValue={month} onMonthChange={setMonth} />

            <View style={{ marginTop: 12, gap: 12 }}>
                <Card>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Card.Title>Weekly Punctuality Trend</Card.Title>
                        <SegmentedToggle
                            value={mode}
                            options={["Weekly", "Monthly"]}
                            onChange={(v: string) => setMode(v as any)}
                        />
                    </View>
                    <View style={{ marginTop: 12 }}>
                        <MiniSparkline values={mode === "Weekly" ? data.weekTrend : data.monthTrend} />
                    </View>
                </Card>

                <Card>
                    <Card.Title>Punctuality Events ({data.events.length})</Card.Title>
                    <View style={{ marginTop: 10, gap: 10 }}>
                        {data.events.map((e: { id: string; title: string; subtitle: string; badge: string }) => (
                            <EventItem key={e.id} title={e.title} subtitle={e.subtitle} badge={e.badge} />
                        ))}
                    </View>
                </Card>

                <Card>
                    <Card.Title>Comparison</Card.Title>
                    <View style={{ marginTop: 12, gap: 10 }}>
                        <Card.StatRow label="Your Rate" value={`${data.comparison.you}%`} tone="success" />
                        <Card.StatRow label="Previous Month" value={`${data.comparison.prev}%`} />
                        <Card.StatRow label="Dept. Average" value={`${data.comparison.dept}%`} />
                    </View>

                    <View style={{ marginTop: 14 }}>
                        <Card.LockedHint text="Unlock with Premium to get personalized tips to improve your punctuality." />
                    </View>
                </Card>
            </View>
        </Screen>
    );
}