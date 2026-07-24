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

// ─── Try-require Optional Branches Modules to Prevent Crash ──────────────────
let financeRoutes;
try {
  financeRoutes = require('../modules/finance/finance.routes');
} catch (e) {
  // Not loaded on this branch
}

let examRoutes;
try {
  examRoutes = require('../modules/exam/exam.routes');
} catch (e) {
  // Not loaded on this branch
}

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

if (financeRoutes) {
  router.use('/', financeRoutes);
}

router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/departments', teacherRoutes);
router.use('/designations', teacherRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/parents', parentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/holidays', holidayRoutes);

if (examRoutes) {
  router.use('/exams', examRoutes);
}

router.use('/fees', require('../modules/fees/fees.routes'));

module.exports = router;