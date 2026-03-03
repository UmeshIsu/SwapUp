import React from 'react';
import { StyleSheet } from 'react-native';
import { HeaderBar } from '@/src/components/layout/HeaderBar';
import { ThemedView } from '@/src/components/themed-view';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/colors';

export default function ReportsScreen() {
    return (
        <ThemedView style={styles.container}>
            <HeaderBar title="Reports" />
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
        backgroundColor: colors.background.light,
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