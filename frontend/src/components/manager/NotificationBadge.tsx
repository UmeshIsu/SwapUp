import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';

interface NotificationBadgeProps {
  count: number;
  color?: string;
  size?: 'sm' | 'md';
}

export function NotificationBadge({ count, color = ManagerColors.danger, size = 'md' }: NotificationBadgeProps) {
  if (count <= 0) return null;

  const isSmall = size === 'sm';
  const displayCount = count > 99 ? '99+' : String(count);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color },
        isSmall ? styles.small : styles.medium,
      ]}
    >
      <Text style={[styles.text, isSmall && styles.textSmall]}>
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
  },
  medium: {
    height: 20,
    paddingHorizontal: 6,
  },
  small: {
    height: 16,
    paddingHorizontal: 4,
  },
  text: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  textSmall: {
    fontSize: 9,
    lineHeight: 12,
  },
});
