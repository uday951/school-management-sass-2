const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
      index: true
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required']
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required']
    },
    qualification: {
      type: String,
      trim: true,
      default: ''
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active',
      index: true
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    assignedClasses: [
      {
        classId: { type: String, trim: true },
        className: { type: String, trim: true },
        section: { type: String, trim: true },
        isClassTeacher: { type: Boolean, default: false }
      }
    ],
    assignedSubjects: [
      {
        subjectId: { type: String, trim: true },
        subjectName: { type: String, trim: true },
        className: { type: String, trim: true }
      }
    ],
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

// Indexes for tenant and search
teacherSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });
teacherSchema.index({ firstName: 'text', lastName: 'text', employeeId: 1, email: 1 });

teacherSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
