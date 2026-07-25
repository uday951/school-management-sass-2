const administrationService = require('./administration.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated } = require('../../utils/response.util');

class AdministrationController {
  // ─── Dashboard Stats ───────────────────────────────────────────────────────
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await administrationService.getDashboardStats();
    return sendSuccess(res, 'Administration dashboard statistics retrieved.', stats);
  });

  // ─── Users ─────────────────────────────────────────────────────────────────
  getUsers = asyncHandler(async (req, res) => {
    const list = await administrationService.getUsers(req.query);
    return sendSuccess(res, 'Users list retrieved successfully.', list);
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await administrationService.getUserById(req.params.id);
    return sendSuccess(res, 'User details retrieved.', user);
  });

  createUser = asyncHandler(async (req, res) => {
    const user = await administrationService.createUser(req.body);
    return sendCreated(res, 'User created successfully.', user);
  });

  updateUser = asyncHandler(async (req, res) => {
    const updated = await administrationService.updateUser(req.params.id, req.body);
    return sendSuccess(res, 'User updated successfully.', updated);
  });

  deleteUser = asyncHandler(async (req, res) => {
    await administrationService.deleteUser(req.params.id);
    return sendSuccess(res, 'User deleted successfully.');
  });

  resetPassword = asyncHandler(async (req, res) => {
    const updated = await administrationService.resetPassword(req.params.id, req.body.password);
    return sendSuccess(res, 'User password reset successfully.', updated);
  });

  lockUser = asyncHandler(async (req, res) => {
    const updated = await administrationService.lockUser(req.params.id);
    return sendSuccess(res, 'User account locked.', updated);
  });

  unlockUser = asyncHandler(async (req, res) => {
    const updated = await administrationService.unlockUser(req.params.id);
    return sendSuccess(res, 'User account unlocked.', updated);
  });

  activateUser = asyncHandler(async (req, res) => {
    const updated = await administrationService.activateUser(req.params.id);
    return sendSuccess(res, 'User account activated.', updated);
  });

  deactivateUser = asyncHandler(async (req, res) => {
    const updated = await administrationService.deactivateUser(req.params.id);
    return sendSuccess(res, 'User account deactivated.', updated);
  });

  // ─── Roles & Permissions ───────────────────────────────────────────────────
  getRoles = asyncHandler(async (req, res) => {
    const roles = await administrationService.getRoles();
    return sendSuccess(res, 'Roles list retrieved.', roles);
  });

  createRole = asyncHandler(async (req, res) => {
    const role = await administrationService.createRole(req.body);
    return sendCreated(res, 'Role created successfully.', role);
  });

  deleteRole = asyncHandler(async (req, res) => {
    await administrationService.deleteRole(req.params.id);
    return sendSuccess(res, 'Role deleted successfully.');
  });

  getPermissions = asyncHandler(async (req, res) => {
    const list = await administrationService.getPermissions(req.query.role);
    return sendSuccess(res, 'Permission matrix configurations retrieved.', list);
  });

  updatePermissionMatrix = asyncHandler(async (req, res) => {
    const { role, moduleName, actions } = req.body;
    const updated = await administrationService.updatePermissionMatrix(role, moduleName, actions);
    return sendSuccess(res, 'Permission matrix updated.', updated);
  });

  // ─── Departments & Designations ────────────────────────────────────────────
  getDepartments = asyncHandler(async (req, res) => {
    const list = await administrationService.getDepartments();
    return sendSuccess(res, 'Departments list retrieved.', list);
  });

  createDepartment = asyncHandler(async (req, res) => {
    const dept = await administrationService.createDepartment(req.body);
    return sendCreated(res, 'Department created successfully.', dept);
  });

  deleteDepartment = asyncHandler(async (req, res) => {
    await administrationService.deleteDepartment(req.params.id);
    return sendSuccess(res, 'Department deleted successfully.');
  });

  getDesignations = asyncHandler(async (req, res) => {
    const list = await administrationService.getDesignations();
    return sendSuccess(res, 'Designations list retrieved.', list);
  });

  createDesignation = asyncHandler(async (req, res) => {
    const desig = await administrationService.createDesignation(req.body);
    return sendCreated(res, 'Designation created successfully.', desig);
  });

  deleteDesignation = asyncHandler(async (req, res) => {
    await administrationService.deleteDesignation(req.params.id);
    return sendSuccess(res, 'Designation deleted successfully.');
  });

  // ─── Settings Configurations ───────────────────────────────────────────────
  getSystemSettings = asyncHandler(async (req, res) => {
    const settings = await administrationService.getSystemSettings();
    return sendSuccess(res, 'System settings retrieved.', settings);
  });

  updateSystemSettings = asyncHandler(async (req, res) => {
    const updated = await administrationService.updateSystemSettings(req.body);
    return sendSuccess(res, 'System settings updated successfully.', updated);
  });

  getNotificationSettings = asyncHandler(async (req, res) => {
    const settings = await administrationService.getNotificationSettings();
    return sendSuccess(res, 'Notification settings retrieved.', settings);
  });

  updateNotificationSettings = asyncHandler(async (req, res) => {
    const updated = await administrationService.updateNotificationSettings(req.body);
    return sendSuccess(res, 'Notification settings updated.', updated);
  });

  getSecurityPolicy = asyncHandler(async (req, res) => {
    const policy = await administrationService.getSecurityPolicy();
    return sendSuccess(res, 'Security policies retrieved.', policy);
  });

  updateSecurityPolicy = asyncHandler(async (req, res) => {
    const updated = await administrationService.updateSecurityPolicy(req.body);
    return sendSuccess(res, 'Security policies updated.', updated);
  });

  // ─── Backup & Restore ──────────────────────────────────────────────────────
  executeBackup = asyncHandler(async (req, res) => {
    const backup = await administrationService.executeBackup();
    return sendCreated(res, 'Database backup file generated successfully.', backup);
  });

  getBackupHistory = asyncHandler(async (req, res) => {
    const history = await administrationService.getBackupHistory();
    return sendSuccess(res, 'Backup history logs retrieved.', history);
  });

  executeRestore = asyncHandler(async (req, res) => {
    const result = await administrationService.executeRestore(req.body.fileName);
    return sendSuccess(res, 'Database restore command executed successfully.', result);
  });
}

module.exports = new AdministrationController();
