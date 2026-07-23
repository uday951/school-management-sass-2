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

const classRoutes = require('../modules/academic/class.routes');
const subjectRoutes = require('../modules/academic/subject.routes');

// ─── Mount Sub-routes ──────────────────────────────────────────────────────
router.use('/', healthRoute);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);

module.exports = router;
