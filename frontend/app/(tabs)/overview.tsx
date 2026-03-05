import React, { useMemo, useState } from "react";
import { View } from "react-native";
import Screen from "@/src/components/layout/Screen";
import HeaderSimple from "@/src/components/layout/HeaderSimple";
import Card from "@/src/components/ui/Card";
import SegmentedToggle from "@/src/components/ui/SegmentedToggle";
import BarChart from "@/src/components/charts/BarChart";
import WarningBanner from "@/src/components/ui/WarningBanner";
import { mockOverview } from "@/src/data/mock";
import { usePremium } from "@/src/hooks/usePremium";

export default function OverviewScreen() {
  const [mode, setMode] = useState<"Daily" | "Weekly">("Daily");
  const data = useMemo(() => mockOverview, []);
  const { isPremium, setPremium } = usePremium();

  return (
    <Screen>
      <HeaderSimple title="My Hours Overview" />

      <View style={{ marginTop: 12, gap: 12 }}>
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Card.Title>Hours this week</Card.Title>
            <SegmentedToggle value={mode} options={["Daily", "Weekly"]} onChange={(v) => setMode(v as any)} />
          </View>

          <View style={{ marginTop: 12 }}>
            <BarChart labels={data.labels} values={mode === "Daily" ? data.daily : data.weekly} />
          </View>

          <View style={{ marginTop: 12 }}>
            <WarningBanner text="Warning! Working long hours can impact your health. Remember to take breaks." />
          </View>
        </Card>

        <Card>
          <Card.Title>Overtime Tracker</Card.Title>
          <View style={{ marginTop: 12, flexDirection: "row", justifyContent: "space-between" }}>
            <Card.StatPill label="Earned Hours" value={`${data.overtimeHours}h`} />
            <Card.StatPill label="Bonus Points" value={`+${data.bonusPoints}`} tone="primary" />
          </View>

          {/* dev toggle so you can test premium flow */}
          <View style={{ marginTop: 14 }}>
            <Card.SubText>Dev toggle: Premium is {isPremium ? "ON" : "OFF"}</Card.SubText>
            <View style={{ marginTop: 10 }}>
              <Card.LinkButton
                label={isPremium ? "Turn Premium OFF" : "Turn Premium ON"}
                onPress={() => setPremium(!isPremium)}
              />
            </View>
          </View>
        </Card>
      </View>
    </Screen>
  );
}