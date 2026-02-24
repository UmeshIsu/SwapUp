import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function CreateAccountStep4({ value, onChange, error }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Enter your email</Text>
            <Text style={styles.subtitle}>
                We'll send a verification code to confirm your email address.
            </Text>

            <Text style={styles.label}>Email Address</Text>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
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
