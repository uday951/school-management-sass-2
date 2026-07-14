import apiClient from '@/lib/axios';
import type { ApiResponse, School } from '@/types';

export interface SetupStatusResponse {
  percentage: number;
  steps: {
    profile: boolean;
    academicYear: boolean;
    department: boolean;
    class: boolean;
    section: boolean;
    subject: boolean;
    mapping: boolean;
  };
  counts: {
    academicYears: number;
    departments: number;
    classes: number;
    sections: number;
    subjects: number;
    classSubjects: number;
  };
}

export interface SchoolDashboardResponse {
  stats: {
    academicYearsCount: number;
    departmentsCount: number;
    classesCount: number;
    sectionsCount: number;
    subjectsCount: number;
    classSubjectsCount: number;
    setupPercentage: number;
  };
  setupSteps: SetupStatusResponse['steps'];
  currentAcademicYear: { id: string; name: string; status: string } | null;
  recentActivity: any[];
}

export const schoolApi = {
  getProfile: async (): Promise<School> => {
    const response = await apiClient.get<ApiResponse<School>>('/school/profile');
    return response.data.data;
  },

  updateProfile: async (data: Partial<School>): Promise<School> => {
    const response = await apiClient.patch<ApiResponse<School>>('/school/profile', data);
    return response.data.data;
  },

  getSetupStatus: async (): Promise<SetupStatusResponse> => {
    const response = await apiClient.get<ApiResponse<SetupStatusResponse>>('/school/setup-status');
    return response.data.data;
  },

  getDashboardData: async (): Promise<SchoolDashboardResponse> => {
    const response = await apiClient.get<ApiResponse<SchoolDashboardResponse>>('/school/dashboard');
    return response.data.data;
  },
};
