import React, { useMemo, useState } from "react";
import { View } from "react-native";
import Screen from "@/src/components/layout/Screen";
import HeaderBar from "@/src/components/layout/HeaderBar";
import Card from "@/src/components/ui/Card";
import MiniSparkline from "@/src/components/Charts/MiniSparkline";
import RecordRow from "@/src/components/Lists/RecordRow";
import { monthOptions, mockAbsentee } from "@/src/data/mock";

export default function AbsenteeScreen() {
    const [month, setMonth] = useState(monthOptions[0].value);
    const data = useMemo(() => mockAbsentee[month] ?? mockAbsentee[monthOptions[0].value], [month]);

    return (
        <Screen>
            <HeaderBar title="Absentee rate Details" monthValue={month} onMonthChange={setMonth} />

            <View style={{ marginTop: 12, gap: 12 }}>
                <Card>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ gap: 6 }}>
                            <Card.Title>Absent Days</Card.Title>
                            <Card.BigStat value={`${data.absentDays}`} />
                        </View>
                        <View style={{ gap: 6, alignItems: "flex-end" }}>
                            <Card.Title>Absent Rate</Card.Title>
                            <Card.BigStat value={`${data.absentRate}%`} tone="danger" />
                        </View>
                    </View>
                </Card>

                <Card>
                    <Card.Title>Absent Trend (Last 4 months)</Card.Title>
                    <View style={{ marginTop: 12 }}>
                        <MiniSparkline values={data.last4Months} variant="bars" />
                    </View>
                </Card>

                <Card>
                    <Card.Title>Absent Records for {data.label}</Card.Title>
                    <View style={{ marginTop: 10, gap: 10 }}>
                        {data.records.length === 0 ? (
                            <Card.SubText>No other absence recorded for this month.</Card.SubText>
                        ) : (
                            data.records.map((r: any) => (
                                <RecordRow key={r.id} date={r.date} reason={r.reason} />
                            ))
                        )}
                    </View>
                </Card>

                <Card>
                    <Card.Title>Performance & Comparison</Card.Title>
                    <View style={{ marginTop: 10, gap: 10 }}>
                        <Card.InfoBox
                            tone="danger"
                            title="Comparison"
                            text="Your absence rate is slightly higher than the department average."
                        />
                        <Card.InfoBox
                            tone="success"
                            title="Consistency Note"
                            text="Despite this month, your overall attendance trend has been consistent."
                        />
                    </View>

                    <View style={{ marginTop: 14 }}>
                        <Card.LockedHint text="Unlock with Premium to get personalized insights to improve your absentee rate." />
                    </View>
                </Card>
            </View>
        </Screen>
    );
}