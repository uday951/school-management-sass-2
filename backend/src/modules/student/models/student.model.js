const mongoose = require('mongoose');
const { STUDENT_STATUS, GENDER, BLOOD_GROUPS } = require('../student.constants');

const studentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    admissionNo: {
      type: String,
      required: [true, 'Admission number is required'],
      trim: true,
      index: true
    },
    admissionDate: {
      type: Date,
      required: [true, 'Admission date is required']
    },
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    middleName: {
      type: String,
      trim: true,
      default: ''
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      required: [true, 'Gender is required']
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      default: 'O+'
    },
    religion: {
      type: String,
      trim: true,
      default: ''
    },
    nationality: {
      type: String,
      trim: true,
      default: 'American'
    },

    // Academic Details
    campus: {
      type: String,
      default: 'Main Campus'
    },
    academicYear: {
      type: String,
      default: '2026-2027'
    },
    class: {
      type: String,
      required: [true, 'Class is required']
    },
    section: {
      type: String,
      required: [true, 'Section is required']
    },
    house: {
      type: String,
      default: ''
    },
    board: {
      type: String,
      default: 'CBSE'
    },
    medium: {
      type: String,
      default: 'English'
    },

    // Contact Information
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    country: {
      type: String,
      trim: true,
      default: 'USA'
    },
    pinCode: {
      type: String,
      trim: true,
      default: ''
    },

    // Status
    status: {
      type: String,
      enum: Object.values(STUDENT_STATUS),
      default: STUDENT_STATUS.ACTIVE,
      index: true
    },
    passoutYear: {
      type: String,
      default: null
    },

    // Avatar Photo URL
    avatarUrl: {
      type: String,
      default: ''
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound Unique Indexes per tenant
studentSchema.index({ tenantId: 1, admissionNo: 1 }, { unique: true });
studentSchema.index({ tenantId: 1, class: 1, section: 1, rollNo: 1 });
studentSchema.index({ firstName: 'text', lastName: 'text', admissionNo: 'text' });

// Pre-find hook to exclude soft-deleted records by default
studentSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
