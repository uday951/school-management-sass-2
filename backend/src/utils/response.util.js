const HTTP_STATUS = require('../constants/http-status');

/**
 * Standard success response formatter.
 */
const sendSuccess = (res, message, data = null, statusCode = HTTP_STATUS.OK) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Standard created response formatter.
 */
const sendCreated = (res, message, data = null) => {
  return sendSuccess(res, message, data, HTTP_STATUS.CREATED);
};

/**
 * Paginated response formatter.
 */
const sendPaginated = (res, message, data, pagination) => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination
  });
};

/**
 * Standard error response formatter.
 */
const sendError = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode = null, details = null) => {
  const error = { code: errorCode || 'ERROR', message };
  if (details) error.details = details;
  return res.status(statusCode).json({ success: false, error });
};

module.exports = { sendSuccess, sendCreated, sendPaginated, sendError };
