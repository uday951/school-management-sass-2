const express = require('express');
const healthRoute = require('./health.route');

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

// Business module routes will be mounted here as each module is built:
// router.use('/auth',     require('../modules/auth/auth.routes'));
// router.use('/students', require('../modules/student/student.routes'));
// router.use('/teachers', require('../modules/teacher/teacher.routes'));

module.exports = router;
