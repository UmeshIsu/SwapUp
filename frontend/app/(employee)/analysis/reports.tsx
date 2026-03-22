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
import { useColors } from '@/src/constants/colors';
import { monthOptions } from '@/src/data/mock';
import { BASE_URL, getAuthToken } from '@/src/services/apiClient';

export default function ReportsScreen() {
    const [month, setMonth] = useState(monthOptions[0].value);
    const [loading, setLoading] = useState(false);
    const c = useColors();

    const handleExport = async () => {
        try {
            setLoading(true);
            const token = await getAuthToken();
            const url = `${BASE_URL}/analytics/export?month=${month}`;

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
        <ThemedView style={[styles.container, { backgroundColor: c.bg }]}>
            <HeaderSimple title="Export Reports" />

            <View style={styles.headerRow}>
                <HeaderBar title="" monthValue={month} onMonthChange={setMonth} />
            </View>

            <View style={styles.content}>
                <Card style={styles.exportCard}>
                    <View style={[styles.exportIcon, { backgroundColor: c.soft }]}>
                        <Ionicons name="document-text-outline" size={48} color={c.primary} />
                    </View>
                    <ThemedText style={[styles.exportTitle, { color: c.text }]}>Monthly Attendance Report</ThemedText>
                    <ThemedText style={[styles.exportSubtitle, { color: c.muted }]}>
                        Export your attendance data for {monthLabel} as a CSV file. The report includes:
                    </ThemedText>

                    <View style={styles.featureList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={16} color={c.success} />
                            <ThemedText style={[styles.featureText, { color: c.text }]}>Shift schedules & check-in/out times</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={16} color={c.success} />
                            <ThemedText style={[styles.featureText, { color: c.text }]}>Punctuality status (On Time / Late / Absent)</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={16} color={c.success} />
                            <ThemedText style={[styles.featureText, { color: c.text }]}>Overtime hours per shift</ThemedText>
                        </View>
                    </View>

                    <Button
                        label={loading ? "Exporting..." : "Download CSV Report"}
                        onPress={handleExport}
                        style={styles.exportBtn}
                    />
                    {loading && (
                        <ActivityIndicator style={{ marginTop: 12 }} color={c.primary} />
                    )}
                </Card>

                <Card style={[styles.infoCard, { backgroundColor: c.soft, borderColor: c.primary + '20' }]}>
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle-outline" size={20} color={c.primary} />
                        <ThemedText style={[styles.infoText, { color: c.muted }]}>
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
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    exportTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    exportSubtitle: {
        fontSize: 14,
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
    },
    exportBtn: {
        width: '100%',
        borderRadius: 10,
    },
    infoCard: {},
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
});