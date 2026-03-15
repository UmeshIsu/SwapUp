import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';
import { FatigueAlert as FatigueAlertType } from '@/src/types/manager';
import { getSeverityBgColor, getSeverityColor } from '@/src/utils/formatters';
import { getRelativeTime } from '@/src/utils/dateUtils';

interface FatigueAlertProps {
  alerts: FatigueAlertType[];
  onAcknowledge: (id: string) => void;
  onViewAll: () => void;
}

const SEVERITY_ICON: Record<string, string> = {
  low: '🟡',
  medium: '🟠',
  high: '🔴',
};

function AlertRow({ alert, onAcknowledge }: { alert: FatigueAlertType; onAcknowledge: () => void }) {
  const bg = getSeverityBgColor(alert.severity);
  const color = getSeverityColor(alert.severity);

  return (
    <View style={[styles.row, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <Text style={styles.severityIcon}>{SEVERITY_ICON[alert.severity]}</Text>
      <View style={styles.info}>
        <Text style={styles.empName}>{alert.employeeName}</Text>
        <Text style={styles.details}>
          {alert.hoursWorked}h this week · {alert.consecutiveDays} consecutive days
        </Text>
        <Text style={styles.time}>{getRelativeTime(alert.flaggedAt)}</Text>
      </View>
      {!alert.acknowledged && (
        <TouchableOpacity style={[styles.ackBtn, { backgroundColor: bg }]} onPress={onAcknowledge} activeOpacity={0.75}>
          <Text style={[styles.ackText, { color }]}>ack</Text>
        </TouchableOpacity>
      )}
      {alert.acknowledged && (
        <View style={styles.ackedBadge}>
          <Text style={styles.ackedText}>✓ seen</Text>
        </View>
      )}
    </View>
  );
}

export function FatigueAlert({ alerts, onAcknowledge, onViewAll }: FatigueAlertProps) {
  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>fatigue alerts</Text>
          {activeAlerts.length > 0 && (
            <View style={styles.alertCount}>
              <Text style={styles.alertCountText}>{activeAlerts.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAll}>view all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        {alerts.length === 0 ? (
          <Text style={styles.empty}>no fatigue alerts right now</Text>
        ) : (
          alerts.slice(0, 3).map((alert, i) => (
            <View key={alert.id}>
              <AlertRow alert={alert} onAcknowledge={() => onAcknowledge(alert.id)} />
              {i < Math.min(alerts.length, 3) - 1 && <View style={styles.divider} />}
            </View>
          ))
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: ManagerColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  alertCount: {
    backgroundColor: ManagerColors.dangerLight,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  alertCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: ManagerColors.danger,
  },
  viewAll: {
    fontSize: 12,
    color: ManagerColors.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: ManagerColors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  severityIcon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  empName: {
    fontSize: 14,
    fontWeight: '600',
    color: ManagerColors.neutral[800],
  },
  details: {
    fontSize: 12,
    color: ManagerColors.neutral[500],
  },
  time: {
    fontSize: 11,
    color: ManagerColors.neutral[400],
    marginTop: 2,
  },
  ackBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ackText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ackedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: ManagerColors.neutral[100],
  },
  ackedText: {
    fontSize: 11,
    color: ManagerColors.neutral[400],
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: ManagerColors.neutral[100],
    marginHorizontal: 14,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: ManagerColors.neutral[400],
    fontSize: 13,
  },
});
