import apiClient from './client';
import { API_ENDPOINTS } from '../../constants/api';

export const teacherApi = {
  getDashboard: () => apiClient.get(API_ENDPOINTS.TEACHER_DASHBOARD),
  getProfile: () => apiClient.get(API_ENDPOINTS.TEACHER_PROFILE),
  updateProfile: (data) => apiClient.put(API_ENDPOINTS.TEACHER_PROFILE, data),
  changePassword: (data) => apiClient.put(API_ENDPOINTS.TEACHER_CHANGE_PASSWORD, data),

  getClasses: () => apiClient.get(API_ENDPOINTS.TEACHER_CLASSES),
  getStudents: (params) => apiClient.get(API_ENDPOINTS.TEACHER_STUDENTS, { params }),
  getStudentAttendance: (params) => apiClient.get(API_ENDPOINTS.TEACHER_ATTENDANCE_STUDENT, { params }),
  markStudentAttendance: (payload) => apiClient.post(API_ENDPOINTS.TEACHER_ATTENDANCE_STUDENT, payload),
  getPayslips: () => apiClient.get(API_ENDPOINTS.TEACHER_PAYSLIPS),
  getPayrollHistory: () => apiClient.get(API_ENDPOINTS.TEACHER_PAYROLL_HISTORY),
  
  getAnnouncements: () => apiClient.get(API_ENDPOINTS.TEACHER_ANNOUNCEMENTS),
  getNotices: () => apiClient.get(API_ENDPOINTS.TEACHER_NOTICES),

  getLeaveHistory: () => apiClient.get(API_ENDPOINTS.TEACHER_LEAVE_HISTORY),
  applyLeave: (payload) => apiClient.post(API_ENDPOINTS.TEACHER_LEAVE_APPLY, payload),
  updateLeave: (id, payload) => apiClient.put(API_ENDPOINTS.TEACHER_LEAVE_UPDATE(id), payload),
  deleteLeave: (id) => apiClient.delete(API_ENDPOINTS.TEACHER_LEAVE_DELETE(id)),

  getDocuments: () => apiClient.get(API_ENDPOINTS.TEACHER_DOCUMENTS),
  getMessages: () => apiClient.get(API_ENDPOINTS.TEACHER_MESSAGES),
  sendChatMessage: (payload) => apiClient.post(API_ENDPOINTS.TEACHER_CHAT_SEND, payload),

  getHomework: () => apiClient.get(API_ENDPOINTS.TEACHER_HOMEWORK),
  createHomework: (payload) => apiClient.post(API_ENDPOINTS.TEACHER_HOMEWORK_CREATE, payload),
  updateHomework: (id, payload) => apiClient.put(API_ENDPOINTS.TEACHER_HOMEWORK_UPDATE(id), payload),
  deleteHomework: (id) => apiClient.delete(API_ENDPOINTS.TEACHER_HOMEWORK_DELETE(id)),
  getHomeworkSubmissions: (id) => apiClient.get(API_ENDPOINTS.TEACHER_HOMEWORK_SUBMISSIONS(id)),
  evaluateSubmission: (id, studentId, payload) => apiClient.put(API_ENDPOINTS.TEACHER_EVALUATE_SUBMISSION(id, studentId), payload),

  getExams: () => apiClient.get(API_ENDPOINTS.TEACHER_EXAMS),
  getMarks: (params) => apiClient.get(API_ENDPOINTS.TEACHER_MARKS, { params }),
  saveMarks: (payload) => apiClient.post(API_ENDPOINTS.TEACHER_MARKS, payload),

  getReports: () => apiClient.get(API_ENDPOINTS.TEACHER_REPORTS)
};

export default teacherApi;
