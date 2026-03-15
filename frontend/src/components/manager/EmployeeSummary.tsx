import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';
import { Employee } from '@/src/types/manager';
import { getInitials } from '@/src/utils/formatters';

interface EmployeeSummaryProps {
  employees: Employee[];
  onDutyCount: number;
  totalCount: number;
}

function EmployeeChip({ employee }: { employee: Employee }) {
  const initials = getInitials(employee.name);
  return (
    <View style={styles.chip}>
      <View style={[styles.avatar, { backgroundColor: employee.isOnDuty ? ManagerColors.primaryLight : ManagerColors.neutral[100] }]}>
        <Text style={[styles.avatarText, { color: employee.isOnDuty ? ManagerColors.primary : ManagerColors.neutral[500] }]}>
          {initials}
        </Text>
      </View>
      {employee.isOnDuty && <View style={styles.onlineDot} />}
      <Text style={styles.chipName} numberOfLines={1}>{employee.name.split(' ')[0]}</Text>
    </View>
  );
}

export function EmployeeSummary({ employees, onDutyCount, totalCount }: EmployeeSummaryProps) {
  const sorted = [...employees].sort((a, b) => (b.isOnDuty ? 1 : 0) - (a.isOnDuty ? 1 : 0));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>employees on duty</Text>
        <View style={styles.countBadge}>
          <View style={styles.dot} />
          <Text style={styles.countText}>{onDutyCount} / {totalCount}</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {sorted.map((emp) => (
          <EmployeeChip key={emp.id} employee={emp} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: ManagerColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ManagerColors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ManagerColors.success,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: ManagerColors.success,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  chip: {
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ManagerColors.success,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chipName: {
    fontSize: 11,
    fontWeight: '500',
    color: ManagerColors.neutral[600],
    maxWidth: 52,
    textAlign: 'center',
  },
});
