const express = require('express');
const attendanceController = require('./attendance.controller');
const { markStudentSchema, markTeacherSchema } = require('./attendance.validator');
const { validate } = require('../../middlewares/validation.middleware');

const router = express.Router();

// ─── Student Attendance ───────────────────────────────────────────────────
router.get('/student', attendanceController.getStudentRegister);
router.post('/student', markStudentSchema, validate, attendanceController.markStudentAttendance);

// ─── Teacher Attendance ───────────────────────────────────────────────────
router.get('/teacher', attendanceController.getTeacherRegister);
router.post('/teacher', markTeacherSchema, validate, attendanceController.markTeacherAttendance);

// ─── Attendance Reports ───────────────────────────────────────────────────
router.get('/report', attendanceController.getAttendanceReport);

// ─── Leave Management ──────────────────────────────────────────────────────
router.get('/leaves', attendanceController.getLeaveRequests);
router.post('/leaves', attendanceController.applyLeaveRequest);
router.patch('/leaves/:id/status', attendanceController.updateLeaveRequestStatus);

// ─── Biometric Logs ────────────────────────────────────────────────────────
router.get('/biometric-logs', attendanceController.getBiometricLogs);

// ─── Attendance Stats ──────────────────────────────────────────────────────
router.get('/stats', attendanceController.getAttendanceStats);

module.exports = router;
