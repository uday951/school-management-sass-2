const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password using bcrypt.
 * @param {string} password - Plain-text password
 * @returns {Promise<string>} Hashed password string
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain-text password against a hashed password.
 * @param {string} plainText - Incoming plain-text password
 * @param {string} hash - Stored bcrypt hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (plainText, hash) => {
  return bcrypt.compare(plainText, hash);
};

module.exports = { hashPassword, comparePassword };
