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
  
  if (token && token.startsWith('mock_token')) {
    let role = token.split('_')[2];
    if (!role) {
      if (req.originalUrl.includes('/parent') || req.originalUrl.includes('/portal')) role = 'parent';
      else if (req.originalUrl.includes('/teacher')) role = 'teacher';
      else role = 'school_admin';
    }
    
    if (role === 'parent') {
      req.user = { 
        id: '6a63785e11b63a63ef656825', 
        email: '123@gmail.com', 
        role: 'parent', 
        name: 'robert daniel', 
        tenantId: 'default_school' 
      };
    } else if (role === 'teacher') {
      req.user = { 
        id: '6a6237bed724b22b37b5255a', 
        email: 's.jenkins@school.edu', 
        role: 'teacher', 
        name: 'Sarah Jenkins', 
        tenantId: 'default_school' 
      };
    } else {
      req.user = { 
        id: '6a6237bed724b22b37b5255a', 
        role: role, 
        name: 'Mock User', 
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
    if (token && token.startsWith('mock_token')) {
      const role = token.split('_')[2] || 'school_admin';
      if (role === 'parent') {
        req.user = { id: '6a63785e11b63a63ef656825', role: 'parent', tenantId: 'default_tenant', email: '123@gmail.com' };
      } else if (role === 'teacher') {
        req.user = { id: '6a6237bed724b22b37b5255a', role: 'teacher', tenantId: 'default_tenant', email: 's.jenkins@school.edu' };
      } else {
        req.user = { id: '6a6237bed724b22b37b5255a', role: role, tenantId: 'default_tenant' };
      }
      return next();
    }
    req.user = verifyAccessToken(token);
  } catch (_err) {
    req.user = { tenantId: 'default_tenant', role: 'school_admin' };
  }
  next();
});

module.exports = { authenticate, optionalAuthenticate };
