const mongoose = require('mongoose');
const ROLES = require('../../constants/roles');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      default: ROLES.TEACHER
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    employeeId: {
      type: String,
      trim: true,
      default: ''
    },
    username: {
      type: String,
      trim: true,
      default: ''
    },
    mobile: {
      type: String,
      trim: true,
      default: ''
    },
    password: {
      type: String,
      default: 'password123'
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: {
      type: Date
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'locked'],
      default: 'active'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Virtual getters for frontend compatibility
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
