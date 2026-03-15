export type ShiftStatus = 'active' | 'upcoming' | 'completed' | 'cancelled';
export type SwapStatus = 'pending' | 'approved' | 'rejected';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type AlertSeverity = 'low' | 'medium' | 'high';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarUrl?: string;
  hoursThisWeek: number;
  isOnDuty: boolean;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  department: string;
  location: string;
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  targetId: string;
  targetName: string;
  shiftDate: string;
  shiftTime: string;
  status: SwapStatus;
  createdAt: string;
  reason?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'emergency' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason: string;
  createdAt: string;
}

export interface FatigueAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  hoursWorked: number;
  consecutiveDays: number;
  severity: AlertSeverity;
  flaggedAt: string;
  acknowledged: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  pinned: boolean;
  targetDepartments: string[];
}

export interface ActivityItem {
  id: string;
  type: 'swap' | 'leave' | 'shift' | 'announcement' | 'alert';
  description: string;
  timestamp: string;
  actorName: string;
}

export interface DashboardStats {
  totalEmployees: number;
  onDutyNow: number;
  pendingSwaps: number;
  pendingLeaves: number;
  fatigueAlerts: number;
  shiftsToday: number;
  weeklyHoursAvg: number;
  attendanceRate: number;
}

export interface WeeklyShiftSummary {
  day: string;
  date: string;
  totalShifts: number;
  covered: number;
  uncovered: number;
}
