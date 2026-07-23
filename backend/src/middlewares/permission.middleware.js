const ApiError = require('../utils/apiError.util');
const { ROLE_PERMISSIONS } = require('../constants/permissions');
const ROLES = require('../constants/roles');

/**
 * Dynamic permission assertion middleware.
 * Checks whether the authenticated user holds a required permission key.
 *
 * Usage: router.post('/students', authenticate, checkPermission('students:create'), controller)
 *
 * @param {string} requiredPermission - Permission key string (e.g., 'students:create')
 */
const checkPermission = (requiredPermission) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    // Super admin bypasses all permission checks
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

    if (!userPermissions.includes(requiredPermission)) {
      return next(
        ApiError.forbidden(
          `Access denied. Missing permission: ${requiredPermission}`
        )
      );
    }

    next();
  };
};

module.exports = { checkPermission };
