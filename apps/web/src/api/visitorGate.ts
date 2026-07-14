import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface Visitor {
  id: string;
  fullName: string;
  phone?: string | null;
  identificationType?: string | null;
  identificationLast4?: string | null;
  organization?: string | null;
}

export interface VisitRecord {
  id: string;
  visitorId: string;
  visitDate: string;
  checkInAt: string;
  checkOutAt?: string | null;
  purpose: string;
  personToMeetUserId?: string | null;
  personToMeetEmployeeId?: string | null;
  badgeNumber?: string | null;
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  notes?: string | null;
  visitor: Visitor;
}

export interface StudentGatePass {
  id: string;
  studentId: string;
  studentEnrollmentId: string;
  requestType: 'EARLY_EXIT' | 'TEMPORARY_EXIT' | 'EMERGENCY_EXIT' | 'OTHER';
  reason: string;
  requestedExitAt: string;
  expectedReturnAt?: string | null;
  actualExitAt?: string | null;
  actualReturnAt?: string | null;
  pickupGuardianId?: string | null;
  pickupVisitorId?: string | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXITED' | 'RETURNED' | 'CANCELLED';
  reviewComment?: string | null;
  student?: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  pickupGuardian?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export const visitorGateApi = {
  getDashboardStats: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/school/gate/dashboard');
    return res.data.data;
  },

  listVisitors: async (search?: string): Promise<Visitor[]> => {
    const res = await apiClient.get<ApiResponse<Visitor[]>>('/school/gate/visitors', { params: { search } });
    return res.data.data;
  },

  listVisits: async (params?: { date?: string; status?: string }): Promise<VisitRecord[]> => {
    const res = await apiClient.get<ApiResponse<VisitRecord[]>>('/school/gate/visits', { params });
    return res.data.data;
  },

  checkInVisitor: async (data: Partial<VisitRecord> & Partial<Visitor>): Promise<VisitRecord> => {
    const res = await apiClient.post<ApiResponse<VisitRecord>>('/school/gate/visitors/check-in', data);
    return res.data.data;
  },

  checkOutVisitor: async (id: string): Promise<VisitRecord> => {
    const res = await apiClient.post<ApiResponse<VisitRecord>>(`/school/gate/visits/${id}/check-out`);
    return res.data.data;
  },

  listGatePasses: async (params?: { studentId?: string; status?: string }): Promise<StudentGatePass[]> => {
    const res = await apiClient.get<ApiResponse<StudentGatePass[]>>('/school/gate/gate-passes', { params });
    return res.data.data;
  },

  createGatePass: async (data: Partial<StudentGatePass>): Promise<StudentGatePass> => {
    const res = await apiClient.post<ApiResponse<StudentGatePass>>('/school/gate/gate-passes', data);
    return res.data.data;
  },

  approveGatePass: async (id: string, comment?: string): Promise<StudentGatePass> => {
    const res = await apiClient.post<ApiResponse<StudentGatePass>>(`/school/gate/gate-passes/${id}/approve`, { comment });
    return res.data.data;
  },

  rejectGatePass: async (id: string, comment?: string): Promise<StudentGatePass> => {
    const res = await apiClient.post<ApiResponse<StudentGatePass>>(`/school/gate/gate-passes/${id}/reject`, { comment });
    return res.data.data;
  },

  recordExit: async (id: string): Promise<StudentGatePass> => {
    const res = await apiClient.post<ApiResponse<StudentGatePass>>(`/school/gate/gate-passes/${id}/exit`);
    return res.data.data;
  },

  recordReturn: async (id: string): Promise<StudentGatePass> => {
    const res = await apiClient.post<ApiResponse<StudentGatePass>>(`/school/gate/gate-passes/${id}/return`);
    return res.data.data;
  }
};
