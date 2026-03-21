import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '@/src/components/themed-text';
import { useColors } from '@/src/constants/colors';

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
    const c = useColors();
    return (
        <View style={[styles.container, { backgroundColor: c.segmentBg }, style]}>
            {options.map((option) => {
                const isActive = value === option;
                return (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.segment,
                            isActive && [styles.activeSegment, { backgroundColor: c.segmentActiveBg }],
                        ]}
                        onPress={() => onChange(option)}
                    >
                        <ThemedText
                            style={[
                                styles.text,
                                { color: c.muted },
                                isActive && [styles.activeText, { color: c.primary }],
                            ]}
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
        borderRadius: 8,
        padding: 2,
    },
    segment: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    activeSegment: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    text: {
        fontSize: 12,
    },
    activeText: {
        fontWeight: '600',
    },
});

export default SegmentedToggle;
