import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';
import { Shift } from '@/src/types/manager';
import { formatShiftRange } from '@/src/utils/dateUtils';
import { getShiftStatusColor } from '@/src/utils/formatters';
import { getInitials } from '@/src/utils/formatters';

interface ShiftOverviewProps {
  shifts: Shift[];
}

function ShiftRow({ shift }: { shift: Shift }) {
  const statusColor = getShiftStatusColor(shift.status);
  const initials = getInitials(shift.employeeName);

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: ManagerColors.primary + '18' }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{shift.employeeName}</Text>
        <Text style={styles.meta}>
          {formatShiftRange(shift.startTime, shift.endTime)} · {shift.location}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{shift.status}</Text>
      </View>
    </View>
  );
}

export function ShiftOverview({ shifts }: ShiftOverviewProps) {
  const todayShifts = shifts.slice(0, 4);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>today's shifts</Text>
        <Text style={styles.count}>{shifts.length} total</Text>
      </View>
      <View style={styles.card}>
        {todayShifts.map((shift, index) => (
          <View key={shift.id}>
            <ShiftRow shift={shift} />
            {index < todayShifts.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
        {shifts.length === 0 && (
          <Text style={styles.empty}>no shifts scheduled today</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: ManagerColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  count: {
    fontSize: 12,
    color: ManagerColors.neutral[400],
  },
  card: {
    backgroundColor: ManagerColors.card,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: ManagerColors.primary,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: ManagerColors.neutral[800],
  },
  meta: {
    fontSize: 12,
    color: ManagerColors.neutral[500],
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: ManagerColors.neutral[100],
    marginHorizontal: 12,
  },
  empty: {
    padding: 20,
    textAlign: 'center',
    color: ManagerColors.neutral[400],
    fontSize: 13,
  },
});
