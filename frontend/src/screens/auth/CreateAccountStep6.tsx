import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function CreateAccountStep6({ value, onChange, error }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Verify Your Identity</Text>
            <Text style={styles.subtitle}>
                Please enter the unique worker ID provided by your manager.
            </Text>

            <Text style={styles.label}>Worker ID</Text>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Worker ID"
                placeholderTextColor="#999"
                value={value}
                onChangeText={onChange}
                autoFocus
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
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
    input: {
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
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 6,
    },
});
