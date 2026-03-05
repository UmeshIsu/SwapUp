import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/components/layout/Screen";
import Card from "../../src/components/ui/Card";
import Button from "../../src/components/ui/Button";

export default function ExportReportModal() {
    const router = useRouter();

    return (
        <Screen center>
            <View style={{ width: "100%", gap: 12 }}>
                <Card>
                    <Text style={{ fontSize: 18, fontWeight: "800" }}>Export Report</Text>
                    <Text style={{ marginTop: 8, opacity: 0.7 }}>
                        This is a placeholder modal. Later you can export PDF/CSV here.
                    </Text>

                    <View style={{ marginTop: 14, gap: 10 }}>
                        <Button label="Export as PDF (mock)" onPress={() => { }} />
                        <Button label="Close" variant="secondary" onPress={() => router.back()} />
                    </View>
                </Card>
            </View>
        </Screen>
    );
}