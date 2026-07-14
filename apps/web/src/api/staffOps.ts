import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface StaffAttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEK_OFF' | 'LATE' | 'WORK_FROM_HOME';
  checkInTime?: string | null;
  checkOutTime?: string | null;
  source: 'MANUAL' | 'SELF' | 'ADMIN' | 'IMPORT';
  remarks?: string | null;
}

export interface StaffAttendanceSettings {
  id: string;
  selfCheckInEnabled: boolean;
  selfCheckOutEnabled: boolean;
  lateAfterTime?: string | null;
  halfDayAfterTime?: string | null;
  workingHoursTargetMinutes?: number | null;
}

export interface LeaveType {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  isPaid: boolean;
  requiresApproval: boolean;
  status: string;
}

export interface LeavePolicyRule {
  id: string;
  leaveTypeId: string;
  annualAllowance: number;
  carryForwardAllowed: boolean;
  maxCarryForward?: number | null;
  leaveType?: LeaveType;
}

export interface LeavePolicy {
  id: string;
  name: string;
  academicYearId?: string | null;
  employeeType?: string | null;
  status: string;
  rules: LeavePolicyRule[];
}

export interface EmployeeLeaveBalance {
  id: string;
  employeeId: string;
  academicYearId: string;
  leaveTypeId: string;
  openingBalance: number;
  accrued: number;
  used: number;
  adjusted: number;
  remaining: number;
  leaveType?: LeaveType;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  partialDayType: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF';
  reason: string;
  attachmentUrl?: string | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submittedAt: string;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  reviewComment?: string | null;
  employee?: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  leaveType?: LeaveType;
}

export interface LeaveImpact {
  date: string;
  dayOfWeek: string;
  className: string;
  sectionName: string;
  subjectName: string;
  periodName: string;
  startTime: string;
  endTime: string;
  timetableEntryId: string;
}

export const staffOpsApi = {
  // Attendance
  getMyTodayStatus: async (): Promise<StaffAttendanceRecord | null> => {
    const res = await apiClient.get<ApiResponse<StaffAttendanceRecord | null>>('/school/staff-ops/staff-attendance/me');
    return res.data.data;
  },

  selfCheckIn: async (remarks?: string): Promise<StaffAttendanceRecord> => {
    const res = await apiClient.post<ApiResponse<StaffAttendanceRecord>>('/school/staff-ops/staff-attendance/check-in', { remarks });
    return res.data.data;
  },

  selfCheckOut: async (remarks?: string): Promise<StaffAttendanceRecord> => {
    const res = await apiClient.post<ApiResponse<StaffAttendanceRecord>>('/school/staff-ops/staff-attendance/check-out', { remarks });
    return res.data.data;
  },

  listAttendance: async (params: { date?: string; departmentId?: string; employeeType?: string }): Promise<any[]> => {
    const res = await apiClient.get<ApiResponse<any[]>>('/school/staff-ops/staff-attendance', { params });
    return res.data.data;
  },

  markAttendance: async (data: {
    employeeId: string;
    date: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
    remarks?: string;
  }): Promise<StaffAttendanceRecord> => {
    const res = await apiClient.post<ApiResponse<StaffAttendanceRecord>>('/school/staff-ops/staff-attendance', data);
    return res.data.data;
  },

  getSettings: async (): Promise<StaffAttendanceSettings> => {
    const res = await apiClient.get<ApiResponse<StaffAttendanceSettings>>('/school/staff-ops/staff-attendance/settings');
    return res.data.data;
  },

  updateSettings: async (data: Partial<StaffAttendanceSettings>): Promise<StaffAttendanceSettings> => {
    const res = await apiClient.patch<ApiResponse<StaffAttendanceSettings>>('/school/staff-ops/staff-attendance/settings', data);
    return res.data.data;
  },

  // Leave Types
  listLeaveTypes: async (): Promise<LeaveType[]> => {
    const res = await apiClient.get<ApiResponse<LeaveType[]>>('/school/staff-ops/leave-types');
    return res.data.data;
  },

  createLeaveType: async (data: {
    name: string;
    code?: string;
    description?: string;
    isPaid?: boolean;
    requiresApproval?: boolean;
  }): Promise<LeaveType> => {
    const res = await apiClient.post<ApiResponse<LeaveType>>('/school/staff-ops/leave-types', data);
    return res.data.data;
  },

  // Leave Policies
  listLeavePolicies: async (): Promise<LeavePolicy[]> => {
    const res = await apiClient.get<ApiResponse<LeavePolicy[]>>('/school/staff-ops/leave-policies');
    return res.data.data;
  },

  createLeavePolicy: async (data: {
    name: string;
    academicYearId?: string;
    employeeType?: string;
    rules: { leaveTypeId: string; annualAllowance: number; carryForwardAllowed?: boolean; maxCarryForward?: number }[];
  }): Promise<LeavePolicy> => {
    const res = await apiClient.post<ApiResponse<LeavePolicy>>('/school/staff-ops/leave-policies', data);
    return res.data.data;
  },

  // Leave Requests & Balances
  getLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const res = await apiClient.get<ApiResponse<LeaveRequest[]>>('/school/staff-ops/leave-requests');
    return res.data.data;
  },

  getMyLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const res = await apiClient.get<ApiResponse<LeaveRequest[]>>('/school/staff-ops/leave-requests/me');
    return res.data.data;
  },

  submitLeaveRequest: async (data: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    partialDayType: string;
    reason: string;
    attachmentUrl?: string;
    academicYearId: string;
  }): Promise<LeaveRequest> => {
    const res = await apiClient.post<ApiResponse<LeaveRequest>>('/school/staff-ops/leave-requests', data);
    return res.data.data;
  },

  reviewLeaveRequest: async (id: string, data: {
    status: string;
    comment: string;
    academicYearId: string;
  }): Promise<LeaveRequest> => {
    const res = await apiClient.post<ApiResponse<LeaveRequest>>(`/school/staff-ops/leave-requests/${id}/review`, data);
    return res.data.data;
  },

  getLeaveImpact: async (id: string): Promise<LeaveImpact[]> => {
    const res = await apiClient.get<ApiResponse<LeaveImpact[]>>(`/school/staff-ops/leave-requests/${id}/impact`);
    return res.data.data;
  },

  getEmployeeBalances: async (employeeId: string, academicYearId: string): Promise<EmployeeLeaveBalance[]> => {
    const res = await apiClient.get<ApiResponse<EmployeeLeaveBalance[]>>(`/school/staff-ops/leave-balances/${employeeId}`, {
      params: { academicYearId }
    });
    return res.data.data;
  },

  getMyBalances: async (academicYearId: string): Promise<EmployeeLeaveBalance[]> => {
    const res = await apiClient.get<ApiResponse<EmployeeLeaveBalance[]>>('/school/staff-ops/leave-balances/me', {
      params: { academicYearId }
    });
    return res.data.data;
  }
};
