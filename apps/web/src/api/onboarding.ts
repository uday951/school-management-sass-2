import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface StudentOnboardingRequest {
  id: string;
  inviteId?: string | null;
  requestedAcademicYearId?: string | null;
  requestedClassId?: string | null;
  requestedSectionId?: string | null;
  personalData: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    personalEmail?: string;
    personalPhone?: string;
  };
  admissionData: {
    admissionNumber: string;
    admissionDate: string;
    rollNumber?: string;
  };
  addressData?: {
    currentAddressLine1: string;
    currentAddressLine2?: string;
    currentCity: string;
    currentState: string;
    currentCountry: string;
    currentPostalCode: string;
  } | null;
  guardianData?: {
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
    email?: string;
  } | null;
  status: 'PENDING' | 'NEEDS_CORRECTION' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submittedAt: string;
  rejectionReason?: string | null;
  correctionMessage?: string | null;
  createdAt: string;
  academicYear?: { name: string } | null;
  class?: { name: string } | null;
  section?: { name: string } | null;
  invite?: { publicCode: string; inviteType: string } | null;
}

export interface ChildClaimRequest {
  id: string;
  guardianUserId: string;
  studentId?: string | null;
  studentAdmissionNumber: string;
  studentDateOfBirth: string;
  relationship: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submittedAt: string;
  rejectionReason?: string | null;
  createdAt: string;
  guardianUser?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    guardians?: any[];
  } | null;
}

export const onboardingApi = {
  // Public
  submitStudentRequest: async (data: {
    publicCode: string;
    personalData: any;
    admissionData: any;
    addressData?: any;
    guardianData?: any;
  }): Promise<StudentOnboardingRequest> => {
    const response = await apiClient.post<ApiResponse<StudentOnboardingRequest>>('/onboarding/student', data);
    return response.data.data;
  },

  submitClaim: async (data: {
    tenantId: string;
    studentAdmissionNumber: string;
    studentDateOfBirth: string;
    relationship: string;
  }): Promise<ChildClaimRequest> => {
    const response = await apiClient.post<ApiResponse<ChildClaimRequest>>('/claims/child', data);
    return response.data.data;
  },

  // Parent profile
  getLinkedChildren: async (): Promise<Array<{ relationship: string; isPrimary: boolean; student: any }>> => {
    const response = await apiClient.get<ApiResponse<Array<{ relationship: string; isPrimary: boolean; student: any }>>>('/parent/children');
    return response.data.data;
  },

  // Student profile
  getStudentSummary: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/student/summary');
    return response.data.data;
  },

  // Admin
  listStudentRequests: async (params: { status?: string; page: number; limit: number }): Promise<{ total: number; requests: StudentOnboardingRequest[] }> => {
    const response = await apiClient.get<ApiResponse<{ total: number; requests: StudentOnboardingRequest[] }>>('/school/onboarding/students', { params });
    return response.data.data;
  },

  reviewStudentRequest: async (
    id: string,
    data: {
      action: 'APPROVE' | 'REJECT' | 'CORRECT';
      message?: string;
      createLoginAccount?: boolean;
      loginEmail?: string;
      temporaryPassword?: string;
    }
  ): Promise<StudentOnboardingRequest> => {
    const response = await apiClient.post<ApiResponse<StudentOnboardingRequest>>(`/school/onboarding/students/${id}/review`, data);
    return response.data.data;
  },

  listGuardianClaims: async (params: { status?: string; page: number; limit: number }): Promise<{ total: number; claims: ChildClaimRequest[] }> => {
    const response = await apiClient.get<ApiResponse<{ total: number; claims: ChildClaimRequest[] }>>('/school/onboarding/guardians', { params });
    return response.data.data;
  },

  reviewGuardianClaim: async (
    id: string,
    data: { action: 'APPROVE' | 'REJECT'; rejectionReason?: string }
  ): Promise<ChildClaimRequest> => {
    const response = await apiClient.post<ApiResponse<ChildClaimRequest>>(`/school/onboarding/guardians/${id}/review`, data);
    return response.data.data;
  }
};
