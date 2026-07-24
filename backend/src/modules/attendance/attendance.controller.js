const attendanceService = require('./attendance.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated } = require('../../utils/response.util');

class AttendanceController {
  // GET /api/v1/attendance/student
  getStudentRegister = asyncHandler(async (req, res) => {
    const list = await attendanceService.getStudentRegister(req.query);
    return sendSuccess(res, 'Student attendance register fetched.', list);
  });

  // POST /api/v1/attendance/student
  markStudentAttendance = asyncHandler(async (req, res) => {
    const record = await attendanceService.markStudentAttendance(req.body);
    return sendCreated(res, 'Student attendance marked successfully.', record);
  });

  // GET /api/v1/attendance/teacher
  getTeacherRegister = asyncHandler(async (req, res) => {
    const list = await attendanceService.getTeacherRegister(req.query);
    return sendSuccess(res, 'Teacher attendance register fetched.', list);
  });

  // POST /api/v1/attendance/teacher
  markTeacherAttendance = asyncHandler(async (req, res) => {
    const record = await attendanceService.markTeacherAttendance(req.body);
    return sendCreated(res, 'Teacher attendance marked successfully.', record);
  });

  // GET /api/v1/attendance/report
  getAttendanceReport = asyncHandler(async (req, res) => {
    const report = await attendanceService.getAttendanceReport(req.query);
    return sendSuccess(res, 'Attendance report generated.', report);
  });

  // GET /api/v1/holidays
  getHolidays = asyncHandler(async (req, res) => {
    const list = await attendanceService.getHolidays(req.query);
    return sendSuccess(res, 'Holidays list fetched.', list);
  });

  // POST /api/v1/holidays
  createHoliday = asyncHandler(async (req, res) => {
    const holiday = await attendanceService.createHoliday(req.body);
    return sendCreated(res, 'Holiday created successfully.', holiday);
  });

  // GET /api/v1/attendance/leaves
  getLeaveRequests = asyncHandler(async (req, res) => {
    const list = await attendanceService.getLeaveRequests(req.query);
    return sendSuccess(res, 'Leave requests fetched successfully.', list);
  });

  // POST /api/v1/attendance/leaves
  applyLeaveRequest = asyncHandler(async (req, res) => {
    const request = await attendanceService.applyLeaveRequest(req.body);
    return sendCreated(res, 'Leave request applied successfully.', request);
  });

  // PATCH /api/v1/attendance/leaves/:id/status
  updateLeaveRequestStatus = asyncHandler(async (req, res) => {
    const request = await attendanceService.updateLeaveRequestStatus(req.params.id, req.body);
    return sendSuccess(res, 'Leave request status updated.', request);
  });

  // GET /api/v1/attendance/biometric-logs
  getBiometricLogs = asyncHandler(async (req, res) => {
    const logs = await attendanceService.getBiometricLogs();
    return sendSuccess(res, 'Recent biometric logs fetched.', logs);
  });
}

module.exports = new AttendanceController();
