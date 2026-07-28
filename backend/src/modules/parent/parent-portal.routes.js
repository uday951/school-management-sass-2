const express = require('express');
const parentPortalController = require('./parent-portal.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const ROLES = require('../../constants/roles');

const router = express.Router();

// All routes require parent authentication
router.use(authenticate);
router.use(authorizeRoles(ROLES.PARENT));

// Parent Profile Settings
router.get('/my-profile', parentPortalController.getMyProfile);
router.put('/my-profile', parentPortalController.updateMyProfile);
router.put('/change-password', parentPortalController.changePassword);

// Children Dossiers
router.get('/my-children', parentPortalController.getMyChildren);
router.get('/child/:studentId/summary', parentPortalController.getChildSummary);
router.get('/child/:studentId/homework', parentPortalController.getChildHomework);
router.get('/child/:studentId/results', parentPortalController.getChildResults);
router.get('/child/:studentId/report-card', parentPortalController.getChildReportCard);
router.get('/child/:studentId/library', parentPortalController.getChildLibrary);
router.get('/child/:studentId/documents', parentPortalController.getChildDocuments);

// School Notices & Circulars
router.get('/announcements', parentPortalController.getAnnouncements);
router.get('/notices', parentPortalController.getNotices);

module.exports = router;
