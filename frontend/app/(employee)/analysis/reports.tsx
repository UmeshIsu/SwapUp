import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import HeaderSimple from '@/src/components/layout/HeaderSimple';
import HeaderBar from '@/src/components/layout/HeaderBar';
import { ThemedView } from '@/src/components/themed-view';
import { ThemedText } from '@/src/components/themed-text';
import Card from '@/src/components/ui/card';
import Button from '@/src/components/ui/Button';
import { colors } from '@/src/constants/colors';
import { monthOptions } from '@/src/data/mock';
import { BASE_URL, getAuthToken } from '@/src/services/apiClient';

export default function ReportsScreen() {
    const [month, setMonth] = useState(monthOptions[0].value);
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const token = await getAuthToken();
            const url = `${BASE_URL}/analytics/export?month=${month}`;

            // Download CSV file
            const fileUri = `${FileSystem.documentDirectory}analytics-${month}.csv`;
            const result = await FileSystem.downloadAsync(url, fileUri, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (result.status !== 200) {
                Alert.alert('Error', 'Failed to download the report. Please try again.');
                return;
            }

            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(result.uri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Export Attendance Report',
                    UTI: 'public.comma-separated-values-text',
                });
            } else {
                Alert.alert('Success', `Report saved to ${result.uri}`);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to export report');
        } finally {
            setLoading(false);
        }
    };

    const [y, m] = month.split('-').map(Number);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthLabel = `${monthNames[m - 1]} ${y}`;

    return (
        <ThemedView style={styles.container}>
            <HeaderSimple title="Export Reports" />

            <View style={styles.headerRow}>
                <HeaderBar title="" monthValue={month} onMonthChange={setMonth} />
            </View>

            <View style={styles.content}>
                <Card style={styles.exportCard}>
                    <View style={styles.exportIcon}>
                        <Ionicons name="document-text-outline" size={48} color={colors.primary} />
                    </View>
                    <ThemedText style={styles.exportTitle}>Monthly Attendance Report</ThemedText>
                    <ThemedText style={styles.exportSubtitle}>
                        Export your attendance data for {monthLabel} as a CSV file. The report includes:
                    </ThemedText>

                    <View style={styles.featureList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <ThemedText style={styles.featureText}>Shift schedules & check-in/out times</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <ThemedText style={styles.featureText}>Punctuality status (On Time / Late / Absent)</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <ThemedText style={styles.featureText}>Overtime hours per shift</ThemedText>
                        </View>
                    </View>

                    <Button
                        label={loading ? "Exporting..." : "Download CSV Report"}
                        onPress={handleExport}
                        style={styles.exportBtn}
                    />
                    {loading && (
                        <ActivityIndicator style={{ marginTop: 12 }} color={colors.primary} />
                    )}
                </Card>

                <Card style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                        <ThemedText style={styles.infoText}>
                            The exported file can be opened in Excel, Google Sheets, or any spreadsheet application.
                        </ThemedText>
                    </View>
                </Card>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    headerRow: {
        marginTop: -10,
        marginBottom: 10,
        paddingHorizontal: 16,
    },
    content: {
        flex: 1,
        padding: 16,
        gap: 16,
    },
    exportCard: {
        padding: 24,
        alignItems: 'center',
    },
    exportIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.soft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    exportTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    exportSubtitle: {
        fontSize: 14,
        color: colors.muted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    featureList: {
        width: '100%',
        gap: 10,
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontSize: 13,
        color: colors.text,
    },
    exportBtn: {
        width: '100%',
        borderRadius: 10,
    },
    infoCard: {
        backgroundColor: colors.soft,
        borderColor: colors.primary + '20',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: colors.muted,
        lineHeight: 18,
    },
});