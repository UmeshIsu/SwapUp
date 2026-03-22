import React from 'react';
import { View, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { colors } from '../../constants/colors';

interface RecordRowProps {
    date: string;
    reason: string;
    style?: ViewStyle;
}

const RecordRow: React.FC<RecordRowProps> = ({ date, reason, style }) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.dot} />
            <View style={styles.content}>
                <ThemedText style={styles.date}>{date}</ThemedText>
                <ThemedText style={styles.reason}>{reason}</ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        gap: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.danger,
    },
    content: {
        flex: 1,
        gap: 2,
    },
    date: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.dark,
    },
    reason: {
        fontSize: 13,
        color: colors.muted,
    },
});

export default RecordRow;
