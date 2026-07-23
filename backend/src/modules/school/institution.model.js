const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    name: {
      type: String,
      required: [true, 'School Name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'School Code is required'],
      trim: true,
      uppercase: true
    },
    affiliationNumber: {
      type: String,
      required: [true, 'Affiliation Number is required'],
      trim: true
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration Number is required'],
      trim: true
    },
    establishedYear: {
      type: Number,
      required: [true, 'Established Year is required']
    },
    type: {
      type: String,
      required: [true, 'School Type is required'],
      enum: ['co-educational', 'boys', 'girls', 'other'],
      default: 'co-educational'
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    mobile: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      required: [true, 'Website URL is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    pinCode: {
      type: String,
      required: [true, 'PIN Code is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Full Address is required'],
      trim: true
    },
    principalName: {
      type: String,
      required: [true, 'Principal Name is required'],
      trim: true
    },
    principalContact: {
      type: String,
      required: [true, 'Principal Contact is required'],
      trim: true
    },
    principalEmail: {
      type: String,
      required: [true, 'Principal Email is required'],
      trim: true,
      lowercase: true
    },
    logo: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }
    },
    favicon: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }
    },
    banner: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

institutionSchema.index({ tenantId: 1, code: 1 }, { unique: true });

const Institution = mongoose.model('Institution', institutionSchema);

module.exports = Institution;
