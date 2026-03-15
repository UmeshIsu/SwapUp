import { useCallback, useState } from 'react';
import { LeaveRequest } from '@/src/types/manager';
import { MOCK_LEAVE_REQUESTS } from '@/src/lib/mockData';

export function useLeaveRequests() {
  const [requests, setRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 500));
      setRequests([...MOCK_LEAVE_REQUESTS]);
    } catch {
      setError('failed to load leave requests');
    } finally {
      setLoading(false);
    }
  }, []);

  const approve = useCallback((id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)),
    );
  }, []);

  const reject = useCallback((id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)),
    );
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return {
    requests,
    pendingRequests,
    pendingCount: pendingRequests.length,
    loading,
    error,
    refresh,
    approve,
    reject,
  };
}
