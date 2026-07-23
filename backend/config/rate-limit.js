const rateLimit = require('express-rate-limit');
const env = require('./environment');

const globalRateLimiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs,
  max: env.security.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please try again later.'
    }
  }
});

module.exports = globalRateLimiter;
