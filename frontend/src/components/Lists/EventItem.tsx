import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { colors } from '../../constants/colors';

interface EventItemProps {
    title: string;
    subtitle: string;
    badge?: string;
    style?: ViewStyle;
}

export const EventItem: React.FC<EventItemProps> = ({ title, subtitle, badge, style }) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.left}>
                <ThemedText style={styles.title}>{title}</ThemedText>
                <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
            </View>
            {badge && (
                <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>{badge}</ThemedText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.light,
    },
    left: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.dark,
    },
    subtitle: {
        fontSize: 12,
        color: colors.muted,
    },
    badge: {
        backgroundColor: colors.light,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary,
    },
});

export default EventItem;
