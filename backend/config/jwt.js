const env = require('./environment');

module.exports = {
  accessSecret: env.jwt.accessSecret,
  accessExpiration: env.jwt.accessExpiration,
  refreshSecret: env.jwt.refreshSecret,
  refreshExpiration: env.jwt.refreshExpiration,
  cookieSecret: env.jwt.cookieSecret
};
