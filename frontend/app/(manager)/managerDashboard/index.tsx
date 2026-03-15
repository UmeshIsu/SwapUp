import React from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useManagerDashboard } from '@/src/hooks/useManagerDashboard';
import { useAuth } from '@/src/contexts/AuthContext';
import { ManagerColors } from '@/src/constants/managerColors';

import { DashboardHeader } from '@/src/components/manager/DashboardHeader';
import { StatsCard } from '@/src/components/manager/StatsCard';
import { QuickActions } from '@/src/components/manager/QuickActions';
import { EmployeeSummary } from '@/src/components/manager/EmployeeSummary';
import { ShiftOverview } from '@/src/components/manager/ShiftOverview';
import { SwapRequestCard } from '@/src/components/manager/SwapRequestCard';
import { FatigueAlert } from '@/src/components/manager/FatigueAlert';
import { LeaveRequestSummary } from '@/src/components/manager/LeaveRequestSummary';
import { AnnouncementWidget } from '@/src/components/manager/AnnouncementWidget';
import { ActivityFeed } from '@/src/components/manager/ActivityFeed';
import { WeeklyOverview } from '@/src/components/manager/WeeklyOverview';
import { WorkforceMetrics } from '@/src/components/manager/WorkforceMetrics';
import { pluralize } from '@/src/utils/formatters';

export default function ManagerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    stats,
    shifts,
    swapRequests,
    leaveRequests,
    employees,
    fatigueAlerts,
    announcements,
    activity,
    weeklySummary,
    totalNotifications,
    refreshing,
    refreshAll,
  } = useManagerDashboard();

  const managerName = user?.email?.split('@')[0] ?? 'manager';

  if (shifts.loading && shifts.shifts.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ManagerColors.primary} />
          <Text style={styles.loadingText}>loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor={ManagerColors.primary}
            colors={[ManagerColors.primary]}
          />
        }
      >
        <DashboardHeader
          managerName={managerName}
          notificationCount={totalNotifications}
          onNotificationPress={() => Alert.alert('notifications', `you have ${pluralize(totalNotifications, 'notification')}`)}
          onProfilePress={() => router.push('/(manager)/userProfile')}
        />

        <View style={styles.statsGrid}>
          <StatsCard
            label="on duty now"
            value={stats.onDutyNow}
            subtext={`of ${stats.totalEmployees} employees`}
            accentColor={ManagerColors.success}
            icon="👥"
          />
          <StatsCard
            label="shifts today"
            value={stats.shiftsToday}
            subtext="scheduled"
            accentColor={ManagerColors.primary}
            icon="🕐"
          />
          <StatsCard
            label="pending swaps"
            value={stats.pendingSwaps}
            subtext="need review"
            accentColor={ManagerColors.warning}
            icon="🔁"
          />
          <StatsCard
            label="leave requests"
            value={stats.pendingLeaves}
            subtext="awaiting approval"
            accentColor={ManagerColors.accent}
            icon="📋"
          />
        </View>

        <QuickActions
          onApproveSwap={() => router.push('/(manager)/swapReview')}
          onApproveLeave={() => router.push('/(manager)/leaveManagment')}
          onAddShift={() => Alert.alert('add shift', 'coming soon')}
          onAnnounce={() => router.push('/(manager)/annoucments')}
        />

        <EmployeeSummary
          employees={employees.allEmployees}
          onDutyCount={employees.onDutyCount}
          totalCount={employees.totalCount}
        />

        <ShiftOverview shifts={shifts.todayShifts} />

        <WeeklyOverview summary={weeklySummary} />

        <WorkforceMetrics stats={stats} />

        <SwapRequestCard
          requests={swapRequests.requests}
          onApprove={swapRequests.approve}
          onReject={swapRequests.reject}
          onViewAll={() => router.push('/(manager)/swapReview')}
        />

        <FatigueAlert
          alerts={fatigueAlerts.alerts}
          onAcknowledge={fatigueAlerts.acknowledge}
          onViewAll={() => router.push('/(manager)/fatigueAlert')}
        />

        <LeaveRequestSummary
          requests={leaveRequests.requests}
          onApprove={leaveRequests.approve}
          onReject={leaveRequests.reject}
          onViewAll={() => router.push('/(manager)/leaveManagment')}
        />

        <AnnouncementWidget
          announcements={announcements}
          onCompose={() => router.push('/(manager)/annoucments')}
          onViewAll={() => router.push('/(manager)/annoucments')}
        />

        <ActivityFeed
          activities={activity}
          onViewAll={() => Alert.alert('activity', 'full activity log coming soon')}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>swapup · manager view</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ManagerColors.neutral[50],
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    gap: 24,
    paddingTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    justifyContent: 'space-between',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 11,
    color: ManagerColors.neutral[300],
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: ManagerColors.neutral[50],
  },
  loadingText: {
    fontSize: 14,
    color: ManagerColors.neutral[400],
    fontWeight: '500',
  },
});
