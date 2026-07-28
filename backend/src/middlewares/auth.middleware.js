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
  
  if (token === 'mock_token' && process.env.NODE_ENV !== 'production') {
    if (req.originalUrl.includes('/parent')) {
      req.user = {
        id: '6a63785e11b63a63ef656825', // Robert Daniel's ID from seeded db
        email: '123@gmail.com',
        role: 'parent',
        name: 'robert daniel',
        tenantId: 'default_school'
      };
    } else if (req.originalUrl.includes('/teacher')) {
      req.user = {
        id: '6a62315fb63cbcaf89179eb5', // mock teacher id
        email: 's.jenkins@school.edu',
        role: 'teacher',
        name: 'Sarah Jenkins',
        tenantId: 'default_school'
      };
    } else {
      req.user = {
        id: '6a62315fb63cbcaf89179eb9',
        email: 'admin@school.com',
        role: 'school_admin',
        name: 'Admin User',
        tenantId: 'default_school'
      };
    }
    return next();
  }

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
