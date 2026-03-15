import { useCallback, useState } from 'react';
import { FatigueAlert } from '@/src/types/manager';
import { MOCK_FATIGUE_ALERTS } from '@/src/lib/mockData';

export function useFatigueAlerts() {
  const [alerts, setAlerts] = useState<FatigueAlert[]>(MOCK_FATIGUE_ALERTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 400));
      setAlerts([...MOCK_FATIGUE_ALERTS]);
    } catch {
      setError('failed to load fatigue alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const acknowledge = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    );
  }, []);

  const unacknowledged = alerts.filter((a) => !a.acknowledged);
  const highSeverity = alerts.filter((a) => a.severity === 'high' && !a.acknowledged);

  return {
    alerts,
    unacknowledged,
    highSeverity,
    unacknowledgedCount: unacknowledged.length,
    loading,
    error,
    refresh,
    acknowledge,
  };
}
