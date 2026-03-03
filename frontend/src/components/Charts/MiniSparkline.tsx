import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface MiniSparklineProps {
    values: number[];
    style?: ViewStyle;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({ values, style }) => {
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const range = max - min;

    return (
        <View style={[styles.container, style]}>
            {values.map((v, i) => {
                const height = ((v - min) / (range || 1)) * 40 + 5; // Scale to 40px + 5px base
                return (
                    <View
                        key={i}
                        style={[
                            styles.bar,
                            { height, backgroundColor: v > 90 ? colors.success : colors.primary },
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 50,
        gap: 4,
    },
    bar: {
        flex: 1,
        borderRadius: 2,
        maxWidth: 8,
    },
});

export default MiniSparkline;
