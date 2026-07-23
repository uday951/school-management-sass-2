const express = require('express');
const { checkDBHealth } = require('../../config/database');
const { sendSuccess } = require('../utils/response.util');

const router = express.Router();

/**
 * GET /api/v1/health
 * Returns server status, DB connection, and uptime.
 */
router.get('/health', (req, res) => {
  const dbHealth = checkDBHealth();

  const data = {
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: `${Math.floor(process.uptime())}s`,
    database: dbHealth,
    timestamp: new Date().toISOString()
  };

  return sendSuccess(res, 'Server is running and healthy.', data);
});

/**
 * GET /api/v1/version
 * Returns current API version metadata.
 */
router.get('/version', (_req, res) => {
  return sendSuccess(res, 'API version info', {
    version: 'v1',
    releaseDate: '2024-01-01',
    author: 'School ERP Team'
  });
});

module.exports = router;
