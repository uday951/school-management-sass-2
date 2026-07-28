const express = require('express');
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/overview', dashboardController.getOverview);
router.get('/kpis', dashboardController.getKPIs);
router.get('/students', dashboardController.getStudentStats);
router.get('/attendance', dashboardController.getAttendanceStats);
router.get('/finance', dashboardController.getFinanceStats);
router.get('/payroll', dashboardController.getPayrollStats);
router.get('/transport', dashboardController.getTransportStats);
router.get('/library', dashboardController.getLibraryStats);
router.get('/communication', dashboardController.getCommunicationStats);
router.get('/inventory', dashboardController.getInventoryStats);
router.get('/activity', dashboardController.getActivity);
router.get('/upcoming-events', dashboardController.getUpcomingEvents);
router.get('/system-health', dashboardController.getSystemHealth);

module.exports = router;
