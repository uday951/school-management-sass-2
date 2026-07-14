import apiClient from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';

export interface Guardian {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phone: string;
  alternatePhone?: string | null;
  email?: string | null;
  occupation?: string | null;
  employer?: string | null;
  status: string;
  createdAt: string;
  students?: Array<{
    id: string;
    relationship: string;
    student: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }> | null;
}

export interface GuardianProfile extends Guardian {
  students: Array<{
    id: string;
    relationship: string;
    isPrimary: boolean;
    isEmergencyContact: boolean;
    isAuthorizedPickup: boolean;
    receivesAcademicUpdates: boolean;
    receivesAttendanceUpdates: boolean;
    receivesFeeUpdates: boolean;
    student: {
      id: string;
      firstName: string;
      lastName: string;
      admissionNumber: string;
      status: string;
      enrollments: Array<{
        gradeLevel: { name: string };
        section: { name: string };
      }>;
    };
  }>;
}

export const guardiansApi = {
  list: async (params: { search?: string; page: number; limit: number }): Promise<PaginatedResponse<Guardian>> => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    searchParams.set('page', String(params.page));
    searchParams.set('limit', String(params.limit));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Guardian>>>(
      `/school/guardians?${searchParams.toString()}`,
    );
    return response.data.data;
  },

  getProfile: async (id: string): Promise<GuardianProfile> => {
    const response = await apiClient.get<ApiResponse<GuardianProfile>>(`/school/guardians/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Guardian>): Promise<Guardian> => {
    const response = await apiClient.post<ApiResponse<Guardian>>('/school/guardians', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Guardian>): Promise<Guardian> => {
    const response = await apiClient.patch<ApiResponse<Guardian>>(`/school/guardians/${id}`, data);
    return response.data.data;
  },
};
