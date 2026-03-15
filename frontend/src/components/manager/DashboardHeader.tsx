import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';
import { NotificationBadge } from './NotificationBadge';
import { getDayGreeting } from '@/src/utils/dateUtils';
import { getInitials } from '@/src/utils/formatters';

interface DashboardHeaderProps {
  managerName: string;
  notificationCount: number;
  onNotificationPress: () => void;
  onProfilePress: () => void;
}

export function DashboardHeader({
  managerName,
  notificationCount,
  onNotificationPress,
  onProfilePress,
}: DashboardHeaderProps) {
  const greeting = getDayGreeting();
  const firstName = managerName.split(' ')[0];
  const initials = getInitials(managerName);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.name}>{firstName} 👋</Text>
      </View>
      <View style={styles.right}>
        <TouchableOpacity style={styles.bellBtn} onPress={onNotificationPress} activeOpacity={0.7}>
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.badgeWrap}>
            <NotificationBadge count={notificationCount} size="sm" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatar} onPress={onProfilePress} activeOpacity={0.8}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  left: {
    gap: 2,
  },
  greeting: {
    fontSize: 14,
    color: ManagerColors.neutral[500],
    fontWeight: '400',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: ManagerColors.neutral[800],
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ManagerColors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 18,
  },
  badgeWrap: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ManagerColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
