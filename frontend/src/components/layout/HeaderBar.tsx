import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../constants/colors";
import { monthOptions } from "../../data/mock";

export default function HeaderBar({
    title,
    monthValue,
    onMonthChange,
}: {
    title: string;
    monthValue: string;
    onMonthChange: (v: string) => void;
}) {
    const c = useColors();
    const idx = monthOptions.findIndex((m) => m.value === monthValue);
    const label = monthOptions[idx]?.label ?? "Select";

    const prev = () => onMonthChange(monthOptions[Math.max(0, idx - 1)].value);
    const next = () => onMonthChange(monthOptions[Math.min(monthOptions.length - 1, idx + 1)].value);

    return (
        <View style={styles.row}>
            <Text style={[styles.title, { color: c.text }]}>{title}</Text>

            <View style={[styles.pill, { backgroundColor: c.cardBg, borderColor: c.border }]}>
                <Pressable onPress={prev} style={styles.iconBtn}>
                    <Ionicons name="chevron-back" size={16} color={c.text} />
                </Pressable>

                <Text style={[styles.pillText, { color: c.text }]}>{label}</Text>

                <Pressable onPress={next} style={styles.iconBtn}>
                    <Ionicons name="chevron-forward" size={16} color={c.text} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 18, fontWeight: "800" },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 6,
        gap: 6,
    },
    pillText: { fontSize: 12, fontWeight: "700" },
    iconBtn: { padding: 4 },
});