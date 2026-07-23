/**
 * Jest Test Suite Global Setup.
 * This file runs once before all tests via jest.config.js setupFilesAfterEnv.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/school_erp_test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_32_bytes_here';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_32_bytes_here';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.COOKIE_SECRET = 'test_cookie_secret';

// Extend Jest timeout for integration tests
jest.setTimeout(30000);
