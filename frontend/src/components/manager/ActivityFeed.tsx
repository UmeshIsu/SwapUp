import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';
import { ActivityItem } from '@/src/types/manager';
import { getRelativeTime } from '@/src/utils/dateUtils';

interface ActivityFeedProps {
  activities: ActivityItem[];
  onViewAll: () => void;
}

const ACTIVITY_ICON: Record<string, string> = {
  swap: '🔁',
  leave: '📋',
  shift: '🕐',
  announcement: '📢',
  alert: '⚠️',
};

const ACTIVITY_COLOR: Record<string, string> = {
  swap: ManagerColors.primary,
  leave: ManagerColors.accent,
  shift: ManagerColors.success,
  announcement: ManagerColors.warning,
  alert: ManagerColors.danger,
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const icon = ACTIVITY_ICON[item.type] ?? '•';
  const color = ACTIVITY_COLOR[item.type] ?? ManagerColors.neutral[500];

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text} numberOfLines={2}>
          <Text style={styles.actor}>{item.actorName} </Text>
          {item.description}
        </Text>
        <Text style={styles.time}>{getRelativeTime(item.timestamp)}</Text>
      </View>
    </View>
  );
}

export function ActivityFeed({ activities, onViewAll }: ActivityFeedProps) {
  const recent = activities.slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>recent activity</Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAll}>view all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        {recent.length === 0 ? (
          <Text style={styles.empty}>no recent activity</Text>
        ) : (
          recent.map((item, i) => (
            <View key={item.id}>
              <ActivityRow item={item} />
              {i < recent.length - 1 && <View style={styles.divider} />}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  text: {
    fontSize: 13,
    color: ManagerColors.neutral[600],
    lineHeight: 18,
  },
  actor: {
    fontWeight: '600',
    color: ManagerColors.neutral[800],
  },
  time: {
    fontSize: 11,
    color: ManagerColors.neutral[400],
  },
  divider: {
    height: 1,
    backgroundColor: ManagerColors.neutral[100],
    marginHorizontal: 12,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: ManagerColors.neutral[400],
    fontSize: 13,
  },
});
