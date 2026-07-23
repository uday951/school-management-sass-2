const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const requiredEnvVars = ['PORT', 'NODE_ENV', 'MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`[WARN] Environment variable ${envVar} is missing. Falling back to defaults.`);
  }
});

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/school_erp',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret_32_bytes_long',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_32_bytes_long',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    cookieSecret: process.env.COOKIE_SECRET || 'default_cookie_secret'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  mail: {
    smtpHost: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    smtpPort: parseInt(process.env.SMTP_PORT, 10) || 2525,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'no-reply@schoolerp.com'
  },
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  }
};
