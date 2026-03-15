import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';
import { DashboardStats } from '@/src/types/manager';
import { formatAttendanceRate, formatHours } from '@/src/utils/formatters';

interface WorkforceMetricsProps {
  stats: DashboardStats;
}

interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  displayValue: string;
}

function MetricBar({ label, value, max, color, displayValue }: MetricBarProps) {
  const pct = Math.min(1, max > 0 ? value / max : 0);

  return (
    <View style={styles.metricRow}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, { color }]}>{displayValue}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export function WorkforceMetrics({ stats }: WorkforceMetricsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>workforce metrics</Text>
      <View style={styles.card}>
        <MetricBar
          label="attendance rate"
          value={stats.attendanceRate}
          max={100}
          color={ManagerColors.success}
          displayValue={formatAttendanceRate(stats.attendanceRate)}
        />
        <MetricBar
          label="avg weekly hours"
          value={stats.weeklyHoursAvg}
          max={48}
          color={ManagerColors.primary}
          displayValue={formatHours(stats.weeklyHoursAvg)}
        />
        <MetricBar
          label="staff utilisation"
          value={stats.onDutyNow}
          max={stats.totalEmployees}
          color={ManagerColors.accent}
          displayValue={`${stats.onDutyNow} / ${stats.totalEmployees}`}
        />
        <MetricBar
          label="shifts covered today"
          value={stats.shiftsToday - stats.pendingSwaps}
          max={stats.shiftsToday}
          color={ManagerColors.info}
          displayValue={`${stats.shiftsToday - stats.pendingSwaps} / ${stats.shiftsToday}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: ManagerColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: ManagerColors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  metricRow: {
    gap: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: ManagerColors.neutral[600],
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    height: 6,
    backgroundColor: ManagerColors.neutral[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
