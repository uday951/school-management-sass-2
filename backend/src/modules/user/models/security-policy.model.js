const mongoose = require('mongoose');

const securityPolicySchema = new mongoose.Schema(
  {
    sessionTimeout: {
      type: Number, // in minutes
      default: 30
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    accountLockDuration: {
      type: Number, // in minutes
      default: 15
    },
    jwtExpiry: {
      type: String,
      default: '15m'
    },
    passwordPolicy: {
      minLength: { type: Number, default: 8 },
      requireSpecialChar: { type: Boolean, default: true },
      requireNumber: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

const SecurityPolicy = mongoose.models.SecurityPolicy || mongoose.model('SecurityPolicy', securityPolicySchema);

module.exports = SecurityPolicy;
