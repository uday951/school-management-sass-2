import apiClient from '@/lib/axios';

export interface AcademicTerm {
  id: string;
  academicYearId: string;
  name: string;
  code?: string;
  termType: 'TERM' | 'SEMESTER' | 'QUARTER' | 'CUSTOM';
  startDate: string;
  endDate: string;
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ExamCycle {
  id: string;
  academicYearId: string;
  academicTermId?: string;
  name: string;
  code?: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  startDate?: string;
  endDate?: string;
  academicTerm?: AcademicTerm;
}

export interface ExamTarget {
  id: string;
  classId: string;
  sectionId?: string | null;
  class: { id: string; name: string };
  section?: { id: string; name: string } | null;
}

export interface AssessmentComponent {
  id: string;
  name: string;
  code?: string;
  componentType: 'THEORY' | 'PRACTICAL' | 'INTERNAL' | 'EXTERNAL' | 'ASSIGNMENT' | 'PROJECT' | 'ORAL' | 'LAB' | 'CUSTOM';
  maximumMarks: number;
  passMarks?: number;
  weightage?: number;
  sortOrder: number;
  isRequired: boolean;
}

export interface ExamSubject {
  id: string;
  classId: string;
  subjectId: string;
  maximumMarks: number;
  passMarks: number;
  weightage?: number;
  gradingMode: 'MARKS' | 'GRADE_ONLY' | 'MARKS_AND_GRADE';
  isOptional: boolean;
  sortOrder: number;
  class: { id: string; name: string };
  subject: { id: string; name: string; code: string };
  components: AssessmentComponent[];
}

export interface Exam {
  id: string;
  academicYearId: string;
  academicTermId?: string;
  examCycleId?: string;
  name: string;
  code?: string;
  description?: string;
  examType: 'UNIT_TEST' | 'MID_TERM' | 'FINAL' | 'PRACTICAL' | 'INTERNAL' | 'EXTERNAL' | 'CUSTOM';
  status: 'DRAFT' | 'SCHEDULED' | 'MARKS_ENTRY_OPEN' | 'MARKS_ENTRY_CLOSED' | 'COMPLETED' | 'ARCHIVED';
  startDate?: string;
  endDate?: string;
  resultStatus: 'NOT_CALCULATED' | 'CALCULATED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED';
  academicTerm?: AcademicTerm;
  examCycle?: ExamCycle;
  targets: ExamTarget[];
  subjects: ExamSubject[];
}

export interface GradeBoundary {
  id: string;
  grade: string;
  minimumValue: number;
  maximumValue: number;
  gradePoint?: number;
  description?: string;
  sortOrder: number;
}

export interface GradeScale {
  id: string;
  name: string;
  description?: string;
  calculationBasis: 'PERCENTAGE' | 'MARKS' | 'GPA';
  isDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  boundaries: GradeBoundary[];
}

export interface CoScholasticArea {
  id: string;
  name: string;
  code?: string;
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export const examsApi = {
  // Academic Terms
  listAcademicTerms: async (academicYearId: string): Promise<AcademicTerm[]> => {
    const res = await apiClient.get('/school/exams/academic-terms', { params: { academicYearId } });
    return res.data.data;
  },
  createAcademicTerm: async (data: any): Promise<AcademicTerm> => {
    const res = await apiClient.post('/school/exams/academic-terms', data);
    return res.data.data;
  },
  updateAcademicTerm: async (id: string, data: any): Promise<AcademicTerm> => {
    const res = await apiClient.patch(`/school/exams/academic-terms/${id}`, data);
    return res.data.data;
  },

  // Exam Cycles
  listExamCycles: async (academicYearId: string): Promise<ExamCycle[]> => {
    const res = await apiClient.get('/school/exams/exam-cycles', { params: { academicYearId } });
    return res.data.data;
  },
  createExamCycle: async (data: any): Promise<ExamCycle> => {
    const res = await apiClient.post('/school/exams/exam-cycles', data);
    return res.data.data;
  },
  updateExamCycle: async (id: string, data: any): Promise<ExamCycle> => {
    const res = await apiClient.patch(`/school/exams/exam-cycles/${id}`, data);
    return res.data.data;
  },

  // Exams
  listExams: async (academicYearId: string): Promise<Exam[]> => {
    const res = await apiClient.get('/school/exams', { params: { academicYearId } });
    return res.data.data;
  },
  getExam: async (id: string): Promise<Exam> => {
    const res = await apiClient.get(`/school/exams/${id}`);
    return res.data.data;
  },
  createExam: async (data: any): Promise<Exam> => {
    const res = await apiClient.post('/school/exams', data);
    return res.data.data;
  },
  updateExam: async (id: string, data: any): Promise<Exam> => {
    const res = await apiClient.patch(`/school/exams/${id}`, data);
    return res.data.data;
  },
  archiveExam: async (id: string): Promise<void> => {
    await apiClient.delete(`/school/exams/${id}`);
  },

  // Targets
  setExamTargets: async (examId: string, targets: any[]): Promise<any> => {
    const res = await apiClient.post(`/school/exams/${examId}/targets`, { targets });
    return res.data.data;
  },

  // Exam Subjects
  listExamSubjects: async (examId: string): Promise<ExamSubject[]> => {
    const res = await apiClient.get(`/school/exams/${examId}/subjects`);
    return res.data.data;
  },
  addExamSubject: async (data: any): Promise<ExamSubject> => {
    const res = await apiClient.post('/school/exams/subjects', data);
    return res.data.data;
  },
  updateExamSubject: async (id: string, data: any): Promise<ExamSubject> => {
    const res = await apiClient.patch(`/school/exams/subjects/${id}`, data);
    return res.data.data;
  },
  deleteExamSubject: async (id: string): Promise<void> => {
    await apiClient.delete(`/school/exams/subjects/${id}`);
  },
  setAssessmentComponents: async (examSubjectId: string, components: any[]): Promise<any> => {
    const res = await apiClient.post(`/school/exams/subjects/${examSubjectId}/components`, { components });
    return res.data.data;
  },

  // Grade Scales
  listGradeScales: async (): Promise<GradeScale[]> => {
    const res = await apiClient.get('/school/exams/grade-scales');
    return res.data.data;
  },
  createGradeScale: async (data: any): Promise<GradeScale> => {
    const res = await apiClient.post('/school/exams/grade-scales', data);
    return res.data.data;
  },
  updateGradeScale: async (id: string, data: any): Promise<GradeScale> => {
    const res = await apiClient.patch(`/school/exams/grade-scales/${id}`, data);
    return res.data.data;
  },
  deleteGradeScale: async (id: string): Promise<void> => {
    await apiClient.delete(`/school/exams/grade-scales/${id}`);
  },
  setGradeBoundaries: async (gradeScaleId: string, boundaries: any[]): Promise<any> => {
    const res = await apiClient.post(`/school/exams/grade-scales/${gradeScaleId}/boundaries`, { boundaries });
    return res.data.data;
  },

  // Marks Entry (Teacher)
  getTeacherMarksContexts: async (): Promise<any[]> => {
    const res = await apiClient.get('/school/teacher/exams/marks-contexts');
    return res.data.data;
  },
  getMarksRoster: async (examSubjectId: string, sectionId: string): Promise<any> => {
    const res = await apiClient.get('/school/exams/marks-roster', { params: { examSubjectId, sectionId } });
    return res.data.data;
  },
  saveMarksDraft: async (data: any): Promise<void> => {
    await apiClient.post('/school/exams/marks-draft', data);
  },
  submitMarks: async (data: { examSubjectId: string; sectionId: string }): Promise<void> => {
    await apiClient.post('/school/exams/marks-submit', data);
  },

  // Admin Marks Status & Locking
  getMarksStatus: async (examId: string): Promise<any[]> => {
    const res = await apiClient.get(`/school/exams/${examId}/marks-status`);
    return res.data.data;
  },
  lockMarks: async (submissionId: string): Promise<void> => {
    await apiClient.post(`/school/exams/marks-submissions/${submissionId}/lock`);
  },
  reopenMarks: async (submissionId: string): Promise<void> => {
    await apiClient.post(`/school/exams/marks-submissions/${submissionId}/reopen`);
  },

  // Corrections Workflow
  requestCorrection: async (data: any): Promise<any> => {
    const res = await apiClient.post('/school/exams/marks-corrections', data);
    return res.data.data;
  },
  listCorrectionQueue: async (examId?: string): Promise<any[]> => {
    const res = await apiClient.get('/school/exams/marks-corrections/queue', { params: { examId } });
    return res.data.data;
  },
  approveCorrection: async (id: string, reviewComment: string): Promise<any> => {
    const res = await apiClient.post(`/school/exams/marks-corrections/${id}/approve`, { reviewComment });
    return res.data.data;
  },
  rejectCorrection: async (id: string, reviewComment: string): Promise<any> => {
    const res = await apiClient.post(`/school/exams/marks-corrections/${id}/reject`, { reviewComment });
    return res.data.data;
  },

  // Results Management
  calculateResults: async (examId: string, classId: string, sectionId: string): Promise<any> => {
    const res = await apiClient.post(`/school/exams/${examId}/calculate`, { classId, sectionId });
    return res.data.data;
  },
  listResults: async (examId: string, classId?: string, sectionId?: string): Promise<any[]> => {
    const res = await apiClient.get(`/school/exams/${examId}/results`, { params: { classId, sectionId } });
    return res.data.data;
  },
  approveResults: async (examId: string): Promise<void> => {
    await apiClient.post(`/school/exams/${examId}/approve-results`);
  },
  publishResults: async (examId: string): Promise<void> => {
    await apiClient.post(`/school/exams/${examId}/publish-results`);
  },
  unpublishResults: async (examId: string): Promise<void> => {
    await apiClient.post(`/school/exams/${examId}/unpublish-results`);
  },

  // Remarks & Co-Scholastic
  saveRemarks: async (data: any): Promise<any> => {
    const res = await apiClient.post('/school/exams/remarks', data);
    return res.data.data;
  },
  listCoScholasticAreas: async (academicYearId: string): Promise<CoScholasticArea[]> => {
    const res = await apiClient.get('/school/exams/co-scholastic/areas', { params: { academicYearId } });
    return res.data.data;
  },
  createCoScholasticArea: async (data: any): Promise<CoScholasticArea> => {
    const res = await apiClient.post('/school/exams/co-scholastic/areas', data);
    return res.data.data;
  },
  saveCoScholasticEntries: async (data: any): Promise<void> => {
    await apiClient.post('/school/exams/co-scholastic/entries', data);
  },

  // Report Cards
  listReportCardTemplates: async (): Promise<any[]> => {
    const res = await apiClient.get('/school/exams/report-card-templates');
    return res.data.data;
  },
  createReportCardTemplate: async (data: any): Promise<any> => {
    const res = await apiClient.post('/school/exams/report-card-templates', data);
    return res.data.data;
  },
  updateReportCardTemplate: async (id: string, data: any): Promise<any> => {
    const res = await apiClient.patch(`/school/exams/report-card-templates/${id}`, data);
    return res.data.data;
  },
  previewReportCard: async (data: { examId: string; studentId: string; templateId: string }): Promise<any> => {
    const res = await apiClient.post('/school/exams/report-cards/preview', data);
    return res.data.data;
  },
  generateReportCard: async (data: { examId: string; studentId: string; templateId: string }): Promise<any> => {
    const res = await apiClient.post('/school/exams/report-cards/generate', data);
    return res.data.data;
  },
  getReportCardSnapshot: async (examId: string, studentId: string): Promise<any> => {
    const res = await apiClient.get('/school/exams/report-cards/snapshot', { params: { examId, studentId } });
    return res.data.data;
  },

  // Portal results
  getStudentResults: async (): Promise<any[]> => {
    const res = await apiClient.get('/school/student/exams/results');
    return res.data.data;
  },
  getStudentResultDetail: async (examId: string): Promise<any> => {
    const res = await apiClient.get(`/school/student/exams/results/${examId}`);
    return res.data.data;
  },
  getGuardianResults: async (studentId: string): Promise<any[]> => {
    const res = await apiClient.get(`/school/guardian/children/${studentId}/results`);
    return res.data.data;
  },
  getGuardianResultDetail: async (studentId: string, examId: string): Promise<any> => {
    const res = await apiClient.get(`/school/guardian/children/${studentId}/results/${examId}`);
    return res.data.data;
  }
};
