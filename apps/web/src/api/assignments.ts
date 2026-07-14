import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface TeacherAssignment {
  id: string;
  employeeId: string;
  subjectId: string;
  gradeLevelId: string;
  sectionId: string;
  assignmentType: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    designation: string;
  };
  subject: { name: string; code: string };
  gradeLevel: { name: string };
  section: { name: string };
}

export interface ClassTeacherAssignment {
  id: string;
  employeeId: string;
  gradeLevelId: string;
  sectionId: string;
  isPrimary: boolean;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    designation: string;
  };
  gradeLevel: { name: string };
  section: { name: string };
}

export interface DepartmentHeadAssignment {
  id: string;
  departmentId: string;
  employeeId: string;
  startDate: string;
  department: { name: string; code: string };
  employee: { firstName: string; lastName: string; employeeNumber: string; designation: string };
}

export const assignmentsApi = {
  // Teaching assignments
  listTeacherAssignments: async (params: {
    academicYearId?: string;
    gradeLevelId?: string;
    sectionId?: string;
    employeeId?: string;
  }): Promise<TeacherAssignment[]> => {
    const searchParams = new URLSearchParams();
    if (params.academicYearId) searchParams.set('academicYearId', params.academicYearId);
    if (params.gradeLevelId) searchParams.set('gradeLevelId', params.gradeLevelId);
    if (params.sectionId) searchParams.set('sectionId', params.sectionId);
    if (params.employeeId) searchParams.set('employeeId', params.employeeId);

    const response = await apiClient.get<ApiResponse<TeacherAssignment[]>>(
      `/school/teacher-assignments?${searchParams.toString()}`,
    );
    return response.data.data;
  },

  createTeacherAssignment: async (data: {
    academicYearId: string;
    employeeId: string;
    subjectId: string;
    gradeLevelId: string;
    sectionId: string;
    assignmentType?: string;
  }): Promise<TeacherAssignment> => {
    const response = await apiClient.post<ApiResponse<TeacherAssignment>>('/school/teacher-assignments', data);
    return response.data.data;
  },

  deleteTeacherAssignment: async (id: string): Promise<void> => {
    await apiClient.delete(`/school/teacher-assignments/${id}`);
  },

  // Class teacher assignments
  listClassTeachers: async (academicYearId?: string): Promise<ClassTeacherAssignment[]> => {
    const searchParams = new URLSearchParams();
    if (academicYearId) searchParams.set('academicYearId', academicYearId);

    const response = await apiClient.get<ApiResponse<ClassTeacherAssignment[]>>(
      `/school/class-teacher-assignments?${searchParams.toString()}`,
    );
    return response.data.data;
  },

  assignClassTeacher: async (data: {
    academicYearId: string;
    gradeLevelId: string;
    sectionId: string;
    employeeId: string;
    isPrimary?: boolean;
  }): Promise<ClassTeacherAssignment> => {
    const response = await apiClient.post<ApiResponse<ClassTeacherAssignment>>('/school/class-teacher-assignments', data);
    return response.data.data;
  },

  deleteClassTeacher: async (id: string): Promise<void> => {
    await apiClient.delete(`/school/class-teacher-assignments/${id}`);
  },

  // Department heads
  listDepartmentHeads: async (): Promise<DepartmentHeadAssignment[]> => {
    const response = await apiClient.get<ApiResponse<DepartmentHeadAssignment[]>>('/school/department-heads');
    return response.data.data;
  },

  assignDepartmentHead: async (data: {
    departmentId: string;
    employeeId: string;
    startDate: string;
  }): Promise<DepartmentHeadAssignment> => {
    const response = await apiClient.post<ApiResponse<DepartmentHeadAssignment>>('/school/department-heads', data);
    return response.data.data;
  },
};
