const env = require('../../config/environment');

const COOKIE_NAME = 'erp_refresh_token';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

/**
 * Set the refresh token in a secure HttpOnly cookie.
 */
const setRefreshTokenCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

/**
 * Clear the refresh token cookie on logout.
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax'
  });
};

/**
 * Extract refresh token from request cookies.
 */
const getRefreshTokenFromCookie = (req) => {
  return req.cookies?.[COOKIE_NAME] || null;
};

module.exports = {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie
};
