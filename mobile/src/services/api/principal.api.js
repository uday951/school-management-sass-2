import apiClient from './client';
import { API_ENDPOINTS } from '../../constants/api';

export const principalApi = {
  getOverview: () => apiClient.get(API_ENDPOINTS.ADMIN_OVERVIEW),
  getKPIs: () => apiClient.get(API_ENDPOINTS.ADMIN_KPIS),
  getStudentStats: () => apiClient.get(API_ENDPOINTS.ADMIN_STUDENT_STATS),
  getAttendanceStats: () => apiClient.get(API_ENDPOINTS.ADMIN_ATTENDANCE_STATS),
  getFinanceStats: () => apiClient.get(API_ENDPOINTS.ADMIN_FINANCE_STATS),
  getPayrollStats: () => apiClient.get(API_ENDPOINTS.ADMIN_PAYROLL_STATS),
  getTransportStats: () => apiClient.get(API_ENDPOINTS.ADMIN_TRANSPORT_STATS),
  getLibraryStats: () => apiClient.get(API_ENDPOINTS.ADMIN_LIBRARY_STATS),
  getCommunicationStats: () => apiClient.get(API_ENDPOINTS.ADMIN_COMMUNICATION_STATS),
  getInventoryStats: () => apiClient.get(API_ENDPOINTS.ADMIN_INVENTORY_STATS),
  getActivity: () => apiClient.get(API_ENDPOINTS.ADMIN_ACTIVITY),
  getUpcomingEvents: () => apiClient.get(API_ENDPOINTS.ADMIN_UPCOMING_EVENTS),
  getSystemHealth: () => apiClient.get(API_ENDPOINTS.ADMIN_SYSTEM_HEALTH),
  
  // Leave approvals
  getLeavesPending: (params) => apiClient.get(API_ENDPOINTS.ADMIN_LEAVES, { params: { ...params, status: 'pending' } }),
  updateLeaveStatus: (id, status) => apiClient.patch(API_ENDPOINTS.ADMIN_LEAVE_STATUS(id), { status }),

  // Announcements
  getAnnouncements: () => apiClient.get(API_ENDPOINTS.ADMIN_ANNOUNCEMENTS),
  createAnnouncement: (payload) => apiClient.post(API_ENDPOINTS.ADMIN_ANNOUNCEMENT_CREATE, payload),
  deleteAnnouncement: (id) => apiClient.delete(API_ENDPOINTS.ADMIN_ANNOUNCEMENT_DELETE(id)),

  // Principal Directory & Detail APIs
  getStudents: (params) => apiClient.get(API_ENDPOINTS.STUDENTS_LIST, { params }),
  getStudentProfile: (id) => apiClient.get(`/students/${id}/profile`),
  getTeachers: (params) => apiClient.get(API_ENDPOINTS.TEACHERS_LIST, { params }),
  getTeacherProfile: (id) => apiClient.get(`/teachers/${id}/profile`),
  getDepartments: () => apiClient.get(API_ENDPOINTS.TEACHER_DEPARTMENTS),
  getDesignations: () => apiClient.get(API_ENDPOINTS.TEACHER_DESIGNATIONS),
  
  // Academics & Exams
  getClasses: () => apiClient.get(API_ENDPOINTS.CLASSES_LIST),
  getSubjects: () => apiClient.get(API_ENDPOINTS.SUBJECTS_LIST),
  getExams: (params) => apiClient.get(API_ENDPOINTS.EXAMS_LIST, { params }),
  getExamSchedules: () => apiClient.get(API_ENDPOINTS.EXAM_SCHEDULES),
  
  // Finance Lists
  getExpenses: (params) => apiClient.get(API_ENDPOINTS.FINANCE_EXPENSES, { params }),
  getIncome: (params) => apiClient.get(API_ENDPOINTS.FINANCE_INCOME, { params }),
  getTransactions: (params) => apiClient.get(API_ENDPOINTS.FINANCE_TRANSACTIONS, { params }),
  
  // Transport lists
  getVehicles: () => apiClient.get(API_ENDPOINTS.TRANSPORT_VEHICLES),
  getRoutes: () => apiClient.get(API_ENDPOINTS.TRANSPORT_ROUTES),
  
  // Reports
  getReports: (params) => apiClient.get(API_ENDPOINTS.REPORTS_LIST, { params }),
  getStudentReport: (params) => apiClient.get(API_ENDPOINTS.REPORTS_STUDENT, { params }),
  getTeacherReport: (params) => apiClient.get(API_ENDPOINTS.REPORTS_TEACHER, { params }),
  getAttendanceReport: (params) => apiClient.get(API_ENDPOINTS.REPORTS_ATTENDANCE, { params }),
  getFinanceReport: (params) => apiClient.get(API_ENDPOINTS.REPORTS_FINANCE, { params }),

  // Communication & Notices
  getNotices: () => apiClient.get(API_ENDPOINTS.COMMUNICATION_NOTICES),
  getEventsList: () => apiClient.get(API_ENDPOINTS.COMMUNICATION_EVENTS),
  getNotifications: (params) => apiClient.get(API_ENDPOINTS.COMMUNICATION_NOTIFICATIONS, { params }),
  markNotificationRead: (id) => apiClient.patch(`/communication/notifications/${id}/read`)
};

export default principalApi;
