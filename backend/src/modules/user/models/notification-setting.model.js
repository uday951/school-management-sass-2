const mongoose = require('mongoose');

const notificationSettingSchema = new mongoose.Schema(
  {
    emailEnabled: {
      type: Boolean,
      default: true
    },
    smsEnabled: {
      type: Boolean,
      default: true
    },
    pushEnabled: {
      type: Boolean,
      default: true
    },
    reminderDays: {
      type: Number,
      default: 3
    }
  },
  { timestamps: true }
);

const NotificationSetting = mongoose.models.NotificationSetting || mongoose.model('NotificationSetting', notificationSettingSchema);

module.exports = NotificationSetting;
