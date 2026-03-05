import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "../themed-text";
import { colors } from "../../constants/colors";

interface BarChartProps {
    labels: string[];
    values: number[];
    style?: ViewStyle;
    height?: number;
}

export default function BarChart({ labels, values, style, height = 150 }: BarChartProps) {
    const maxValue = Math.max(...values, 1); // Avoid division by zero

    return (
        <View style={[styles.container, { height }, style]}>
            {values.map((val, index) => {
                const barHeightPercent = (val / maxValue) * 100;
                return (
                    <View key={index} style={styles.barColumn}>
                        <View style={styles.barBackground}>
                            <View style={[styles.barFill, { height: `${barHeightPercent}%` }]} />
                        </View>
                        <ThemedText style={styles.label}>{labels[index]}</ThemedText>
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
        backgroundColor: colors.light,
        borderRadius: 4,
        justifyContent: "flex-end",
        overflow: "hidden",
    },
    barFill: {
        width: "100%",
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    label: {
        marginTop: 8,
        fontSize: 12,
        color: colors.muted,
    },
});
