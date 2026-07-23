const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config/jwt');
const ApiError = require('./apiError.util');

/**
 * Generate a short-lived JWT access token.
 * @param {Object} payload - User data to sign into the token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiration
  });
};

/**
 * Generate a long-lived JWT refresh token.
 * @param {Object} payload - User data to sign into the token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiration
  });
};

/**
 * Verify and decode an access token.
 * Throws ApiError.unauthorized() if token is invalid or expired.
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.accessSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token has expired. Please refresh your session.');
    }
    throw ApiError.unauthorized('Invalid access token.');
  }
};

/**
 * Verify and decode a refresh token.
 * Throws ApiError.unauthorized() if token is invalid or expired.
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Refresh token has expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid refresh token.');
  }
};

/**
 * Extract token string from the Authorization header.
 * Expected format: "Bearer <token>"
 */
const extractBearerToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No authentication token provided.');
  }
  return authHeader.split(' ')[1];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractBearerToken
};
