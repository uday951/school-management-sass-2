const administrationRepository = require('./administration.repository');
const ApiError = require('../../utils/apiError.util');
const mongoose = require('mongoose');

class AdministrationService {
  // ─── Dashboard Stats ───────────────────────────────────────────────────────
  async getDashboardStats() {
    return administrationRepository.getDashboardStats();
  }

  // ─── Users Services ────────────────────────────────────────────────────────
  async getUsers(filter = {}) {
    if (filter.role === 'teacher') {
      try {
        const Teacher = mongoose.models.Teacher || mongoose.model('Teacher');
        const User = mongoose.models.User || mongoose.model('User');
        const teachersList = await Teacher.find({ isDeleted: false });
        for (const t of teachersList) {
          let emailToUse = t.email;
          let existingUser = await User.findOne({ email: t.email });
          
          if (existingUser && existingUser.employeeId !== t.employeeId) {
            const emailParts = t.email.split('@');
            emailToUse = `${emailParts[0]}+${t.employeeId}@${emailParts[1]}`;
            existingUser = await User.findOne({ email: emailToUse });
          }

          if (!existingUser) {
            await User.create({
              name: `${t.firstName} ${t.lastName}`,
              email: emailToUse,
              role: 'teacher',
              department: t.department || '',
              designation: t.designation || '',
              employeeId: t.employeeId,
              mobile: t.phone || '',
              status: 'active'
            });
          }
        }
      } catch (err) {
        console.error('[JIT Sync Error] Failed to sync teachers to users:', err.message);
      }
    }
    return administrationRepository.findUsers(filter);
  }

  async getUserById(id) {
    const user = await administrationRepository.findUserById(id);
    if (!user) throw ApiError.notFound('User not found.');
    return user;
  }

  async createUser(data) {
    if (!data.name || !data.email) {
      throw ApiError.badRequest('Name and Email are required fields.');
    }
    return administrationRepository.createUser(data);
  }

  async updateUser(id, data) {
    const user = await administrationRepository.findUserById(id);
    if (!user) throw ApiError.notFound('User not found.');
    return administrationRepository.updateUser(id, data);
  }

  async deleteUser(id) {
    const user = await administrationRepository.findUserById(id);
    if (!user) throw ApiError.notFound('User not found.');
    return administrationRepository.softDeleteUser(id);
  }

  async resetPassword(id, password) {
    const user = await administrationRepository.findUserById(id);
    if (!user) throw ApiError.notFound('User not found.');
    return administrationRepository.updateUser(id, { password });
  }

  async lockUser(id) {
    const user = await administrationRepository.findUserById(id);
    if (!user) throw ApiError.notFound('User not found.');
    return administrationRepository.updateUser(id, { status: 'locked' });
  }

  async unlockUser(id) {
    const user = await administrationRepository.findUserById(id);
    if (!user) throw ApiError.notFound('User not found.');
    return administrationRepository.updateUser(id, { status: 'active', failedLoginAttempts: 0 });
  }

  async activateUser(id) {
    const user = await administrationRepository.findUserById(id);
    if (!user) throw ApiError.notFound('User not found.');
    return administrationRepository.updateUser(id, { status: 'active' });
  }

  async deactivateUser(id) {
    const user = await administrationRepository.findUserById(id);
    if (!user) throw ApiError.notFound('User not found.');
    return administrationRepository.updateUser(id, { status: 'inactive' });
  }

  // ─── Roles & Permissions ───────────────────────────────────────────────────
  async getRoles() {
    return administrationRepository.findRoles();
  }

  async createRole(data) {
    if (!data.name) throw ApiError.badRequest('Role name is required.');
    return administrationRepository.createRole(data);
  }

  async deleteRole(id) {
    return administrationRepository.deleteRole(id);
  }

  async getPermissions(role) {
    const filter = role ? { role } : {};
    return administrationRepository.findPermissions(filter);
  }

  async updatePermissionMatrix(role, moduleName, actions) {
    if (!role || !moduleName) {
      throw ApiError.badRequest('Role and Module Name are required fields.');
    }
    return administrationRepository.updatePermission(role, moduleName, actions);
  }

  // ─── Departments & Designations ────────────────────────────────────────────
  async getDepartments() {
    return administrationRepository.findDepartments();
  }

  async createDepartment(data) {
    if (!data.name) throw ApiError.badRequest('Department name is required.');
    return administrationRepository.createDepartment(data);
  }

  async deleteDepartment(id) {
    return administrationRepository.deleteDepartment(id);
  }

  async getDesignations() {
    return administrationRepository.findDesignations();
  }

  async createDesignation(data) {
    if (!data.name) throw ApiError.badRequest('Designation name is required.');
    return administrationRepository.createDesignation(data);
  }

  async deleteDesignation(id) {
    return administrationRepository.deleteDesignation(id);
  }

  // ─── Settings Configurations ───────────────────────────────────────────────
  async getSystemSettings() {
    return administrationRepository.getSystemSettings();
  }

  async updateSystemSettings(data) {
    return administrationRepository.updateSystemSettings(data);
  }

  async getNotificationSettings() {
    return administrationRepository.getNotificationSettings();
  }

  async updateNotificationSettings(data) {
    return administrationRepository.updateNotificationSettings(data);
  }

  async getSecurityPolicy() {
    return administrationRepository.getSecurityPolicy();
  }

  async updateSecurityPolicy(data) {
    return administrationRepository.updateSecurityPolicy(data);
  }

  // ─── Backup & Restore ──────────────────────────────────────────────────────
  async executeBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${timestamp}.zip`;
    const size = Math.floor(Math.random() * 2000) + 500; // Simulated size in KB

    return administrationRepository.createBackupLog({
      fileName,
      status: 'success',
      size
    });
  }

  async getBackupHistory() {
    return administrationRepository.findBackupHistory();
  }

  async executeRestore(fileName) {
    if (!fileName) throw ApiError.badRequest('File name is required to execute restore.');
    // Simulated database restore operations
    return {
      success: true,
      restoredFrom: fileName,
      timestamp: new Date()
    };
  }
}

module.exports = new AdministrationService();
