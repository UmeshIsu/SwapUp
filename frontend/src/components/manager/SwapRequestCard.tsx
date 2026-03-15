import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';
import { SwapRequest } from '@/src/types/manager';
import { getRelativeTime } from '@/src/utils/dateUtils';
import { getInitials } from '@/src/utils/formatters';

interface SwapRequestCardProps {
  requests: SwapRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewAll: () => void;
}

function RequestItem({ req, onApprove, onReject }: { req: SwapRequest; onApprove: () => void; onReject: () => void }) {
  const isPending = req.status === 'pending';
  const initials = getInitials(req.requesterName);

  return (
    <View style={styles.item}>
      <View style={styles.itemRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.requester}>{req.requesterName}</Text>
          <Text style={styles.meta}>
            wants to swap with <Text style={styles.bold}>{req.targetName}</Text>
          </Text>
          <Text style={styles.shiftInfo}>{req.shiftDate} · {req.shiftTime}</Text>
          {req.reason ? <Text style={styles.reason}>"{req.reason}"</Text> : null}
        </View>
        <Text style={styles.time}>{getRelativeTime(req.createdAt)}</Text>
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

export function SwapRequestCard({ requests, onApprove, onReject, onViewAll }: SwapRequestCardProps) {
  const pendingRequests = requests.filter((r) => r.status === 'pending').slice(0, 2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>swap requests</Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAll}>view all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        {pendingRequests.length === 0 ? (
          <Text style={styles.empty}>no pending swap requests</Text>
        ) : (
          pendingRequests.map((req, i) => (
            <View key={req.id}>
              <RequestItem
                req={req}
                onApprove={() => onApprove(req.id)}
                onReject={() => onReject(req.id)}
              />
              {i < pendingRequests.length - 1 && <View style={styles.divider} />}
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
  item: {
    padding: 14,
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: ManagerColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: ManagerColors.primary,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  requester: {
    fontSize: 14,
    fontWeight: '600',
    color: ManagerColors.neutral[800],
  },
  meta: {
    fontSize: 12,
    color: ManagerColors.neutral[500],
  },
  bold: {
    fontWeight: '600',
    color: ManagerColors.neutral[700],
  },
  shiftInfo: {
    fontSize: 11,
    color: ManagerColors.neutral[400],
    marginTop: 2,
  },
  reason: {
    fontSize: 12,
    color: ManagerColors.neutral[500],
    fontStyle: 'italic',
    marginTop: 2,
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
    backgroundColor: ManagerColors.primary,
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
