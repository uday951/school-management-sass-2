import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface Department {
  id: string;
  name: string;
  code: string;
  type: 'ACADEMIC' | 'ADMINISTRATIVE' | 'SUPPORT' | 'OTHER';
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export const departmentsApi = {
  list: async (): Promise<Department[]> => {
    const response = await apiClient.get<ApiResponse<Department[]>>('/school/departments');
    return response.data.data;
  },

  get: async (id: string): Promise<Department> => {
    const response = await apiClient.get<ApiResponse<Department>>(`/school/departments/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.post<ApiResponse<Department>>('/school/departments', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.patch<ApiResponse<Department>>(`/school/departments/${id}`, data);
    return response.data.data;
  },
};
