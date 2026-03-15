import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  accentColor?: string;
  icon: string;
}

export function StatsCard({ label, value, subtext, accentColor = ManagerColors.primary, icon }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: accentColor + '18' }]}>
        <Text style={[styles.icon, { color: accentColor }]}>{icon}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ManagerColors.card,
    borderRadius: 16,
    padding: 16,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 4,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 18,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    color: ManagerColors.neutral[800],
    lineHeight: 30,
  },
  label: {
    fontSize: 12,
    color: ManagerColors.neutral[500],
    fontWeight: '500',
  },
  subtext: {
    fontSize: 11,
    color: ManagerColors.neutral[400],
    marginTop: 2,
  },
});
