const express = require('express');
const healthRoute = require('./health.route');
const schoolRoutes = require('../modules/school/school.routes');
const studentRoutes = require('../modules/student/student.routes');
const classRoutes = require('../modules/academic/class.routes');
const subjectRoutes = require('../modules/academic/subject.routes');
const parentRoutes = require('../modules/parent/parent.routes');
const attendanceRoutes = require('../modules/attendance/attendance.routes');
const holidayRoutes = require('../modules/attendance/holiday.routes');
const teacherRoutes = require('../modules/teacher/teacher.routes');
const timetableRoutes = require('../modules/timetable/timetable.routes');
const financeRoutes = require('../modules/finance/finance.routes');
const examRoutes = require('../modules/exam/exam.routes');
const libraryRoutes = require('../modules/library/library.routes');

const router = express.Router();

// ─── Base API Info ─────────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'School ERP API v1 is operational.',
    docs: '/api/v1/docs'
  });
});

// ─── Mount Sub-routes ──────────────────────────────────────────────────────
router.use('/', healthRoute);
router.use('/', schoolRoutes);
router.use('/', timetableRoutes);
router.use('/', financeRoutes);
router.use('/', libraryRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/departments', teacherRoutes);
router.use('/designations', teacherRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/parents', parentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/holidays', holidayRoutes);
router.use('/exams', examRoutes);
router.use('/fees', require('../modules/fees/fees.routes'));
router.use('/transport', require('../modules/transport/transport.routes'));
router.use('/reports', require('../modules/reports/reports.routes'));
router.use('/payroll', require('../modules/payroll/payroll.routes'));
router.use('/communication', require('../modules/communication/communication.routes'));
router.use('/administration', require('../modules/user/administration.routes'));

module.exports = router;