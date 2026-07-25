const User = require('./user.model');
const Role = require('./models/role.model');
const Permission = require('./models/permission.model');
const Department = require('./models/department.model');
const Designation = require('./models/designation.model');
const SystemSetting = require('./models/system-setting.model');
const NotificationSetting = require('./models/notification-setting.model');
const BackupHistory = require('./models/backup-history.model');
const SecurityPolicy = require('./models/security-policy.model');

class AdministrationRepository {
  // ─── Users CRUD & Status ───────────────────────────────────────────────────
  async findUsers(filter = {}) {
    return User.find({ isDeleted: false, ...filter }).sort({ name: 1 }).lean();
  }

  async findUserById(id) {
    return User.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createUser(data) {
    return User.create(data);
  }

  async updateUser(id, data) {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteUser(id) {
    return User.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Roles CRUD ────────────────────────────────────────────────────────────
  async findRoles(filter = {}) {
    return Role.find(filter).lean();
  }

  async createRole(data) {
    return Role.create(data);
  }

  async deleteRole(id) {
    return Role.findByIdAndDelete(id);
  }

  // ─── Permissions CRUD ──────────────────────────────────────────────────────
  async findPermissions(filter = {}) {
    return Permission.find(filter).lean();
  }

  async updatePermission(role, module, actions) {
    return Permission.findOneAndUpdate(
      { role, module },
      { $set: { actions } },
      { upsert: true, new: true }
    );
  }

  // ─── Departments CRUD ──────────────────────────────────────────────────────
  async findDepartments(filter = {}) {
    return Department.find(filter).lean();
  }

  async createDepartment(data) {
    return Department.create(data);
  }

  async deleteDepartment(id) {
    return Department.findByIdAndDelete(id);
  }

  // ─── Designations CRUD ─────────────────────────────────────────────────────
  async findDesignations(filter = {}) {
    return Designation.find(filter).lean();
  }

  async createDesignation(data) {
    return Designation.create(data);
  }

  async deleteDesignation(id) {
    return Designation.findByIdAndDelete(id);
  }

  // ─── Settings CRUD ─────────────────────────────────────────────────────────
  async getSystemSettings() {
    let settings = await SystemSetting.findOne({});
    if (!settings) {
      settings = await SystemSetting.create({ schoolName: 'ERP International Academy' });
    }
    return settings;
  }

  async updateSystemSettings(data) {
    return SystemSetting.findOneAndUpdate({}, { $set: data }, { upsert: true, new: true });
  }

  async getNotificationSettings() {
    let settings = await NotificationSetting.findOne({});
    if (!settings) {
      settings = await NotificationSetting.create({});
    }
    return settings;
  }

  async updateNotificationSettings(data) {
    return NotificationSetting.findOneAndUpdate({}, { $set: data }, { upsert: true, new: true });
  }

  async getSecurityPolicy() {
    let policy = await SecurityPolicy.findOne({});
    if (!policy) {
      policy = await SecurityPolicy.create({});
    }
    return policy;
  }

  async updateSecurityPolicy(data) {
    return SecurityPolicy.findOneAndUpdate({}, { $set: data }, { upsert: true, new: true });
  }

  // ─── Backup logs ───────────────────────────────────────────────────────────
  async createBackupLog(data) {
    return BackupHistory.create(data);
  }

  async findBackupHistory() {
    return BackupHistory.find({}).sort({ date: -1 }).lean();
  }

  // ─── Stats Dashboard ───────────────────────────────────────────────────────
  async getDashboardStats() {
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const activeUsers = await User.countDocuments({ status: 'active', isDeleted: false });
    const lockedUsers = await User.countDocuments({ status: 'locked', isDeleted: false });
    const rolesCount = await Role.countDocuments({});
    const departmentsCount = await Department.countDocuments({});

    const recentActivities = [
      { id: 'act-1', desc: 'System settings updated by Admin', time: new Date() },
      { id: 'act-2', desc: 'Teacher Jane Doe password reset', time: new Date(Date.now() - 3600000) },
      { id: 'act-3', desc: 'Database backup backup_v12.zip created', time: new Date(Date.now() - 7200000) }
    ];

    return {
      totalUsers,
      activeUsers,
      onlineUsers: Math.max(1, activeUsers - 2),
      roles: rolesCount,
      departments: departmentsCount,
      loginStatistics: { total: totalUsers * 5, failed: lockedUsers },
      failedLoginAttempts: lockedUsers,
      recentActivities
    };
  }
}

module.exports = new AdministrationRepository();
