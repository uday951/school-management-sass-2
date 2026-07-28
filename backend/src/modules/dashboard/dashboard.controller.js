const dashboardService = require('./dashboard.service');
const { sendSuccess } = require('../../utils/response.util');
const asyncHandler = require('../../middlewares/async-handler.middleware');

class DashboardController {
  getOverview = asyncHandler(async (req, res) => {
    const data = await dashboardService.getOverview();
    sendSuccess(res, 'Overview fetched successfully', data);
  });

  getKPIs = asyncHandler(async (req, res) => {
    const data = await dashboardService.getAllKPIs();
    sendSuccess(res, 'All KPIs fetched successfully', data);
  });

  getStudentStats = asyncHandler(async (req, res) => {
    const [kpis, monthlyAdmissions] = await Promise.all([
      dashboardService.getStudentKPIs(),
      dashboardService.getMonthlyAdmissions()
    ]);
    sendSuccess(res, 'Student stats fetched successfully', { ...kpis, monthlyAdmissions });
  });

  getAttendanceStats = asyncHandler(async (req, res) => {
    const [kpis, trend] = await Promise.all([
      dashboardService.getAttendanceKPIs(),
      dashboardService.getAttendanceTrend()
    ]);
    sendSuccess(res, 'Attendance stats fetched successfully', { ...kpis, trend });
  });

  getFinanceStats = asyncHandler(async (req, res) => {
    const [kpis, trend] = await Promise.all([
      dashboardService.getFinanceKPIs(),
      dashboardService.getFeeCollectionTrend()
    ]);
    sendSuccess(res, 'Finance stats fetched successfully', { ...kpis, trend });
  });

  getActivity = asyncHandler(async (req, res) => {
    const data = await dashboardService.getRecentActivity();
    // Normalize keys for frontend
    sendSuccess(res, 'Recent activity fetched successfully', {
      recentAdmissions: data.admissions || [],
      recentPayments: data.payments || [],
      recentAttendance: data.attendance || []
    });
  });

  getUpcomingEvents = asyncHandler(async (req, res) => {
    const exams = await dashboardService.getUpcomingExams();
    sendSuccess(res, 'Upcoming events fetched successfully', {
      upcomingExams: exams || []
    });
  });

  getSystemHealth = asyncHandler(async (req, res) => {
    const data = await dashboardService.getSystemHealth();
    sendSuccess(res, 'System health fetched successfully', data);
  });

  getPayrollStats = asyncHandler(async (req, res) => {
    const data = await dashboardService.getPayrollKPIs();
    sendSuccess(res, 'Payroll stats fetched successfully', data);
  });

  getTransportStats = asyncHandler(async (req, res) => {
    const data = await dashboardService.getTransportKPIs();
    sendSuccess(res, 'Transport stats fetched successfully', data);
  });

  getLibraryStats = asyncHandler(async (req, res) => {
    const data = await dashboardService.getLibraryKPIs();
    sendSuccess(res, 'Library stats fetched successfully', data);
  });

  getCommunicationStats = asyncHandler(async (req, res) => {
    const data = await dashboardService.getCommunicationKPIs();
    sendSuccess(res, 'Communication stats fetched successfully', data);
  });

  getInventoryStats = asyncHandler(async (req, res) => {
    const data = await dashboardService.getInventoryKPIs();
    sendSuccess(res, 'Inventory stats fetched successfully', data);
  });
}

module.exports = new DashboardController();
