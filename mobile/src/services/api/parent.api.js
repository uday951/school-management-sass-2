import apiClient from './client';
import { API_ENDPOINTS } from '../../constants/api';

export const parentApi = {
  getProfile: () => apiClient.get(API_ENDPOINTS.PARENT_PROFILE),
  updateProfile: (data) => apiClient.put(API_ENDPOINTS.PARENT_PROFILE, data),
  changePassword: (data) => apiClient.put(API_ENDPOINTS.PARENT_CHANGE_PASSWORD, data),
  
  getChildren: () => apiClient.get(API_ENDPOINTS.PARENT_CHILDREN),
  
  getChildSummary: (studentId) => apiClient.get(API_ENDPOINTS.CHILD_SUMMARY(studentId)),
  getChildAttendance: (studentId) => apiClient.get(API_ENDPOINTS.CHILD_ATTENDANCE(studentId)),
  getChildHomework: (studentId) => apiClient.get(API_ENDPOINTS.CHILD_HOMEWORK(studentId)),
  getChildResults: (studentId) => apiClient.get(API_ENDPOINTS.CHILD_RESULTS(studentId)),
  getChildReportCard: (studentId) => apiClient.get(API_ENDPOINTS.CHILD_REPORT_CARD(studentId)),
  getChildLibrary: (studentId) => apiClient.get(API_ENDPOINTS.CHILD_LIBRARY(studentId)),
  getChildDocuments: (studentId) => apiClient.get(API_ENDPOINTS.CHILD_DOCUMENTS(studentId)),
  getChildTransport: (studentId) => apiClient.get(API_ENDPOINTS.CHILD_TRANSPORT(studentId)),
  getChildTimetable: (studentId) => apiClient.get(API_ENDPOINTS.CHILD_TIMETABLE(studentId)),
  getChildPerformance: (studentId) => apiClient.get(API_ENDPOINTS.CHILD_PERFORMANCE(studentId)),

  getFees: () => apiClient.get(API_ENDPOINTS.PARENT_FEES),
  getPayments: () => apiClient.get(API_ENDPOINTS.PARENT_PAYMENTS),
  getReceipts: () => apiClient.get(API_ENDPOINTS.PARENT_RECEIPTS),

  getAnnouncements: () => apiClient.get(API_ENDPOINTS.PARENT_ANNOUNCEMENTS),
  getNotices: () => apiClient.get(API_ENDPOINTS.PARENT_NOTICES),
  getNotifications: () => apiClient.get(API_ENDPOINTS.PARENT_NOTIFICATIONS),
  markNotificationRead: (id) => apiClient.patch(`/portal/notifications/${id}/read`),

  getChatTeachers: () => apiClient.get(API_ENDPOINTS.PARENT_CHAT_TEACHERS),
  getChatMessages: (teacherId) => apiClient.get(API_ENDPOINTS.PARENT_CHAT_MESSAGES(teacherId)),
  sendChatMessage: (payload) => apiClient.post(API_ENDPOINTS.PARENT_CHAT_SEND, payload)
};

export default parentApi;
