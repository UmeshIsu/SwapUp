import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function CreateAccountStep1({ value, onChange, error }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Let us know your hotel name?</Text>

            <Text style={styles.label}>Hotel Name</Text>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Hotel Name"
                placeholderTextColor="#AAAAAA"
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
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 32,
        lineHeight: 36,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#EBEBEB',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 15,
        color: '#111827',
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