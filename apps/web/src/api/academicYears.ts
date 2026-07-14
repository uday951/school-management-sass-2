import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface AcademicYear {
  id: string;
  name: string;
  code?: string | null;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export const academicYearsApi = {
  list: async (): Promise<AcademicYear[]> => {
    const response = await apiClient.get<ApiResponse<AcademicYear[]>>('/school/academic-years');
    return response.data.data;
  },

  get: async (id: string): Promise<AcademicYear> => {
    const response = await apiClient.get<ApiResponse<AcademicYear>>(`/school/academic-years/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<AcademicYear>): Promise<AcademicYear> => {
    const response = await apiClient.post<ApiResponse<AcademicYear>>('/school/academic-years', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<AcademicYear>): Promise<AcademicYear> => {
    const response = await apiClient.patch<ApiResponse<AcademicYear>>(`/school/academic-years/${id}`, data);
    return response.data.data;
  },

  setCurrent: async (id: string): Promise<AcademicYear> => {
    const response = await apiClient.patch<ApiResponse<AcademicYear>>(`/school/academic-years/${id}/set-current`);
    return response.data.data;
  },
};
