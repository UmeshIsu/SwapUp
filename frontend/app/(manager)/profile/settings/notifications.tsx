import React, { useState } from 'react';
import { StyleSheet, ScrollView, Switch, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { IconSymbol } from '@/src/components/ui/icon-symbol';

type NotificationMethod = 'in-app' | 'sms' | 'whatsapp';

export default function NotificationSettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [shiftReminders, setShiftReminders] = useState(true);
    const [shiftSwapUpdate, setShiftSwapUpdate] = useState(true);
    const [managerMessages, setManagerMessages] = useState(true);
    const [urgentAlerts, setUrgentAlerts] = useState(true);
    const [notificationMethod, setNotificationMethod] = useState<NotificationMethod>('in-app');

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={theme.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Notification Settings</ThemedText>
                <View style={{ width: 24 }} />
            </ThemedView>

            {/* Shift and Schedule Updates */}
            <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Shift and Schedule Updates</ThemedText>
                
                <ToggleItem 
                    icon="bell.fill" 
                    label="Shift Reminders" 
                    value={shiftReminders}
                    onValueChange={setShiftReminders}
                />
                <ToggleItem 
                    icon="bell.fill" 
                    label="Shift Swap Update" 
                    value={shiftSwapUpdate}
                    onValueChange={setShiftSwapUpdate}
                />
            </ThemedView>

            {/* Important Communication */}
            <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Important Communication</ThemedText>
                
                <ToggleItem 
                    icon="shield.fill" 
                    label="Manager Messages" 
                    value={managerMessages}
                    onValueChange={setManagerMessages}
                />
                <ToggleItem 
                    icon="exclamationmark.triangle.fill" 
                    label="Urgent Alerts" 
                    value={urgentAlerts}
                    onValueChange={setUrgentAlerts}
                />
            </ThemedView>

            {/* Receive Notification via */}
            <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Receive Notification via</ThemedText>
                
                <RadioItem 
                    label="In-app" 
                    selected={notificationMethod === 'in-app'}
                    onPress={() => setNotificationMethod('in-app')}
                />
                <RadioItem 
                    label="SMS" 
                    selected={notificationMethod === 'sms'}
                    onPress={() => setNotificationMethod('sms')}
                />
                <RadioItem 
                    label="WhatsApp" 
                    selected={notificationMethod === 'whatsapp'}
                    onPress={() => setNotificationMethod('whatsapp')}
                />
            </ThemedView>
        </ScrollView>
    );
}

function ToggleItem({ 
    icon, 
    label, 
    value, 
    onValueChange 
}: { 
    icon: string; 
    label: string; 
    value: boolean; 
    onValueChange: (value: boolean) => void;
}) {
    const colorScheme = useColorScheme();
    
    return (
        <View style={[styles.toggleRow, { backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#F9F9F9' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colorScheme === 'dark' ? '#3C3C3C' : '#E8E8E8' }]}>
                <IconSymbol name={icon} size={20} color="#888" />
            </View>
            <ThemedText style={styles.toggleLabel}>{label}</ThemedText>
            <Switch 
                value={value} 
                onValueChange={onValueChange} 
                trackColor={{ true: '#3498db', false: '#D1D5DB' }}
                ios_backgroundColor="#D1D5DB"
            />
        </View>
    );
}

function RadioItem({ 
    label, 
    selected,
    onPress 
}: { 
    label: string; 
    selected: boolean;
    onPress: () => void;
}) {
    const colorScheme = useColorScheme();
    
    return (
        <TouchableOpacity 
            style={[styles.radioRow, { backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#F9F9F9' }]}
            onPress={onPress}
        >
            <ThemedText style={styles.radioLabel}>{label}</ThemedText>
            <View style={[styles.radioOuter, { borderColor: selected ? '#3498db' : '#D1D5DB' }]}>
                {selected && <View style={styles.radioInner} />}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    toggleLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    radioRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    radioLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3498db',
    },
});
