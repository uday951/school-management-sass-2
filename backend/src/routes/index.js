const express = require('express');
const healthRoute = require('./health.route');
const studentRoutes = require('../modules/student/student.routes');

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
router.use('/students', studentRoutes);

module.exports = router;
