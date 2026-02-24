import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function CreateAccountStep3({ value, onChange, error }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Enter your mobile number</Text>
            <Text style={styles.subtitle}>Use for verification and shift alerts</Text>

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneRow}>
                <View style={[styles.countryCode, error && styles.inputError]}>
                    <Text style={styles.flag}>🇱🇰</Text>
                    <Text style={styles.code}>+94</Text>
                    <Text style={styles.chevron}>▾</Text>
                </View>
                <TextInput
                    style={[styles.phoneInput, error && styles.inputError]}
                    placeholder="70 XXX XXXX"
                    placeholderTextColor={error ? '#EF4444' : '#999'}
                    value={value}
                    onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                    keyboardType="phone-pad"
                    maxLength={10}
                    autoFocus
                />
            </View>
            {error && (
                <View style={styles.errorRow}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Text style={styles.errorIcon}>⚠</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    heading: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 8,
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        lineHeight: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    phoneRow: {
        flexDirection: 'row',
        gap: 10,
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 16,
        gap: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    flag: {
        fontSize: 18,
    },
    code: {
        fontSize: 16,
        color: '#1A1A2E',
        fontWeight: '500',
    },
    chevron: {
        fontSize: 12,
        color: '#666',
    },
    phoneInput: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1A1A2E',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
    },
    errorIcon: {
        color: '#EF4444',
        fontSize: 13,
    },
});
