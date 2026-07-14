import apiClient from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  designation: string;
  employeeType: 'TEACHING' | 'ADMINISTRATIVE' | 'SUPPORT' | 'MANAGEMENT' | 'OTHER';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERN' | 'VISITING' | 'OTHER';
  primaryDepartment?: { name: string } | null;
  status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'RESIGNED' | 'TERMINATED' | 'RETIRED' | 'ARCHIVED';
  createdAt: string;
  user?: {
    status: string;
    role?: { name: string } | null;
  } | null;
}

export interface EmployeeProfile extends Omit<Employee, 'primaryDepartment' | 'user'> {
  middleName?: string | null;
  preferredName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  personalEmail?: string | null;
  workEmail?: string | null;
  personalPhone?: string | null;
  workPhone?: string | null;
  joiningDate: string;
  confirmationDate?: string | null;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  reportingManagerEmployeeId?: string | null;
  primaryDepartmentId?: string | null;
  primaryDepartment?: any;

  // Address
  currentAddressLine1?: string | null;
  currentAddressLine2?: string | null;
  currentCity?: string | null;
  currentState?: string | null;
  currentCountry?: string | null;
  currentPostalCode?: string | null;
  permanentAddressLine1?: string | null;
  permanentAddressLine2?: string | null;
  permanentCity?: string | null;
  permanentState?: string | null;
  permanentCountry?: string | null;
  permanentPostalCode?: string | null;
  sameAsCurrentAddress: boolean;

  // Emergency
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
  notes?: string | null;

  user?: {
    id: string;
    email: string;
    status: string;
    role?: { id: string; name: string } | null;
  } | null;

  qualifications: Array<{
    id: string;
    qualificationName: string;
    specialization?: string | null;
    institution: string;
    universityOrBoard?: string | null;
    startYear?: number | null;
    completionYear?: number | null;
    gradeOrPercentage?: string | null;
  }>;

  experiences: Array<{
    id: string;
    organizationName: string;
    designation: string;
    startDate: string;
    endDate?: string | null;
    isCurrent: boolean;
    description?: string | null;
  }>;

  teacherAssignments: Array<{
    id: string;
    academicYear: { name: string };
    subject: { name: string };
    gradeLevel: { name: string };
    section: { name: string };
    assignmentType: string;
  }>;

  classTeacherAssignments: Array<{
    id: string;
    academicYear: { name: string };
    gradeLevel: { name: string };
    section: { name: string };
    isPrimary: boolean;
  }>;

  departmentHeadAssignments: Array<{
    id: string;
    department: { name: string };
    startDate: string;
  }>;
}

export const employeesApi = {
  list: async (params: {
    search?: string;
    employeeType?: string;
    employmentType?: string;
    departmentId?: string;
    status?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResponse<Employee>> => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.employeeType) searchParams.set('employeeType', params.employeeType);
    if (params.employmentType) searchParams.set('employmentType', params.employmentType);
    if (params.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params.status) searchParams.set('status', params.status);
    searchParams.set('page', String(params.page));
    searchParams.set('limit', String(params.limit));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Employee>>>(
      `/school/employees?${searchParams.toString()}`,
    );
    return response.data.data;
  },

  getProfile: async (id: string): Promise<EmployeeProfile> => {
    const response = await apiClient.get<ApiResponse<EmployeeProfile>>(`/school/employees/${id}`);
    return response.data.data;
  },

  create: async (data: any): Promise<Employee> => {
    const response = await apiClient.post<ApiResponse<Employee>>('/school/employees', data);
    return response.data.data;
  },

  update: async (id: string, data: any): Promise<Employee> => {
    const response = await apiClient.patch<ApiResponse<Employee>>(`/school/employees/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (id: string, data: { status: string; reason?: string }): Promise<Employee> => {
    const response = await apiClient.patch<ApiResponse<Employee>>(`/school/employees/${id}/status`, data);
    return response.data.data;
  },

  // Account management
  createAccount: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/school/employees/${id}/account`, data);
    return response.data.data;
  },

  updateAccountStatus: async (id: string, data: { active: boolean }): Promise<any> => {
    const response = await apiClient.patch<ApiResponse<any>>(`/school/employees/${id}/account/status`, data);
    return response.data.data;
  },

  updateRoles: async (id: string, data: { schoolRoleId: string }): Promise<any> => {
    const response = await apiClient.put<ApiResponse<any>>(`/school/employees/${id}/roles`, data);
    return response.data.data;
  },

  // Qualifications
  addQualification: async (employeeId: string, data: any): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/school/employees/${employeeId}/qualifications`, data);
    return response.data.data;
  },

  deleteQualification: async (id: string): Promise<void> => {
    await apiClient.delete(`/school/employee-qualifications/${id}`);
  },

  // Experience
  addExperience: async (employeeId: string, data: any): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/school/employees/${employeeId}/experience`, data);
    return response.data.data;
  },

  deleteExperience: async (id: string): Promise<void> => {
    await apiClient.delete(`/school/employee-experience/${id}`);
  },
};
