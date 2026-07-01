import { palette } from '@/src/constants/palette';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

export default function LeaveSent() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const styles = makeStyles(theme, isDark);

    const params = useLocalSearchParams<{
        leaveTypeName: string;
        startDate: string;
        endDate: string;
    }>();

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* Success checkmark and title */}
            <View style={styles.centerContent}>
                <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text style={styles.title}>Leave Request Sent!</Text>
                <Text style={styles.subtitle}>
                    Your request has been submitted and is now waiting for manager approval.
                </Text>
            </View>

            {/* Summary card */}
            {params.leaveTypeName ? (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Request Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Leave Type</Text>
                        <Text style={styles.summaryValue}>{params.leaveTypeName}</Text>
                    </View>
                    {params.startDate ? (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>From</Text>
                            <Text style={styles.summaryValue}>{formatDate(params.startDate)}</Text>
                        </View>
                    ) : null}
                    {params.endDate ? (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>To</Text>
                            <Text style={styles.summaryValue}>{formatDate(params.endDate)}</Text>
                        </View>
                    ) : null}
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Status</Text>
                        <Text style={styles.statusBadge}>Pending</Text>
                    </View>
                </View>
            ) : null}

            {/* Action Buttons */}
            <TouchableOpacity
                style={styles.viewPendingButton}
                onPress={() => router.replace('/(employee)/leave/requestStatus' as any)}
            >
                <Text style={styles.viewPendingText}>View Request Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.replace('/(employee)/leave')}
            >
                <Text style={styles.homeButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const makeStyles = (theme: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        padding: 24,
        justifyContent: 'center',
    },
    centerContent: {
        alignItems: 'center',
        marginBottom: 30,
    },
    checkCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkMark: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: theme.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    summaryCard: {
        backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5',
        borderRadius: 14,
        padding: 18,
        marginBottom: 24,
        borderWidth: isDark ? 1 : 0,
        borderColor: isDark ? '#2C2C2C' : 'transparent',
    },
    summaryTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: theme.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.text,
    },
    statusBadge: {
        fontSize: 13,
        fontWeight: '600',
        color: isDark ? '#FDE68A' : '#F57C00',
        backgroundColor: isDark ? '#2A1F00' : '#FFF3E0',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        overflow: 'hidden',
    },
    viewPendingButton: {
        backgroundColor: palette.primary,
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    viewPendingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    homeButton: {
        borderWidth: 1.5,
        borderColor: theme.primary,
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    homeButtonText: {
        color: theme.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});
