import { StyleSheet, TouchableOpacity, ScrollView, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/src/components/themed-text";
import { ThemedView } from "@/src/components/themed-view";
import { colors } from "../../../src/constants/colors";

const analysisItems = [
    {
        title: "Overview",
        description: "Summary of employee performance and metrics",
        icon: "bar-chart",
        href: "/analysis/overview",
    },
    {
        title: "Punctuality",
        description: "Track attendance and check-in/out times",
        icon: "time",
        href: "/analysis/punctuality",
    },
    {
        title: "Absenteeism",
        description: "Monitor employee leave and absence patterns",
        icon: "calendar",
        href: "/analysis/absentee",
    },
    {
        title: "Reports",
        description: "Detailed analysis reports and statistics",
        icon: "document-text",
        href: "/analysis/reports",
    },
];

export default function AnalysisIndex() {
    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Employee Analysis</ThemedText>
                <ThemedText style={styles.subtitle}>Select a category to view detailed analysis</ThemedText>
            </ThemedView>

            <View style={styles.itemsContainer}>
                {analysisItems.map((item, index) => (
                    <Link key={index} href={item.href as any} asChild>
                        <TouchableOpacity style={styles.itemCard}>
                            <View style={styles.iconContainer}>
                                <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                            </View>
                            <View style={styles.itemTextContent}>
                                <ThemedText type="subtitle" style={styles.itemTitle}>{item.title}</ThemedText>
                                <ThemedText style={styles.itemDescription}>{item.description}</ThemedText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                        </TouchableOpacity>
                    </Link>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        padding: 24,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    subtitle: {
        marginTop: 8,
        color: colors.muted,
    },
    itemsContainer: {
        padding: 16,
    },
    itemCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + "10",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    itemTextContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    itemDescription: {
        fontSize: 14,
        color: colors.muted,
        marginTop: 2,
    },
});
