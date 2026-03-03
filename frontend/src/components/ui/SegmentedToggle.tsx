import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { colors } from '../../constants/colors';

interface SegmentedToggleProps {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    style?: ViewStyle;
}

export const SegmentedToggle: React.FC<SegmentedToggleProps> = ({
    value,
    options,
    onChange,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            {options.map((option) => {
                const isActive = value === option;
                return (
                    <TouchableOpacity
                        key={option}
                        style={[styles.segment, isActive && styles.activeSegment]}
                        onPress={() => onChange(option)}
                    >
                        <ThemedText
                            style={[styles.text, isActive && styles.activeText]}
                        >
                            {option}
                        </ThemedText>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#E9ECEF',
        borderRadius: 8,
        padding: 2,
    },
    segment: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    activeSegment: {
        backgroundColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    text: {
        fontSize: 12,
        color: colors.muted,
    },
    activeText: {
        color: colors.primary,
        fontWeight: '600',
    },
});

export default SegmentedToggle;
