import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  subjectType: 'CORE' | 'ELECTIVE' | 'OPTIONAL' | 'ACTIVITY' | 'OTHER';
  departmentId?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  department?: { name: string; code: string };
}

export interface ClassSubject {
  id: string;
  gradeLevelId: string;
  subjectId: string;
  academicYearId: string;
  sectionId?: string | null;
  isMandatory: boolean;
  displayOrder: number;
  status: string;
  gradeLevel?: { name: string; code: string };
  subject?: { name: string; code: string; subjectType: string };
  academicYear?: { name: string };
  section?: { name: string } | null;
}

export const subjectsApi = {
  // Subjects
  list: async (departmentId?: string): Promise<Subject[]> => {
    const params = new URLSearchParams();
    if (departmentId) params.set('departmentId', departmentId);
    const response = await apiClient.get<ApiResponse<Subject[]>>(`/school/subjects?${params.toString()}`);
    return response.data.data;
  },

  get: async (id: string): Promise<Subject> => {
    const response = await apiClient.get<ApiResponse<Subject>>(`/school/subjects/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Subject>): Promise<Subject> => {
    const response = await apiClient.post<ApiResponse<Subject>>('/school/subjects', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Subject>): Promise<Subject> => {
    const response = await apiClient.patch<ApiResponse<Subject>>(`/school/subjects/${id}`, data);
    return response.data.data;
  },

  // Class Subject Mapping
  listMappings: async (
    academicYearId: string,
    gradeLevelId?: string,
    sectionId?: string,
  ): Promise<ClassSubject[]> => {
    const params = new URLSearchParams({ academicYearId });
    if (gradeLevelId) params.set('gradeLevelId', gradeLevelId);
    if (sectionId) params.set('sectionId', sectionId);
    const response = await apiClient.get<ApiResponse<ClassSubject[]>>(`/school/class-subjects?${params.toString()}`);
    return response.data.data;
  },

  mapSubject: async (data: {
    gradeLevelId: string;
    subjectId: string;
    academicYearId: string;
    sectionId?: string;
    isMandatory?: boolean;
  }): Promise<ClassSubject> => {
    const response = await apiClient.post<ApiResponse<ClassSubject>>('/school/class-subjects', data);
    return response.data.data;
  },

  bulkMapSubjects: async (data: {
    gradeLevelId: string;
    subjectIds: string[];
    academicYearId: string;
    sectionId?: string;
    isMandatory?: boolean;
  }): Promise<{ count: number; data: ClassSubject[] }> => {
    const response = await apiClient.post<ApiResponse<{ count: number; data: ClassSubject[] }>>(
      '/school/class-subjects/bulk',
      data,
    );
    return response.data.data;
  },

  unmapSubject: async (id: string): Promise<ClassSubject> => {
    const response = await apiClient.delete<ApiResponse<ClassSubject>>(`/school/class-subjects/${id}`);
    return response.data.data;
  },
};
