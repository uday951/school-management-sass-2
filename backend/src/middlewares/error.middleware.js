const ApiError = require('../utils/apiError.util');
const HTTP_STATUS = require('../constants/http-status');
const { logger } = require('../utils/logger.util');
const env = require('../../config/environment');

/**
 * Global error handling middleware.
 * Must be registered last in Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Log the error
  logger.error(`[${req.method}] ${req.path} - ${err.message}`, {
    stack: err.stack,
    statusCode: err.statusCode
  });

  // ─── Mongoose Duplicate Key Error ────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: `A record with this ${field} already exists.`
      }
    });
  }

  // ─── Mongoose CastError (Invalid ObjectId) ───────────────────────────────
  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: `Invalid value for field: ${err.path}`
      }
    });
  }

  // ─── Mongoose Validation Error ────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      issue: e.message
    }));
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Mongoose schema validation failed.',
        details
      }
    });
  }

  // ─── Operational ApiError ────────────────────────────────────────────────
  if (err instanceof ApiError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode || 'ERROR',
        message: err.message,
        ...(err.details && { details: err.details })
      }
    });
  }

  // ─── Unhandled / Unknown Errors ───────────────────────────────────────────
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        env.nodeEnv === 'production'
          ? 'An unexpected error occurred. Please try again later.'
          : err.message,
      ...(env.nodeEnv !== 'production' && { stack: err.stack })
    }
  });
};

module.exports = { errorHandler };
