import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "@/src/constants/colors";
import { spacing } from "@/src/constants/spacing";
import { Ionicons } from "@expo/vector-icons";

function Card({ children }: { children: React.ReactNode }) {
    return <View style={styles.card}>{children}</View>;
}

Card.Title = function Title({ children }: { children: React.ReactNode }) {
    return <Text style={styles.title}>{children}</Text>;
};

Card.SubText = function SubText({ children }: { children: React.ReactNode }) {
    return <Text style={styles.sub}>{children}</Text>;
};

Card.BigStat = function BigStat({
    value,
    tone,
}: {
    value: string;
    tone?: "primary" | "success" | "danger";
}) {
    const color =
        tone === "success" ? colors.success : tone === "danger" ? colors.danger : tone === "primary" ? colors.primary : colors.text;
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
    const color =
        tone === "success" ? colors.success : tone === "danger" ? colors.danger : tone === "primary" ? colors.primary : colors.text;

    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.sub}>{label}</Text>
            <Text style={{ fontWeight: "800", color }}>{value}</Text>
        </View>
    );
};

Card.LockedHint = function LockedHint({ text }: { text: string }) {
    return (
        <View style={styles.locked}>
            <Ionicons name="lock-closed" size={16} color={colors.primary} />
            <Text style={styles.lockedText}>{text}</Text>
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
    const bg = tone === "success" ? "#EAF7EE" : tone === "danger" ? "#FDECEC" : colors.soft;
    const ic = tone === "success" ? "checkmark-circle" : tone === "danger" ? "alert-circle" : "information-circle";
    const c = tone === "success" ? colors.success : tone === "danger" ? colors.danger : colors.primary;

    return (
        <View style={[styles.info, { backgroundColor: bg }]}>
            <Ionicons name={ic as any} size={18} color={c} />
            <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "800", color: colors.text }}>{title}</Text>
                <Text style={{ marginTop: 4, color: colors.muted, lineHeight: 18 }}>{text}</Text>
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
    return (
        <View style={styles.pill}>
            <Text style={styles.pillLabel}>{label}</Text>
            <Text style={[styles.pillValue, tone === "primary" && { color: colors.primary }]}>{value}</Text>
        </View>
    );
};

Card.LinkButton = function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={styles.linkBtn}>
            <Text style={styles.linkText}>{label}</Text>
        </Pressable>
    );
};

export default Card;

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: spacing.radius,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
    },
    title: { fontSize: 13, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.muted, lineHeight: 16 },
    big: { fontSize: 28, fontWeight: "900" },

    locked: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        backgroundColor: colors.soft,
        borderRadius: 12,
        padding: 10,
    },
    lockedText: { flex: 1, fontSize: 12, color: colors.muted, lineHeight: 16 },

    info: {
        flexDirection: "row",
        gap: 10,
        borderRadius: 12,
        padding: 10,
    },
    pill: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        padding: 12,
        gap: 4,
    },
    pillLabel: { fontSize: 12, color: colors.muted, fontWeight: "700" },
    pillValue: { fontSize: 16, fontWeight: "900", color: colors.text },
    linkBtn: {
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
    },
    linkText: { fontWeight: "900", color: colors.text },
});