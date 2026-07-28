const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
      index: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true
    },
    attachments: [
      {
        name: { type: String },
        url: { type: String }
      }
    ],
    submissions: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
          required: true
        },
        status: {
          type: String,
          enum: ['pending', 'submitted', 'evaluated'],
          default: 'pending'
        },
        submissionDate: {
          type: Date
        },
        fileUrl: {
          type: String
        },
        marks: {
          type: Number,
          default: 0
        },
        feedback: {
          type: String,
          default: ''
        },
        remarks: {
          type: String,
          default: ''
        }
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

homeworkSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const Homework = mongoose.models.Homework || mongoose.model('Homework', homeworkSchema);

module.exports = Homework;
