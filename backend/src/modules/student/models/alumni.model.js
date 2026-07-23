const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
      index: true
    },
    passoutYear: {
      type: String,
      required: true
    },
    graduationClass: {
      type: String,
      default: 'Grade 12'
    },
    currentOccupation: {
      type: String,
      default: 'Higher Education'
    },
    institutionOrCompany: {
      type: String,
      default: 'Stanford University'
    }
  },
  { timestamps: true }
);

const StudentAlumni = mongoose.model('StudentAlumni', alumniSchema);

module.exports = StudentAlumni;
