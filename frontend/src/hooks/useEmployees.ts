import { useCallback, useMemo, useState } from 'react';
import { Employee } from '@/src/types/manager';
import { MOCK_EMPLOYEES } from '@/src/lib/mockData';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 500));
      setEmployees([...MOCK_EMPLOYEES]);
    } catch {
      setError('failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q),
    );
  }, [employees, searchQuery]);

  const onDuty = employees.filter((e) => e.isOnDuty);
  const offDuty = employees.filter((e) => !e.isOnDuty);

  return {
    employees: filteredEmployees,
    allEmployees: employees,
    onDuty,
    offDuty,
    onDutyCount: onDuty.length,
    totalCount: employees.length,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refresh,
  };
}
