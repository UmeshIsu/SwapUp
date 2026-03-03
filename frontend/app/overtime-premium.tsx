import React from "react";
import { View, Text } from "react-native";
import Screen from "@/src/components/layout/Screen";
import Card from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/constants/colors";
import { usePremium } from "@/src/hooks/usePremium";

export default function OvertimePremiumScreen() {
    const { setPremium } = usePremium();

    return (
        <Screen center>
            <View style={{ width: "100%", gap: 14 }}>
                <View style={{ alignItems: "center", marginBottom: 8 }}>
                    <View
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: 36,
                            backgroundColor: colors.soft,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name="lock-closed" size={32} color={colors.primary} />
                    </View>
                </View>

                <Card>
                    <Text style={{ fontSize: 18, fontWeight: "800", textAlign: "center" }}>
                        Unlock Premium Insights
                    </Text>
                    <Text style={{ marginTop: 8, textAlign: "center", color: colors.muted }}>
                        Upgrade to access detailed overtime tracking.
                    </Text>

                    <View style={{ marginTop: 14, gap: 10 }}>
                        <Card.InfoBox
                            tone="primary"
                            title="Here's what you're missing out on:"
                            text="• Detailed breakdown of overtime hours\n• Export reports to manage earnings\n• Better work-life balance insights"
                        />
                    </View>

                    <View style={{ marginTop: 14 }}>
                        <Button
                            label="Upgrade to Premium"
                            onPress={() => setPremium(true)}
                        />
                    </View>
                </Card>
            </View>
        </Screen>
    );
}