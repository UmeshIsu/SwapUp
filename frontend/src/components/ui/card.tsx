import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

const Card: React.FC<CardProps> & {
    Title: React.FC<{ children: React.ReactNode; style?: TextStyle }>;
    StatRow: React.FC<{ label: string; value: string; tone?: 'success' | 'danger' | 'info' | 'default' }>;
    LockedHint: React.FC<{ text: string }>;
    BigStat: React.FC<{ value: string; tone?: 'success' | 'danger' | 'default' }>;
    SubText: React.FC<{ children: React.ReactNode }>;
    InfoBox: React.FC<{ tone?: 'primary' | 'success' | 'danger' | 'info' | 'default'; title: string; text: string }>;
} = ({ children, style }) => {
    return <View style={[styles.card, style]}>{children}</View>;
};

Card.Title = ({ children, style }) => (
    <ThemedText type="defaultSemiBold" style={[styles.title, style]}>
        {children}
    </ThemedText>
);

Card.StatRow = ({ label, value, tone = 'default' }) => {
    const valueStyle = [
        styles.statValue,
        tone === 'success' && { color: colors.success },
        tone === 'danger' && { color: colors.danger },
        tone === 'info' && { color: colors.info },
    ];

    return (
        <View style={styles.statRow}>
            <ThemedText style={styles.statLabel}>{label}</ThemedText>
            <ThemedText style={valueStyle}>{value}</ThemedText>
        </View>
    );
};

Card.LockedHint = ({ text }) => (
    <View style={styles.lockedHint}>
        <Ionicons name="lock-closed" size={16} color={colors.muted} />
        <ThemedText style={styles.lockedText}>{text}</ThemedText>
    </View>
);

Card.BigStat = ({ value, tone = 'default' }) => {
    const valueStyle = [
        styles.bigStat,
        tone === 'success' && { color: colors.success },
        tone === 'danger' && { color: colors.danger },
    ];
    return <ThemedText style={valueStyle}>{value}</ThemedText>;
};

Card.SubText = ({ children }) => (
    <ThemedText style={styles.subText}>{children}</ThemedText>
);

Card.InfoBox = ({ tone = 'default', title, text }) => {
    const { backgroundColor, iconColor, iconName } = (() => {
        switch (tone) {
            case 'primary': return { backgroundColor: colors.soft || colors.light, iconColor: colors.primary, iconName: 'information-circle' as const };
            case 'success': return { backgroundColor: colors.light, iconColor: colors.success, iconName: 'checkmark-circle' as const };
            case 'danger': return { backgroundColor: colors.light, iconColor: colors.danger, iconName: 'alert-circle' as const };
            case 'info': return { backgroundColor: colors.light, iconColor: colors.info, iconName: 'information-circle' as const };
            default: return { backgroundColor: colors.light, iconColor: colors.muted, iconName: 'ellipse' as const };
        }
    })();

    return (
        <View style={[styles.infoBox, { backgroundColor }]}>
            <Ionicons name={iconName} size={20} color={iconColor} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, gap: 4 }}>
                <ThemedText type="defaultSemiBold" style={{ color: iconColor }}>{title}</ThemedText>
                <ThemedText style={styles.infoBoxText}>{text}</ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        color: colors.dark,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    statLabel: {
        color: colors.muted,
        fontSize: 14,
    },
    statValue: {
        fontWeight: '700',
        fontSize: 14,
        color: colors.dark,
    },
    lockedHint: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light,
        padding: 10,
        borderRadius: 8,
        gap: 8,
    },
    lockedText: {
        fontSize: 12,
        color: colors.muted,
        flex: 1,
    },
    bigStat: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.dark,
    },
    subText: {
        fontSize: 14,
        color: colors.muted,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        gap: 10,
    },
    infoBoxText: {
        fontSize: 13,
        color: colors.dark,
    },
});

export default Card;
