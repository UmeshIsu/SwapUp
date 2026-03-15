import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsProps {
  onApproveSwap: () => void;
  onApproveLeave: () => void;
  onAddShift: () => void;
  onAnnounce: () => void;
}

export function QuickActions({ onApproveSwap, onApproveLeave, onAddShift, onAnnounce }: QuickActionsProps) {
  const actions: QuickAction[] = [
    { id: 'swap', label: 'Swaps', icon: '🔁', color: ManagerColors.primary, onPress: onApproveSwap },
    { id: 'leave', label: 'Leave', icon: '📋', color: ManagerColors.accent, onPress: onApproveLeave },
    { id: 'shift', label: 'Add Shift', icon: '➕', color: ManagerColors.success, onPress: onAddShift },
    { id: 'announce', label: 'Announce', icon: '📢', color: ManagerColors.warning, onPress: onAnnounce },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>quick actions</Text>
      <View style={styles.row}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.action}
            onPress={action.onPress}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: action.color + '18' }]}>
              <Text style={styles.icon}>{action.icon}</Text>
            </View>
            <Text style={styles.label}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: ManagerColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  action: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: ManagerColors.neutral[600],
    textAlign: 'center',
  },
});
