const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, 'Role name is required'],
      index: true
    },
    module: {
      type: String,
      required: [true, 'Module name is required'],
      index: true
    },
    actions: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
      approve: { type: Boolean, default: false },
      print: { type: Boolean, default: false },
      assign: { type: Boolean, default: false },
      manage: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

const Permission = mongoose.models.Permission || mongoose.model('Permission', permissionSchema);

module.exports = Permission;
