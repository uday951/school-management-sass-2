const ROLES = require('./roles');

// ─── Permission Keys ────────────────────────────────────────────────────────
const PERMISSIONS = {
  // System
  MANAGE_SYSTEM: 'system:manage',
  VIEW_DASHBOARD: 'dashboard:view',

  // Users
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  // Students (scaffold - expanded later)
  STUDENTS_VIEW: 'students:view',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',

  // Reports (scaffold)
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export'
};

// ─── Role → Permission Matrix ────────────────────────────────────────────────
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.SCHOOL_ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_UPDATE,
    PERMISSIONS.STUDENTS_DELETE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT
  ],

  [ROLES.TEACHER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.REPORTS_VIEW
  ],

  [ROLES.PARENT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.STUDENTS_VIEW
  ]
};

module.exports = { PERMISSIONS, ROLE_PERMISSIONS };
