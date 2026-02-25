import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const DEPARTMENTS = ['Chinese Restaurant', 'Indian Restaurant', 'Other'];

export default function CreateAccountStep_Department({ value, onChange, error }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Choose Your Department</Text>
            <Text style={styles.subtitle}>
                Choose the department that you want to make the roaster
            </Text>

            <View style={styles.optionsContainer}>
                {DEPARTMENTS.map((dept) => (
                    <TouchableOpacity
                        key={dept}
                        style={[
                            styles.option,
                            value === dept && styles.optionSelected,
                        ]}
                        onPress={() => onChange(dept)}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                value === dept && styles.optionTextSelected,
                            ]}
                        >
                            {dept}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
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
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 28,
        lineHeight: 20,
    },
    optionsContainer: {
        gap: 14,
    },
    option: {
        backgroundColor: '#1373D0',
        borderRadius: 14,
        paddingVertical: 17,
        alignItems: 'center',
    },
    optionSelected: {
        backgroundColor: '#0F5BAA',
        shadowColor: '#1373D0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    optionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    optionTextSelected: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 10,
    },
});
