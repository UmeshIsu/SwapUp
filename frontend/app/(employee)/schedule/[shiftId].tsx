import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { Colors } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { apiCall } from '@/src/services/api';

type ShiftDetails = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    instructions?: string;
};

export default function ShiftDetailsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { token } = useAuth();
    const params = useLocalSearchParams<{
        shiftId?: string;
        date?: string;
        startTime?: string;
        endTime?: string;
        type?: string;
        instructions?: string;
    }>();

    const [shift, setShift] = useState<ShiftDetails | null>(
        params.shiftId
            ? {
                id: params.shiftId,
                date: params.date ?? '',
                startTime: params.startTime ?? '',
                endTime: params.endTime ?? '',
                type: params.type ?? 'Shift',
                instructions: params.instructions ?? '',
            }
            : null
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadShift = async () => {
            if (!params.shiftId || params.instructions || !token || token === 'mock-token') {
                return;
            }

            try {
                setIsLoading(true);
                const data = await apiCall(`/shifts/${params.shiftId}`, { token });
                setShift(data);
            } catch {
                // Keep fallback values from params if API fetch fails.
            } finally {
                setIsLoading(false);
            }
        };

        loadShift();
    }, [params.instructions, params.shiftId, token]);

    const shiftDate = shift?.date ? new Date(shift.date) : null;

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <ThemedText type="title" style={styles.title}>{shift?.type ?? 'Shift'} Details</ThemedText>

            {isLoading ? <ActivityIndicator size="large" color={theme.tint} /> : null}

            <ThemedView style={styles.card}>
                <ThemedText style={styles.label}>Shift ID</ThemedText>
                <ThemedText>{shift?.id ?? 'N/A'}</ThemedText>

                <ThemedText style={styles.label}>Date</ThemedText>
                <ThemedText>
                    {shiftDate ? shiftDate.toLocaleDateString() : 'Not available'}
                </ThemedText>

                <ThemedText style={styles.label}>Time</ThemedText>
                <ThemedText>{shift?.startTime ?? '--:--'} - {shift?.endTime ?? '--:--'}</ThemedText>

                <ThemedText style={styles.label}>Instructions</ThemedText>
                <ThemedText>{shift?.instructions || 'No special instructions for this shift.'}</ThemedText>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 40,
    },
    title: {
        marginBottom: 18,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    label: {
        marginTop: 12,
        marginBottom: 4,
        color: '#777',
        fontSize: 12,
    },
});
