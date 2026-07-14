import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface ImportJob {
  id: string;
  fileName: string;
  status: 'UPLOADED' | 'VALIDATING' | 'READY' | 'IMPORTING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED' | 'CANCELLED';
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedRows: number;
  failedRows: number;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface ImportRow {
  id: string;
  rowNumber: number;
  rawData: any;
  validationStatus: 'VALID' | 'INVALID' | 'WARNING' | 'DUPLICATE';
  errors?: string[] | null;
  warnings?: string[] | null;
  importStatus: 'PENDING' | 'IMPORTED' | 'FAILED';
  createdAt: string;
}

export const importsApi = {
  listJobs: async (params: { page: number; limit: number }): Promise<{ total: number; jobs: ImportJob[] }> => {
    const response = await apiClient.get<ApiResponse<{ total: number; jobs: ImportJob[] }>>('/school/imports', { params });
    return response.data.data;
  },

  uploadCSV: async (fileName: string, csvContent: string): Promise<ImportJob> => {
    const response = await apiClient.post<ApiResponse<ImportJob>>('/school/imports/upload', { fileName, csvContent });
    return response.data.data;
  },

  getJobDetails: async (
    id: string,
    params: { validationStatus?: string; page: number; limit: number }
  ): Promise<{ job: ImportJob; rows: ImportRow[]; totalRows: number }> => {
    const response = await apiClient.get<ApiResponse<{ job: ImportJob; rows: ImportRow[]; totalRows: number }>>(
      `/school/imports/${id}`,
      { params }
    );
    return response.data.data;
  },

  validateJob: async (id: string): Promise<ImportJob> => {
    const response = await apiClient.post<ApiResponse<ImportJob>>(`/school/imports/${id}/validate`);
    return response.data.data;
  },

  executeImport: async (id: string, duplicateStrategy: 'SKIP' | 'ERROR' = 'SKIP'): Promise<ImportJob> => {
    const response = await apiClient.post<ApiResponse<ImportJob>>(
      `/school/imports/${id}/execute`,
      { duplicateStrategy }
    );
    return response.data.data;
  }
};
