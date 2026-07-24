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

module.exports = router;
