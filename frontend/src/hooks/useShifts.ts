import { useCallback, useState } from 'react';
import { Shift } from '@/src/types/manager';
import { MOCK_SHIFTS } from '@/src/lib/mockData';

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 600));
      setShifts([...MOCK_SHIFTS]);
    } catch {
      setError('failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTodayShifts = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return shifts.filter((s) => s.date === today);
  }, [shifts]);

  const getShiftsByStatus = useCallback(
    (status: Shift['status']) => shifts.filter((s) => s.status === status),
    [shifts],
  );

  return {
    shifts,
    loading,
    error,
    refresh,
    todayShifts: getTodayShifts(),
    activeShifts: getShiftsByStatus('active'),
    upcomingShifts: getShiftsByStatus('upcoming'),
  };
}
