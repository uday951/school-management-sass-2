import axiosClient from '@/config/axiosClient'

const BASE = '/dashboard'

export const dashboardService = {
  // Core KPIs — all at once (most efficient)
  getKPIs: () => axiosClient.get(`${BASE}/kpis`).then(r => r.data.data),

  // Overview — school info, session
  getOverview: () => axiosClient.get(`${BASE}/overview`).then(r => r.data.data),

  // Individual module stats
  getStudentStats: () => axiosClient.get(`${BASE}/students`).then(r => r.data.data),
  getAttendanceStats: () => axiosClient.get(`${BASE}/attendance`).then(r => r.data.data),
  getFinanceStats: () => axiosClient.get(`${BASE}/finance`).then(r => r.data.data),
  getPayrollStats: () => axiosClient.get(`${BASE}/payroll`).then(r => r.data.data),
  getTransportStats: () => axiosClient.get(`${BASE}/transport`).then(r => r.data.data),
  getLibraryStats: () => axiosClient.get(`${BASE}/library`).then(r => r.data.data),
  getCommunicationStats: () => axiosClient.get(`${BASE}/communication`).then(r => r.data.data),
  getInventoryStats: () => axiosClient.get(`${BASE}/inventory`).then(r => r.data.data),

  // Activity & Events
  getActivity: () => axiosClient.get(`${BASE}/activity`).then(r => r.data.data),
  getUpcomingEvents: () => axiosClient.get(`${BASE}/upcoming-events`).then(r => r.data.data),

  // System Health
  getSystemHealth: () => axiosClient.get(`${BASE}/system-health`).then(r => r.data.data),
}
