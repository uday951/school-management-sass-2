import apiClient from '@/lib/axios';
import type { ApiResponse, DashboardStats } from '@/types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      '/platform/dashboard',
    );
    return response.data.data;
  },
};
