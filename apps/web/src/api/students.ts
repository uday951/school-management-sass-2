import apiClient from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  photoUrl?: string | null;
  gender: string;
  dateOfBirth: string;
  status: 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN' | 'TRANSFERRED' | 'GRADUATED' | 'ARCHIVED';
  createdAt: string;
  currentEnrollment?: {
    academicYear: string;
    class: string;
    section: string;
    rollNumber?: string | null;
  } | null;
  primaryGuardian?: {
    name: string;
    phone: string;
  } | null;
}

export interface StudentProfile extends Omit<Student, 'currentEnrollment' | 'primaryGuardian'> {
  middleName?: string | null;
  preferredName?: string | null;
  bloodGroup?: string | null;
  nationality?: string | null;
  motherTongue?: string | null;
  personalEmail?: string | null;
  personalPhone?: string | null;
  admissionDate: string;
  joiningType?: string | null;
  previousSchoolName?: string | null;
  previousClassName?: string | null;
  
  // Addresses
  currentAddressLine1: string;
  currentAddressLine2?: string | null;
  currentCity: string;
  currentState: string;
  currentCountry: string;
  currentPostalCode: string;
  
  permanentAddressLine1: string;
  permanentAddressLine2?: string | null;
  permanentCity: string;
  permanentState: string;
  permanentCountry: string;
  permanentPostalCode: string;
  sameAsCurrentAddress: boolean;

  // Emergency / Sensitive Info
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
  allergies?: string | null;
  medicalNotes?: string | null;
  specialAssistanceNotes?: string | null;

  enrollments: Array<{
    id: string;
    academicYearId: string;
    gradeLevelId: string;
    sectionId: string;
    rollNumber?: string | null;
    enrollmentDate: string;
    status: string;
    isCurrent: boolean;
    startDate?: string | null;
    endDate?: string | null;
    gradeLevel: { name: string };
    section: { name: string };
    academicYear: { name: string };
  }>;

  guardians: Array<{
    id: string;
    relationship: string;
    isPrimary: boolean;
    isEmergencyContact: boolean;
    isAuthorizedPickup: boolean;
    receivesAcademicUpdates: boolean;
    receivesAttendanceUpdates: boolean;
    receivesFeeUpdates: boolean;
    hasPortalAccess: boolean;
    guardian: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      email?: string | null;
      occupation?: string | null;
    };
  }>;

  documents: Array<{
    id: string;
    documentType: string;
    title: string;
    fileUrl?: string | null;
    issueDate?: string | null;
    expiryDate?: string | null;
    verificationStatus: string;
  }>;

  currentEnrollment: any;
}

export const studentsApi = {
  list: async (params: {
    search?: string;
    academicYearId?: string;
    gradeLevelId?: string;
    sectionId?: string;
    status?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResponse<Student>> => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.academicYearId) searchParams.set('academicYearId', params.academicYearId);
    if (params.gradeLevelId) searchParams.set('gradeLevelId', params.gradeLevelId);
    if (params.sectionId) searchParams.set('sectionId', params.sectionId);
    if (params.status) searchParams.set('status', params.status);
    searchParams.set('page', String(params.page));
    searchParams.set('limit', String(params.limit));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Student>>>(
      `/school/students?${searchParams.toString()}`,
    );
    return response.data.data;
  },

  getProfile: async (id: string): Promise<StudentProfile> => {
    const response = await apiClient.get<ApiResponse<StudentProfile>>(`/school/students/${id}`);
    return response.data.data;
  },

  create: async (data: any): Promise<{ student: Student; enrollment: any }> => {
    const response = await apiClient.post<ApiResponse<{ student: Student; enrollment: any }>>(
      '/school/students',
      data,
    );
    return response.data.data;
  },

  update: async (id: string, data: any): Promise<StudentProfile> => {
    const response = await apiClient.patch<ApiResponse<StudentProfile>>(`/school/students/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (id: string, data: { status: string; reason?: string }): Promise<StudentProfile> => {
    const response = await apiClient.patch<ApiResponse<StudentProfile>>(`/school/students/${id}/status`, data);
    return response.data.data;
  },

  // Enrollments
  transferSection: async (enrollmentId: string, data: { targetSectionId: string; reason?: string }): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/school/enrollments/${enrollmentId}/transfer-section`,
      data,
    );
    return response.data.data;
  },

  changeClass: async (studentId: string, data: {
    academicYearId: string;
    gradeLevelId: string;
    sectionId: string;
    rollNumber?: string;
  }): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/school/students/${studentId}/change-class`, data);
    return response.data.data;
  },

  // Links
  linkGuardian: async (studentId: string, data: any): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/school/students/${studentId}/guardians`, data);
    return response.data.data;
  },

  unlinkGuardian: async (linkId: string): Promise<void> => {
    await apiClient.delete(`/school/student-guardians/${linkId}`);
  },

  // Documents
  listDocuments: async (studentId: string): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/school/students/${studentId}/documents`);
    return response.data.data;
  },

  addDocument: async (studentId: string, data: any): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/school/students/${studentId}/documents`, data);
    return response.data.data;
  },

  archiveDocument: async (docId: string): Promise<void> => {
    await apiClient.delete(`/school/student-documents/${docId}`);
  },
};
