import { AlertSeverity, LeaveStatus, ShiftStatus, SwapStatus } from '@/src/types/manager';
import { ManagerColors } from '@/src/constants/managerColors';

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function formatAttendanceRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function getShiftStatusColor(status: ShiftStatus): string {
  return ManagerColors.statusColors[status];
}

export function getSwapStatusColor(status: SwapStatus): string {
  return ManagerColors.statusColors[status];
}

export function getLeaveStatusColor(status: LeaveStatus): string {
  return ManagerColors.statusColors[status];
}

export function getSeverityColor(severity: AlertSeverity): string {
  return ManagerColors.statusColors[severity];
}

export function getSeverityBgColor(severity: AlertSeverity): string {
  const map: Record<AlertSeverity, string> = {
    low: ManagerColors.successLight,
    medium: ManagerColors.warningLight,
    high: ManagerColors.dangerLight,
  };
  return map[severity];
}

export function getLeaveTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    annual: 'Annual Leave',
    sick: 'Sick Leave',
    emergency: 'Emergency Leave',
    unpaid: 'Unpaid Leave',
  };
  return labels[type] ?? type;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? singular + 's');
  return `${count} ${word}`;
}
