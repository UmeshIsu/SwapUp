import { palette } from '@/src/constants/palette';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

type AttendanceStatus = 'open' | 'completed' | 'none';

interface Props {
    status: AttendanceStatus;
    checkedInAt?: string | null;
    onCheckIn: () => void;
    onCheckOut: () => void;
    style?: any;
}

function formatTime(iso?: string | null): string {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch { return ''; }
}

export default function AttendanceStatusCard({ status, checkedInAt, onCheckIn, onCheckOut, style }: Props) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const C = {
        card: theme.surface,
        text: theme.text,
        textMuted: theme.textMuted,
        primary: theme.primary,
        success: theme.success,
        successText: theme.success,
        successSoft: theme.successBg,
        danger: theme.danger,
    };

    const styles = StyleSheet.create({
        card: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, backgroundColor: C.card, borderRadius: 16,
            paddingVertical: 14, paddingHorizontal: 16,
            shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.04,
            shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
        },
        left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
        dot: { width: 10, height: 10, borderRadius: 5 },
        eyebrow: { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 0.8 },
        value: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 2 },
        meta: { fontSize: 12, color: C.textMuted, marginTop: 2, fontWeight: '500' },
        pill: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24 },
        pillIn: { backgroundColor: C.primary },
        pillOut: { backgroundColor: isDark ? '#3A1515' : '#FEF2F2', borderWidth: 1.5, borderColor: isDark ? '#7A3030' : '#FECACA' },
        pillDone: { backgroundColor: C.successSoft },
        pillText: { fontSize: 14, fontWeight: '700' },
    });

    const isOnDuty = status === 'open';
    const isComplete = status === 'completed';

    return (
        <View style={[styles.card, style]}>
            <View style={styles.left}>
                <View style={[styles.dot, { backgroundColor: isOnDuty ? C.success : C.textMuted }]} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.eyebrow}>ATTENDANCE</Text>
                    <Text style={styles.value}>
                        {isOnDuty ? 'On Duty' : isComplete ? 'Shift Complete' : 'Off Duty'}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                        {isOnDuty
                            ? checkedInAt ? `Checked in at ${formatTime(checkedInAt)}` : 'You are clocked in'
                            : isComplete ? "You've checked out for today"
                            : 'Scan the restaurant QR to start'}
                    </Text>
                </View>
            </View>

            {isComplete ? (
                <View style={[styles.pill, styles.pillDone]}>
                    <Ionicons name="checkmark" size={16} color={C.success} />
                    <Text style={[styles.pillText, { color: C.successText }]}>Done</Text>
                </View>
            ) : isOnDuty ? (
                <TouchableOpacity style={[styles.pill, styles.pillOut]} onPress={onCheckOut} activeOpacity={0.85}>
                    <Ionicons name="log-out-outline" size={16} color={C.danger} />
                    <Text style={[styles.pillText, { color: C.danger }]}>Check Out</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={[styles.pill, styles.pillIn]} onPress={onCheckIn} activeOpacity={0.85}>
                    <Ionicons name="qr-code-outline" size={16} color="#fff" />
                    <Text style={[styles.pillText, { color: '#fff' }]}>Scan to Check In</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
