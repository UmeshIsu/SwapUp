import React from "react";
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from "react-native";
import { useColors, colors as staticColors } from "@/src/constants/colors";
import { spacing } from "@/src/constants/spacing";
import { Ionicons } from "@expo/vector-icons";

function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
    const c = useColors();
    return <View style={[styles.card, { backgroundColor: c.cardBg, borderColor: c.border }, style]}>{children}</View>;
}

Card.Title = function Title({ children }: { children: React.ReactNode }) {
    const c = useColors();
    return <Text style={[styles.title, { color: c.text }]}>{children}</Text>;
};

Card.SubText = function SubText({ children }: { children: React.ReactNode }) {
    const c = useColors();
    return <Text style={[styles.sub, { color: c.muted }]}>{children}</Text>;
};

Card.BigStat = function BigStat({
    value,
    tone,
}: {
    value: string;
    tone?: "primary" | "success" | "danger";
}) {
    const c = useColors();
    const color =
        tone === "success" ? c.success : tone === "danger" ? c.danger : tone === "primary" ? c.primary : c.text;
    return <Text style={[styles.big, { color }]}>{value}</Text>;
};

Card.StatRow = function StatRow({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone?: "success" | "danger" | "primary";
}) {
    const c = useColors();
    const color =
        tone === "success" ? c.success : tone === "danger" ? c.danger : tone === "primary" ? c.primary : c.text;

    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[styles.sub, { color: c.muted }]}>{label}</Text>
            <Text style={{ fontWeight: "800", color }}>{value}</Text>
        </View>
    );
};

Card.LockedHint = function LockedHint({ text }: { text: string }) {
    const c = useColors();
    return (
        <View style={[styles.locked, { backgroundColor: c.soft }]}>
            <Ionicons name="lock-closed" size={16} color={c.primary} />
            <Text style={[styles.lockedText, { color: c.muted }]}>{text}</Text>
        </View>
    );
};

Card.InfoBox = function InfoBox({
    tone,
    title,
    text,
}: {
    tone: "success" | "danger" | "primary";
    title: string;
    text: string;
}) {
    const c = useColors();
    const bg = tone === "success" ? (c === staticColors ? "#EAF7EE" : "#1A2E1A") : tone === "danger" ? (c === staticColors ? "#FDECEC" : "#2E1A1A") : c.soft;
    const ic = tone === "success" ? "checkmark-circle" : tone === "danger" ? "alert-circle" : "information-circle";
    const iconColor = tone === "success" ? c.success : tone === "danger" ? c.danger : c.primary;

    return (
        <View style={[styles.info, { backgroundColor: bg }]}>
            <Ionicons name={ic as any} size={18} color={iconColor} />
            <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "800", color: c.text }}>{title}</Text>
                <Text style={{ marginTop: 4, color: c.muted, lineHeight: 18 }}>{text}</Text>
            </View>
        </View>
    );
};

Card.StatPill = function StatPill({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone?: "primary";
}) {
    const c = useColors();
    return (
        <View style={[styles.pill, { borderColor: c.border }]}>
            <Text style={[styles.pillLabel, { color: c.muted }]}>{label}</Text>
            <Text style={[styles.pillValue, { color: tone === "primary" ? c.primary : c.text }]}>{value}</Text>
        </View>
    );
};

Card.LinkButton = function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
    const c = useColors();
    return (
        <Pressable onPress={onPress} style={[styles.linkBtn, { borderColor: c.border }]}>
            <Text style={[styles.linkText, { color: c.text }]}>{label}</Text>
        </Pressable>
    );
};

export default Card;

const styles = StyleSheet.create({
    card: {
        borderRadius: spacing.radius,
        borderWidth: 1,
        padding: 14,
    },
    title: { fontSize: 13, fontWeight: "800" },
    sub: { fontSize: 12, lineHeight: 16 },
    big: { fontSize: 28, fontWeight: "900" },

    locked: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        borderRadius: 12,
        padding: 10,
    },
    lockedText: { flex: 1, fontSize: 12, lineHeight: 16 },

    info: {
        flexDirection: "row",
        gap: 10,
        borderRadius: 12,
        padding: 10,
    },
    pill: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        gap: 4,
    },
    pillLabel: { fontSize: 12, fontWeight: "700" },
    pillValue: { fontSize: 16, fontWeight: "900" },
    linkBtn: {
        borderWidth: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
    },
    linkText: { fontWeight: "900" },
});