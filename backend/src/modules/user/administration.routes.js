const express = require('express');
const administrationController = require('./administration.controller');
const {
  createUserSchema,
  roleSchema,
  departmentSchema,
  designationSchema,
  systemSettingsSchema,
  restoreSchema
} = require('./administration.validator');
const { validate } = require('../../middlewares/validation.middleware');

const router = express.Router();

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
router.get('/dashboard-stats', administrationController.getDashboardStats);

// ─── Users Endpoints ─────────────────────────────────────────────────────────
router.get('/users', administrationController.getUsers);
router.get('/users/:id', administrationController.getUserById);
router.post('/users', createUserSchema, validate, administrationController.createUser);
router.put('/users/:id', createUserSchema, validate, administrationController.updateUser);
router.delete('/users/:id', administrationController.deleteUser);
router.post('/users/:id/reset-password', administrationController.resetPassword);
router.post('/users/:id/lock', administrationController.lockUser);
router.post('/users/:id/unlock', administrationController.unlockUser);
router.post('/users/:id/activate', administrationController.activateUser);
router.post('/users/:id/deactivate', administrationController.deactivateUser);

// ─── Roles & Permissions Endpoints ───────────────────────────────────────────
router.get('/roles', administrationController.getRoles);
router.post('/roles', roleSchema, validate, administrationController.createRole);
router.delete('/roles/:id', administrationController.deleteRole);

router.get('/permissions', administrationController.getPermissions);
router.post('/permissions', administrationController.updatePermissionMatrix);

// ─── Departments Endpoints ───────────────────────────────────────────────────
router.get('/departments', administrationController.getDepartments);
router.post('/departments', departmentSchema, validate, administrationController.createDepartment);
router.delete('/departments/:id', administrationController.deleteDepartment);

// ─── Designations Endpoints ──────────────────────────────────────────────────
router.get('/designations', administrationController.getDesignations);
router.post('/designations', designationSchema, validate, administrationController.createDesignation);
router.delete('/designations/:id', administrationController.deleteDesignation);

// ─── System & Brand Settings Endpoints ───────────────────────────────────────
router.get('/system-settings', administrationController.getSystemSettings);
router.put('/system-settings', systemSettingsSchema, validate, administrationController.updateSystemSettings);

router.get('/notification-settings', administrationController.getNotificationSettings);
router.put('/notification-settings', administrationController.updateNotificationSettings);

router.get('/security-policy', administrationController.getSecurityPolicy);
router.put('/security-policy', administrationController.updateSecurityPolicy);

// ─── Backup & Restore Endpoints ──────────────────────────────────────────────
router.post('/backup', administrationController.executeBackup);
router.get('/backup', administrationController.getBackupHistory);
router.post('/restore', restoreSchema, validate, administrationController.executeRestore);

module.exports = router;
