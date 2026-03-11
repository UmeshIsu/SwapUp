import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

interface OvertimeLogItemProps {
    date: string;
    timeRange: string;
    duration: string;
}

export default function OvertimeLogItem({ date, timeRange, duration }: OvertimeLogItemProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.dateText}>{date}</Text>
                <Text style={styles.timeText}>{timeRange}</Text>
            </View>
            <View style={styles.durationContainer}>
                <Text style={styles.durationText}>{duration}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.soft,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    dateText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 2,
    },
    timeText: {
        fontSize: 14,
        color: colors.muted,
    },
    durationContainer: {
        backgroundColor: colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    durationText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: "bold",
    },
});
