import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';
import { Announcement } from '@/src/types/manager';
import { getRelativeTime } from '@/src/utils/dateUtils';
import { truncate } from '@/src/utils/formatters';

interface AnnouncementWidgetProps {
  announcements: Announcement[];
  onCompose: () => void;
  onViewAll: () => void;
}

function AnnouncementItem({ item }: { item: Announcement }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={styles.itemLeft}>
          {item.pinned && (
            <View style={styles.pinnedBadge}>
              <Text style={styles.pinnedText}>📌 pinned</Text>
            </View>
          )}
          <Text style={styles.itemTitle}>{item.title}</Text>
        </View>
        <Text style={styles.time}>{getRelativeTime(item.createdAt)}</Text>
      </View>
      <Text style={styles.body}>{truncate(item.body, 90)}</Text>
      <Text style={styles.author}>— {item.authorName}</Text>
    </View>
  );
}

export function AnnouncementWidget({ announcements, onCompose, onViewAll }: AnnouncementWidgetProps) {
  const sorted = [...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).slice(0, 2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>announcements</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onCompose} activeOpacity={0.7}>
            <Text style={styles.compose}>+ new</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>view all</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        {sorted.length === 0 ? (
          <Text style={styles.empty}>no announcements yet</Text>
        ) : (
          sorted.map((item, i) => (
            <View key={item.id}>
              <AnnouncementItem item={item} />
              {i < sorted.length - 1 && <View style={styles.divider} />}
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  compose: {
    fontSize: 12,
    color: ManagerColors.accent,
    fontWeight: '600',
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
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemLeft: {
    flex: 1,
    gap: 4,
  },
  pinnedBadge: {
    backgroundColor: ManagerColors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pinnedText: {
    fontSize: 10,
    color: ManagerColors.warning,
    fontWeight: '600',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: ManagerColors.neutral[800],
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: ManagerColors.neutral[400],
    flexShrink: 0,
  },
  body: {
    fontSize: 12,
    color: ManagerColors.neutral[500],
    lineHeight: 18,
  },
  author: {
    fontSize: 11,
    color: ManagerColors.neutral[400],
    fontStyle: 'italic',
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
