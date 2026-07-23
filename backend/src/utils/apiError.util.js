const HTTP_STATUS = require('../constants/http-status');

/**
 * Custom operational error class.
 * Use this instead of the default Error class to
 * include HTTP status codes and error codes in responses.
 */
class ApiError extends Error {
  constructor(statusCode, message, errorCode = null, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message, 'NOT_FOUND');
  }

  static conflict(message, details = null) {
    return new ApiError(HTTP_STATUS.CONFLICT, message, 'CONFLICT', details);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, 'INTERNAL_ERROR');
  }

  static validationFailed(details) {
    return new ApiError(
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      'Validation failed',
      'VALIDATION_FAILED',
      details
    );
  }
}

module.exports = ApiError;
