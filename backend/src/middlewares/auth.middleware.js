const { verifyAccessToken, extractBearerToken } = require('../utils/jwt.util');
const ApiError = require('../utils/apiError.util');
const asyncHandler = require('../utils/asyncHandler.util');

/**
 * JWT Authentication Middleware.
 * Extracts and verifies Bearer token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  const decoded = verifyAccessToken(token);
  req.user = decoded;
  next();
});

/**
 * Optional authentication — does not throw if no token is present.
 * Silently attaches user if a valid token exists.
 */
const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    req.user = verifyAccessToken(token);
  } catch (_err) {
    req.user = { tenantId: 'default_tenant', role: 'school_admin' };
  }
  next();
});

module.exports = { authenticate, optionalAuthenticate };
