const ApiError = require('../utils/apiError.util');
const ROLES = require('../constants/roles');

/**
 * Role-based authorization middleware.
 * Verifies the authenticated user's role is in the allowed list.
 *
 * Usage: router.get('/route', authenticate, authorizeRoles('school_admin', 'teacher'), controller)
 *
 * @param {...string} roles - Allowed role strings
 */
const authorizeRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    // Super admin bypasses all role checks
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required roles: [${roles.join(', ')}]. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

module.exports = { authorizeRoles };
