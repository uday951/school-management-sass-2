import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface Homework {
  id: string;
  title: string;
  description: string;
  attachmentUrl?: string | null;
  assignedDate: string;
  dueDate?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  subject?: { name: string };
  teacher?: { firstName: string; lastName: string };
  class?: { name: string };
  section?: { name: string };
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  attachmentUrl?: string | null;
  assignedAt: string;
  dueAt: string;
  maximumMarks?: number | null;
  allowLateSubmission: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  subject?: { name: string };
  teacher?: { firstName: string; lastName: string };
  class?: { name: string };
  section?: { name: string };
  subjectName?: string;
  teacherName?: string;
  submissionStatus?: string;
  submission?: AssignmentSubmission | null;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt?: string | null;
  status: 'DRAFT' | 'SUBMITTED' | 'LATE' | 'RETURNED' | 'GRADED';
  textResponse?: string | null;
  attachmentUrl?: string | null;
  isLate: boolean;
  student?: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  grade?: AssignmentGrade | null;
}

export interface AssignmentGrade {
  id: string;
  assignmentSubmissionId: string;
  marksAwarded?: number | null;
  feedback?: string | null;
  gradedByUserId: string;
  gradedAt: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description?: string | null;
  materialType: 'NOTES' | 'PDF' | 'WORKSHEET' | 'PRESENTATION' | 'IMAGE' | 'LINK' | 'OTHER';
  fileAttachmentUrl?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  subject?: { name: string };
  teacher?: { firstName: string; lastName: string };
  class?: { name: string };
  section?: { name: string } | null;
}

export const learningApi = {
  // Homework - Teacher
  listTeacherHomework: async (): Promise<Homework[]> => {
    const res = await apiClient.get<ApiResponse<Homework[]>>('/school/learning/teacher/homework');
    return res.data.data;
  },

  createHomework: async (data: {
    academicYearId: string;
    classId: string;
    sectionId: string;
    subjectId: string;
    title: string;
    description: string;
    attachmentUrl?: string;
    assignedDate: string;
    dueDate?: string;
  }): Promise<Homework> => {
    const res = await apiClient.post<ApiResponse<Homework>>('/school/learning/teacher/homework', data);
    return res.data.data;
  },

  publishHomework: async (id: string): Promise<Homework> => {
    const res = await apiClient.post<ApiResponse<Homework>>(`/school/learning/teacher/homework/${id}/publish`);
    return res.data.data;
  },

  // Homework - Student & Guardian
  listStudentHomework: async (academicYearId: string): Promise<Homework[]> => {
    const res = await apiClient.get<ApiResponse<Homework[]>>('/school/learning/student/homework', {
      params: { academicYearId }
    });
    return res.data.data;
  },

  listChildHomework: async (studentId: string, academicYearId: string): Promise<Homework[]> => {
    const res = await apiClient.get<ApiResponse<Homework[]>>(`/school/learning/guardian/children/${studentId}/homework`, {
      params: { academicYearId }
    });
    return res.data.data;
  },

  // Assignments - Teacher
  listTeacherAssignments: async (): Promise<Assignment[]> => {
    const res = await apiClient.get<ApiResponse<Assignment[]>>('/school/learning/teacher/assignments');
    return res.data.data;
  },

  createAssignment: async (data: {
    academicYearId: string;
    classId: string;
    sectionId: string;
    subjectId: string;
    title: string;
    description: string;
    attachmentUrl?: string;
    assignedAt: string;
    dueAt: string;
    maximumMarks?: number;
    allowLateSubmission?: boolean;
  }): Promise<Assignment> => {
    const res = await apiClient.post<ApiResponse<Assignment>>('/school/learning/teacher/assignments', data);
    return res.data.data;
  },

  publishAssignment: async (id: string): Promise<Assignment> => {
    const res = await apiClient.post<ApiResponse<Assignment>>(`/school/learning/teacher/assignments/${id}/publish`);
    return res.data.data;
  },

  listSubmissions: async (id: string): Promise<AssignmentSubmission[]> => {
    const res = await apiClient.get<ApiResponse<AssignmentSubmission[]>>(`/school/learning/teacher/assignments/${id}/submissions`);
    return res.data.data;
  },

  gradeSubmission: async (id: string, data: { marksAwarded?: number; feedback?: string }): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(`/school/learning/teacher/submissions/${id}/grade`, data);
    return res.data.data;
  },

  // Assignments - Student & Guardian
  listStudentAssignments: async (academicYearId: string): Promise<Assignment[]> => {
    const res = await apiClient.get<ApiResponse<Assignment[]>>('/school/learning/student/assignments', {
      params: { academicYearId }
    });
    return res.data.data;
  },

  getStudentAssignmentDetail: async (id: string): Promise<{ assignment: Assignment; submission: AssignmentSubmission | null }> => {
    const res = await apiClient.get<ApiResponse<{ assignment: Assignment; submission: AssignmentSubmission | null }>>(`/school/learning/student/assignments/${id}`);
    return res.data.data;
  },

  submitAssignment: async (id: string, data: { textResponse?: string; attachmentUrl?: string; academicYearId: string }): Promise<AssignmentSubmission> => {
    const res = await apiClient.post<ApiResponse<AssignmentSubmission>>(`/school/learning/student/assignments/${id}/submission`, data);
    return res.data.data;
  },

  listChildAssignments: async (studentId: string, academicYearId: string): Promise<Assignment[]> => {
    const res = await apiClient.get<ApiResponse<Assignment[]>>(`/school/learning/guardian/children/${studentId}/assignments`, {
      params: { academicYearId }
    });
    return res.data.data;
  },

  // Study Materials
  listTeacherStudyMaterials: async (): Promise<StudyMaterial[]> => {
    const res = await apiClient.get<ApiResponse<StudyMaterial[]>>('/school/learning/teacher/study-materials');
    return res.data.data;
  },

  createStudyMaterial: async (data: {
    academicYearId: string;
    classId: string;
    sectionId?: string;
    subjectId: string;
    title: string;
    description?: string;
    materialType: string;
    fileAttachmentUrl?: string;
    url?: string;
  }): Promise<StudyMaterial> => {
    const res = await apiClient.post<ApiResponse<StudyMaterial>>('/school/learning/teacher/study-materials', data);
    return res.data.data;
  },

  listStudentStudyMaterials: async (academicYearId: string): Promise<StudyMaterial[]> => {
    const res = await apiClient.get<ApiResponse<StudyMaterial[]>>('/school/learning/student/study-materials', {
      params: { academicYearId }
    });
    return res.data.data;
  }
};
