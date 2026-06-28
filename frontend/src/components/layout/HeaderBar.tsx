import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../constants/colors";

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function formatLabel(value: string) {
    const [year, month] = value.split('-');
    return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

function shiftMonth(value: string, delta: number) {
    const [year, month] = value.split('-').map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return `${y}-${m < 10 ? '0' + m : m}`;
}

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

    const prev = () => onMonthChange(shiftMonth(monthValue, -1));
    const next = () => onMonthChange(shiftMonth(monthValue, +1));

    return (
        <View style={styles.row}>
            <Text style={[styles.title, { color: c.text }]}>{title}</Text>

            <View style={[styles.pill, { backgroundColor: c.cardBg, borderColor: c.border }]}>
                <Pressable onPress={prev} style={styles.iconBtn}>
                    <Ionicons name="chevron-back" size={16} color={c.text} />
                </Pressable>

                <Text style={[styles.pillText, { color: c.text }]}>{formatLabel(monthValue)}</Text>

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