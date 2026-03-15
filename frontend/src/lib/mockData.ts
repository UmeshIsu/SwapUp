import {
  ActivityItem,
  Announcement,
  DashboardStats,
  Employee,
  FatigueAlert,
  LeaveRequest,
  Shift,
  SwapRequest,
  WeeklyShiftSummary,
} from '@/src/types/manager';

export const MOCK_STATS: DashboardStats = {
  totalEmployees: 48,
  onDutyNow: 14,
  pendingSwaps: 5,
  pendingLeaves: 8,
  fatigueAlerts: 3,
  shiftsToday: 22,
  weeklyHoursAvg: 37.4,
  attendanceRate: 94.2,
};

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Aiden Perera', email: 'aiden@swapup.lk', role: 'Cashier', department: 'Sales', hoursThisWeek: 38, isOnDuty: true },
  { id: 'e2', name: 'Nisha Fernando', email: 'nisha@swapup.lk', role: 'Supervisor', department: 'Ops', hoursThisWeek: 42, isOnDuty: true },
  { id: 'e3', name: 'Rohan Silva', email: 'rohan@swapup.lk', role: 'Cashier', department: 'Sales', hoursThisWeek: 35, isOnDuty: false },
  { id: 'e4', name: 'Kavya Raj', email: 'kavya@swapup.lk', role: 'Stock Handler', department: 'Warehouse', hoursThisWeek: 40, isOnDuty: true },
  { id: 'e5', name: 'Dilshan Wijeratne', email: 'dilshan@swapup.lk', role: 'Cashier', department: 'Sales', hoursThisWeek: 28, isOnDuty: false },
];

export const MOCK_SHIFTS: Shift[] = [
  { id: 's1', employeeId: 'e1', employeeName: 'Aiden Perera', date: new Date().toISOString().split('T')[0], startTime: '08:00', endTime: '16:00', status: 'active', department: 'Sales', location: 'Floor A' },
  { id: 's2', employeeId: 'e2', employeeName: 'Nisha Fernando', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '17:00', status: 'active', department: 'Ops', location: 'Floor B' },
  { id: 's3', employeeId: 'e4', employeeName: 'Kavya Raj', date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '22:00', status: 'upcoming', department: 'Warehouse', location: 'Warehouse' },
  { id: 's4', employeeId: 'e3', employeeName: 'Rohan Silva', date: new Date().toISOString().split('T')[0], startTime: '06:00', endTime: '14:00', status: 'completed', department: 'Sales', location: 'Floor A' },
];

export const MOCK_SWAP_REQUESTS: SwapRequest[] = [
  { id: 'sw1', requesterId: 'e3', requesterName: 'Rohan Silva', targetId: 'e1', targetName: 'Aiden Perera', shiftDate: new Date().toISOString().split('T')[0], shiftTime: '08:00 – 16:00', status: 'pending', createdAt: new Date(Date.now() - 3600000).toISOString(), reason: 'Doctor appointment' },
  { id: 'sw2', requesterId: 'e5', requesterName: 'Dilshan Wijeratne', targetId: 'e4', targetName: 'Kavya Raj', shiftDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], shiftTime: '14:00 – 22:00', status: 'pending', createdAt: new Date(Date.now() - 7200000).toISOString(), reason: 'Family event' },
  { id: 'sw3', requesterId: 'e2', requesterName: 'Nisha Fernando', targetId: 'e3', targetName: 'Rohan Silva', shiftDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], shiftTime: '09:00 – 17:00', status: 'approved', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'l1', employeeId: 'e5', employeeName: 'Dilshan Wijeratne', type: 'annual', startDate: new Date(Date.now() + 259200000).toISOString().split('T')[0], endDate: new Date(Date.now() + 432000000).toISOString().split('T')[0], days: 2, status: 'pending', reason: 'Family vacation', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'l2', employeeId: 'e3', employeeName: 'Rohan Silva', type: 'sick', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], days: 1, status: 'approved', reason: 'Fever', createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'l3', employeeId: 'e1', employeeName: 'Aiden Perera', type: 'emergency', startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], days: 1, status: 'pending', reason: 'Family emergency', createdAt: new Date(Date.now() - 1800000).toISOString() },
];

export const MOCK_FATIGUE_ALERTS: FatigueAlert[] = [
  { id: 'f1', employeeId: 'e2', employeeName: 'Nisha Fernando', hoursWorked: 52, consecutiveDays: 6, severity: 'high', flaggedAt: new Date(Date.now() - 1800000).toISOString(), acknowledged: false },
  { id: 'f2', employeeId: 'e4', employeeName: 'Kavya Raj', hoursWorked: 46, consecutiveDays: 5, severity: 'medium', flaggedAt: new Date(Date.now() - 7200000).toISOString(), acknowledged: false },
  { id: 'f3', employeeId: 'e1', employeeName: 'Aiden Perera', hoursWorked: 44, consecutiveDays: 5, severity: 'low', flaggedAt: new Date(Date.now() - 14400000).toISOString(), acknowledged: true },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'New overtime policy effective next week', body: 'Please review the updated overtime compensation policy shared via email. All supervisors must acknowledge receipt by Friday.', authorId: 'mgr1', authorName: 'Sarah Manager', createdAt: new Date(Date.now() - 43200000).toISOString(), pinned: true, targetDepartments: ['Sales', 'Ops', 'Warehouse'] },
  { id: 'a2', title: 'Public holiday schedule updated', body: 'The public holiday schedule for Q2 has been updated. Please check your shift calendar for any changes.', authorId: 'mgr1', authorName: 'Sarah Manager', createdAt: new Date(Date.now() - 86400000).toISOString(), pinned: false, targetDepartments: ['Sales', 'Ops', 'Warehouse'] },
];

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'ac1', type: 'swap', description: 'requested a shift swap with Aiden Perera', timestamp: new Date(Date.now() - 1800000).toISOString(), actorName: 'Rohan Silva' },
  { id: 'ac2', type: 'leave', description: 'applied for emergency leave tomorrow', timestamp: new Date(Date.now() - 3600000).toISOString(), actorName: 'Aiden Perera' },
  { id: 'ac3', type: 'alert', description: 'flagged for high fatigue — 52 hours this week', timestamp: new Date(Date.now() - 5400000).toISOString(), actorName: 'Nisha Fernando' },
  { id: 'ac4', type: 'shift', description: 'completed morning shift on Floor A', timestamp: new Date(Date.now() - 7200000).toISOString(), actorName: 'Rohan Silva' },
  { id: 'ac5', type: 'swap', description: 'swap request approved by manager', timestamp: new Date(Date.now() - 10800000).toISOString(), actorName: 'Nisha Fernando' },
];

export const MOCK_WEEKLY_SUMMARY: WeeklyShiftSummary[] = [
  { day: 'Sun', date: '', totalShifts: 18, covered: 16, uncovered: 2 },
  { day: 'Mon', date: '', totalShifts: 24, covered: 24, uncovered: 0 },
  { day: 'Tue', date: '', totalShifts: 24, covered: 22, uncovered: 2 },
  { day: 'Wed', date: '', totalShifts: 24, covered: 23, uncovered: 1 },
  { day: 'Thu', date: '', totalShifts: 24, covered: 24, uncovered: 0 },
  { day: 'Fri', date: '', totalShifts: 24, covered: 21, uncovered: 3 },
  { day: 'Sat', date: '', totalShifts: 18, covered: 17, uncovered: 1 },
];
