import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "../themed-text";
import { colors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

interface WarningBannerProps {
    text: string;
    style?: ViewStyle;
}

export default function WarningBanner({ text, style }: WarningBannerProps) {
    return (
        <View style={[styles.container, style]}>
            <Ionicons name="warning" size={20} color={colors.warning || "#F59E0B"} style={styles.icon} />
            <ThemedText style={styles.text}>{text}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: (colors.warning || "#F59E0B") + "20", // 20% opacity
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
        color: colors.dark,
        fontSize: 14,
        lineHeight: 20,
    },
});
