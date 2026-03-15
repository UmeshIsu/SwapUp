import { useCallback, useState } from 'react';
import { useShifts } from './useShifts';
import { useSwapRequests } from './useSwapRequests';
import { useLeaveRequests } from './useLeaveRequests';
import { useEmployees } from './useEmployees';
import { useFatigueAlerts } from './useFatigueAlerts';
import { MOCK_STATS, MOCK_ANNOUNCEMENTS, MOCK_ACTIVITY, MOCK_WEEKLY_SUMMARY } from '@/src/lib/mockData';
import { DashboardStats } from '@/src/types/manager';

export function useManagerDashboard() {
  const shifts = useShifts();
  const swapRequests = useSwapRequests();
  const leaveRequests = useLeaveRequests();
  const employees = useEmployees();
  const fatigueAlerts = useFatigueAlerts();

  const [stats] = useState<DashboardStats>({
    ...MOCK_STATS,
    pendingSwaps: swapRequests.pendingCount,
    pendingLeaves: leaveRequests.pendingCount,
    fatigueAlerts: fatigueAlerts.unacknowledgedCount,
    onDutyNow: employees.onDutyCount,
    totalEmployees: employees.totalCount,
  });

  const [refreshing, setRefreshing] = useState(false);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      shifts.refresh(),
      swapRequests.refresh(),
      leaveRequests.refresh(),
      employees.refresh(),
      fatigueAlerts.refresh(),
    ]);
    setRefreshing(false);
  }, [shifts, swapRequests, leaveRequests, employees, fatigueAlerts]);

  const totalNotifications =
    swapRequests.pendingCount + leaveRequests.pendingCount + fatigueAlerts.unacknowledgedCount;

  return {
    stats,
    shifts,
    swapRequests,
    leaveRequests,
    employees,
    fatigueAlerts,
    announcements: MOCK_ANNOUNCEMENTS,
    activity: MOCK_ACTIVITY,
    weeklySummary: MOCK_WEEKLY_SUMMARY,
    refreshing,
    refreshAll,
    totalNotifications,
  };
}
