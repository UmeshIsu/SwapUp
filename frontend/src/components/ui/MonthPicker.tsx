import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { monthOptions } from '@/src/data/mock';

interface MonthPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({ value, onChange }) => {
    const currentOption = monthOptions.find((o) => o.value === value) || monthOptions[0];

    const handleNext = () => {
        const currentIndex = monthOptions.findIndex((o) => o.value === value);
        if (currentIndex < monthOptions.length - 1) {
            onChange(monthOptions[currentIndex + 1].value);
        }
    };

    const handlePrev = () => {
        const currentIndex = monthOptions.findIndex((o) => o.value === value);
        if (currentIndex > 0) {
            onChange(monthOptions[currentIndex - 1].value);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handlePrev} style={styles.button}>
                <Ionicons name="chevron-back" size={18} color={colors.primary} />
            </TouchableOpacity>
            <ThemedText style={styles.label}>{currentOption.label}</ThemedText>
            <TouchableOpacity onPress={handleNext} style={styles.button}>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    button: {
        padding: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.dark,
        minWidth: 100,
        textAlign: 'center',
    },
});

export default MonthPicker;
