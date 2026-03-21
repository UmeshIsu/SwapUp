import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "@/src/components/themed-text";
import { useColors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";

interface WarningBannerProps {
    text: string;
    style?: ViewStyle;
}

export default function WarningBanner({ text, style }: WarningBannerProps) {
    const c = useColors();
    return (
        <View style={[styles.container, { backgroundColor: c.warning + "20" }, style]}>
            <Ionicons name="warning" size={20} color={c.warning} style={styles.icon} />
            <ThemedText style={[styles.text, { color: c.text }]}>{text}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 12,
        borderRadius: 8,
        alignItems: "flex-start",
    },
    icon: {
        marginRight: 8,
        marginTop: 2,
    },
    text: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
});
