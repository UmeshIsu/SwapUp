import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';
import { LeaveRequest } from '@/src/types/manager';
import { formatDateRange, getRelativeTime } from '@/src/utils/dateUtils';
import { getLeaveTypeLabel, getInitials } from '@/src/utils/formatters';
import { pluralize } from '@/src/utils/formatters';

interface LeaveRequestSummaryProps {
  requests: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewAll: () => void;
}

const LEAVE_TYPE_COLOR: Record<string, string> = {
  annual: ManagerColors.primary,
  sick: ManagerColors.warning,
  emergency: ManagerColors.danger,
  unpaid: ManagerColors.neutral[500],
};

function LeaveRow({ req, onApprove, onReject }: { req: LeaveRequest; onApprove: () => void; onReject: () => void }) {
  const typeColor = LEAVE_TYPE_COLOR[req.type] ?? ManagerColors.primary;
  const initials = getInitials(req.employeeName);
  const isPending = req.status === 'pending';

  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <View style={[styles.avatar, { backgroundColor: typeColor + '18' }]}>
          <Text style={[styles.avatarText, { color: typeColor }]}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{req.employeeName}</Text>
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: typeColor + '18' }]}>
              <Text style={[styles.tagText, { color: typeColor }]}>{getLeaveTypeLabel(req.type)}</Text>
            </View>
            <Text style={styles.days}>{pluralize(req.days, 'day')}</Text>
          </View>
          <Text style={styles.dates}>{formatDateRange(req.startDate, req.endDate)}</Text>
          <Text style={styles.time}>{getRelativeTime(req.createdAt)}</Text>
        </View>
      </View>
      {isPending && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.rejectBtn} onPress={onReject} activeOpacity={0.75}>
            <Text style={styles.rejectText}>decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.approveBtn} onPress={onApprove} activeOpacity={0.75}>
            <Text style={styles.approveText}>approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export function LeaveRequestSummary({ requests, onApprove, onReject, onViewAll }: LeaveRequestSummaryProps) {
  const pending = requests.filter((r) => r.status === 'pending').slice(0, 2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>leave requests</Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAll}>view all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        {pending.length === 0 ? (
          <Text style={styles.empty}>no pending leave requests</Text>
        ) : (
          pending.map((req, i) => (
            <View key={req.id}>
              <LeaveRow
                req={req}
                onApprove={() => onApprove(req.id)}
                onReject={() => onReject(req.id)}
              />
              {i < pending.length - 1 && <View style={styles.divider} />}
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
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: ManagerColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    padding: 14,
    gap: 12,
  },
  rowTop: {
    flexDirection: 'row',
    gap: 10,
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
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: ManagerColors.neutral[800],
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  days: {
    fontSize: 11,
    color: ManagerColors.neutral[500],
  },
  dates: {
    fontSize: 12,
    color: ManagerColors.neutral[600],
  },
  time: {
    fontSize: 11,
    color: ManagerColors.neutral[400],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ManagerColors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    fontSize: 13,
    fontWeight: '600',
    color: ManagerColors.neutral[500],
  },
  approveBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: ManagerColors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
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
