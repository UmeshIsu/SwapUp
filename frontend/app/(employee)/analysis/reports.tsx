import React from 'react';
import { StyleSheet } from 'react-native';
import HeaderSimple from '@/src/components/layout/HeaderSimple';
import { ThemedView } from '@/src/components/themed-view';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/colors';

export default function ReportsScreen() {
    return (
        <ThemedView style={styles.container}>
            <HeaderSimple title="Reports" />
            <ThemedView style={styles.content}>
                <ThemedText type="title">Monthly Attendance Report</ThemedText>
                <ThemedText style={styles.description}>
                    View and export your attendance reports here.
                </ThemedText>
                {/* Reports content will go here */}
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        flex: 1,
        padding: 20,
        gap: 12,
    },
    description: {
        fontSize: 16,
        color: colors.muted,
    },
});