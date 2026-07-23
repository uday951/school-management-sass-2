const express = require('express');
const healthRoute = require('./health.route');
const schoolRoutes = require('../modules/school/school.routes');
const studentRoutes = require('../modules/student/student.routes');
const classRoutes = require('../modules/academic/class.routes');
const subjectRoutes = require('../modules/academic/subject.routes');

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
router.use('/students', studentRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);

module.exports = router;
