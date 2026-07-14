import api from '@/lib/axios';

export interface AttendanceRecordInput {
  studentId: string;
  studentEnrollmentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED' | 'LEAVE';
  reason?: string;
  remarks?: string;
  arrivalTime?: string;
  departureTime?: string;
}

export interface SaveDraftInput {
  academicYearId: string;
  classId: string;
  sectionId: string;
  attendanceDate: string;
  attendanceType: 'DAILY' | 'PERIOD';
  subjectId?: string;
  periodNumber?: number;
  periodLabel?: string;
  notes?: string;
  records: AttendanceRecordInput[];
}

export interface SubmitAttendanceInput {
  notes?: string;
  records: AttendanceRecordInput[];
}

export interface CorrectionRequestInput {
  reason: string;
  items: Array<{
    attendanceRecordId: string;
    oldStatus: string;
    requestedStatus: string;
    reason?: string;
  }>;
}

export const attendanceApi = {
  // Shared & Teacher
  getMyClasses: async () => {
    const res = await api.get('/school/attendance/my-classes');
    return res.data.data;
  },

  getRoster: async (params: { academicYearId: string; classId: string; sectionId: string; date: string }) => {
    const res = await api.get('/school/attendance/roster', { params });
    return res.data.data;
  },

  saveDraft: async (data: SaveDraftInput) => {
    const res = await api.post('/school/attendance/sessions/draft', data);
    return res.data.data;
  },

  submitAttendance: async (sessionId: string, data: SubmitAttendanceInput) => {
    const res = await api.post(`/school/attendance/sessions/${sessionId}/submit`, data);
    return res.data.data;
  },

  getSession: async (sessionId: string) => {
    const res = await api.get(`/school/attendance/sessions/${sessionId}`);
    return res.data.data;
  },

  submitCorrection: async (sessionId: string, data: CorrectionRequestInput) => {
    const res = await api.post(`/school/attendance/sessions/${sessionId}/correction`, data);
    return res.data.data;
  },

  // Admin settings
  getSettings: async () => {
    const res = await api.get('/school/attendance/settings');
    return res.data.data;
  },

  updateSettings: async (data: any) => {
    const res = await api.patch('/school/attendance/settings', data);
    return res.data.data;
  },

  // Dashboard & Monitor
  getDashboard: async (date: string) => {
    const res = await api.get('/school/attendance/dashboard', { params: { date } });
    return res.data.data;
  },

  getDailyMonitor: async (date: string) => {
    const res = await api.get('/school/attendance/daily-monitor', { params: { date } });
    return res.data.data;
  },

  getAbsentees: async (date: string) => {
    const res = await api.get('/school/attendance/absentees', { params: { date } });
    return res.data.data;
  },

  getLowAttendance: async (academicYearId: string) => {
    const res = await api.get('/school/attendance/reports/low-attendance', { params: { academicYearId } });
    return res.data.data;
  },

  getClassReport: async (params: {
    academicYearId: string;
    classId: string;
    sectionId: string;
    startDate: string;
    endDate: string;
  }) => {
    const res = await api.get('/school/attendance/reports/class', { params });
    return res.data.data;
  },

  lockSession: async (sessionId: string) => {
    const res = await api.post(`/school/attendance/sessions/${sessionId}/lock`);
    return res.data.data;
  },

  reopenSession: async (sessionId: string, reason: string) => {
    const res = await api.post(`/school/attendance/sessions/${sessionId}/reopen`, { reason });
    return res.data.data;
  },

  getPendingCorrections: async () => {
    const res = await api.get('/school/attendance/corrections');
    return res.data.data;
  },

  reviewCorrection: async (requestId: string, action: 'APPROVE' | 'REJECT', reviewComment?: string) => {
    const res = await api.post(`/school/attendance/corrections/${requestId}/review`, { action, reviewComment });
    return res.data.data;
  },

  // Student Self & Guardian linked child
  getStudentSummary: async () => {
    const res = await api.get('/school/attendance/student/summary');
    return res.data.data;
  },

  getGuardianChildSummary: async (studentId: string) => {
    const res = await api.get(`/school/attendance/guardian/children/${studentId}/summary`);
    return res.data.data;
  }
};
