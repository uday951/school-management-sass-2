const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
      index: true
    },
    bloodGroup: {
      type: String,
      default: 'O+'
    },
    heightCm: {
      type: Number,
      default: 165
    },
    weightKg: {
      type: Number,
      default: 55
    },
    allergies: [
      {
        type: String
      }
    ],
    medicalConditions: [
      {
        type: String
      }
    ],
    vaccinations: [
      {
        name: String,
        dateGiven: Date,
        status: { type: String, enum: ['completed', 'pending'], default: 'completed' }
      }
    ],
    doctorNotes: {
      type: String,
      default: 'No specific medical warnings.'
    }
  },
  { timestamps: true }
);

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;
