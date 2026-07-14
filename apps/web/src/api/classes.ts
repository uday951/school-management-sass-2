import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface GradeLevel {
  id: string;
  name: string;
  code: string;
  displayOrder: number;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  gradeLevelId: string;
  name: string;
  code?: string | null;
  capacity?: number | null;
  displayOrder: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  gradeLevel?: { name: string; code: string };
}

export const classesApi = {
  // Classes
  listClasses: async (): Promise<GradeLevel[]> => {
    const response = await apiClient.get<ApiResponse<GradeLevel[]>>('/school/classes');
    return response.data.data;
  },

  getClass: async (id: string): Promise<GradeLevel> => {
    const response = await apiClient.get<ApiResponse<GradeLevel>>(`/school/classes/${id}`);
    return response.data.data;
  },

  createClass: async (data: Partial<GradeLevel>): Promise<GradeLevel> => {
    const response = await apiClient.post<ApiResponse<GradeLevel>>('/school/classes', data);
    return response.data.data;
  },

  updateClass: async (id: string, data: Partial<GradeLevel>): Promise<GradeLevel> => {
    const response = await apiClient.patch<ApiResponse<GradeLevel>>(`/school/classes/${id}`, data);
    return response.data.data;
  },

  // Sections
  listSections: async (gradeLevelId?: string): Promise<Section[]> => {
    const params = new URLSearchParams();
    if (gradeLevelId) params.set('gradeLevelId', gradeLevelId);
    const response = await apiClient.get<ApiResponse<Section[]>>(`/school/sections?${params.toString()}`);
    return response.data.data;
  },

  getSection: async (id: string): Promise<Section> => {
    const response = await apiClient.get<ApiResponse<Section>>(`/school/sections/${id}`);
    return response.data.data;
  },

  createSection: async (data: Partial<Section>): Promise<Section> => {
    const response = await apiClient.post<ApiResponse<Section>>('/school/sections', data);
    return response.data.data;
  },

  updateSection: async (id: string, data: Partial<Section>): Promise<Section> => {
    const response = await apiClient.patch<ApiResponse<Section>>(`/school/sections/${id}`, data);
    return response.data.data;
  },
};
