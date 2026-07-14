import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface Role {
  id: string;
  name: string;
  code: string;
  scope: string;
  isSystem: boolean;
  description?: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export const rolesApi = {
  list: async (): Promise<Role[]> => {
    const response = await apiClient.get<ApiResponse<Role[]>>('/school/roles');
    return response.data.data;
  },

  get: async (id: string): Promise<Role> => {
    const response = await apiClient.get<ApiResponse<Role>>(`/school/roles/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Role>): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>('/school/roles', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Role>): Promise<Role> => {
    const response = await apiClient.patch<ApiResponse<Role>>(`/school/roles/${id}`, data);
    return response.data.data;
  },

  updatePermissions: async (id: string, permissions: string[]): Promise<Role> => {
    const response = await apiClient.put<ApiResponse<Role>>(`/school/roles/${id}/permissions`, {
      permissions,
    });
    return response.data.data;
  },
};
