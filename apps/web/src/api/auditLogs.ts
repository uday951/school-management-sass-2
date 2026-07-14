import apiClient from '@/lib/axios';
import type { ApiResponse, AuditLog, PaginatedResponse } from '@/types';

export interface AuditLogsQuery {
  search?: string;
  action?: string;
  entityType?: string;
  schoolId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const auditLogsApi = {
  list: async (
    query: AuditLogsQuery = {},
  ): Promise<ApiResponse<PaginatedResponse<AuditLog>>> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) {
        params.set(k, String(v));
      }
    });
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>(
      `/platform/audit-logs?${params.toString()}`,
    );
    return response.data;
  },
};
