const ApiError = require('../utils/apiError.util');

/**
 * 404 Not Found middleware.
 * Catches requests to unmapped routes.
 */
const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = { notFound };
