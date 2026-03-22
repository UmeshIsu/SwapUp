import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "@/src/components/themed-text";
import { useColors } from "@/src/constants/colors";

interface BarChartProps {
    labels: string[];
    values: number[];
    style?: ViewStyle;
    height?: number;
}

export default function BarChart({ labels, values, style, height = 150 }: BarChartProps) {
    const c = useColors();
    const maxValue = Math.max(...values, 1);

    return (
        <View style={[styles.container, { height }, style]}>
            {values.map((val, index) => {
                const barHeightPercent = (val / maxValue) * 100;
                return (
                    <View key={index} style={styles.barColumn}>
                        <View style={[styles.barBackground, { backgroundColor: c.soft }]}>
                            <View style={[styles.barFill, { height: `${barHeightPercent}%`, backgroundColor: c.primary }]} />
                        </View>
                        <ThemedText style={[styles.label, { color: c.muted }]}>{labels[index]}</ThemedText>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingTop: 20,
    },
    barColumn: {
        alignItems: "center",
        flex: 1,
    },
    barBackground: {
        width: 24,
        flex: 1,
        borderRadius: 4,
        justifyContent: "flex-end",
        overflow: "hidden",
    },
    barFill: {
        width: "100%",
        borderRadius: 4,
    },
    label: {
        marginTop: 8,
        fontSize: 12,
    },
});
