import type { FieldErrors } from '@/app/(auth)/register';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    firstName: string;
    lastName: string;
    onChangeFirstName: (value: string) => void;
    onChangeLastName: (value: string) => void;
    errors?: FieldErrors;
}

export default function CreateAccountStep2({
    firstName,
    lastName,
    onChangeFirstName,
    onChangeLastName,
    errors = {},
}: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>What's your name?</Text>
            <Text style={styles.subtitle}>
                Please enter your full name as it appears on your official documents.
            </Text>

            <Text style={styles.label}>First Name</Text>
            <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="First Name"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={onChangeFirstName}
                autoFocus
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

            <Text style={[styles.label, { marginTop: errors.firstName ? 12 : 0 }]}>Last Name</Text>
            <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Last Name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={onChangeLastName}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
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
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
        marginBottom: 0,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 6,
        marginBottom: 8,
    },
});
