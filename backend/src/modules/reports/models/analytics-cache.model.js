const mongoose = require('mongoose');

const analyticsCacheSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    cacheKey: {
      type: String,
      required: [true, 'Cache key is required'],
      unique: true,
      index: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Cache payload data is required']
    },
    expiresAt: {
      type: Date,
      required: [true, 'Cache expiration timestamp is required'],
      index: true
    }
  },
  { timestamps: true }
);

const AnalyticsCache = mongoose.models.AnalyticsCache || mongoose.model('AnalyticsCache', analyticsCacheSchema);

module.exports = AnalyticsCache;
