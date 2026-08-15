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
  deleteAnnouncement: (id) => apiClient.delete(API_ENDPOINTS.ADMIN_ANNOUNCEMENT_DELETE(id))
};

export default principalApi;
