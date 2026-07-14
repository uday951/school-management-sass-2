import apiClient from '@/lib/axios';
import type {
  ApiResponse,
  School,
  SchoolsQuery,
  PaginatedResponse,
  CreateSchoolFormData,
  CreateSchoolResponse,
  UpdateSchoolStatusPayload,
} from '@/types';

export const schoolsApi = {
  list: async (
    query: SchoolsQuery = {},
  ): Promise<ApiResponse<PaginatedResponse<School>>> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) {
        params.set(k, String(v));
      }
    });
    const response = await apiClient.get<ApiResponse<PaginatedResponse<School>>>(
      `/platform/schools?${params.toString()}`,
    );
    return response.data;
  },

  get: async (id: string): Promise<School> => {
    const response = await apiClient.get<ApiResponse<School>>(
      `/platform/schools/${id}`,
    );
    return response.data.data;
  },

  create: async (
    data: CreateSchoolFormData,
  ): Promise<CreateSchoolResponse> => {
    const response = await apiClient.post<ApiResponse<CreateSchoolResponse>>(
      '/platform/schools',
      data,
    );
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<CreateSchoolFormData>,
  ): Promise<School> => {
    const response = await apiClient.patch<ApiResponse<School>>(
      `/platform/schools/${id}`,
      data,
    );
    return response.data.data;
  },

  updateStatus: async (
    id: string,
    payload: UpdateSchoolStatusPayload,
  ): Promise<School> => {
    const response = await apiClient.patch<ApiResponse<School>>(
      `/platform/schools/${id}/status`,
      payload,
    );
    return response.data.data;
  },
};
