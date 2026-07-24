const { body, param } = require('express-validator');

const createExamSchema = [
  body('name').trim().notEmpty().withMessage('Exam Name is required'),
  body('type').trim().notEmpty().withMessage('Exam Type is required')
    .isIn(['Mid Exam', 'Quarterly', 'Half Yearly', 'Annual']).withMessage('Invalid Exam Type'),
  body('academicYear').trim().notEmpty().withMessage('Academic Year is required'),
  body('classId').notEmpty().withMessage('Class reference is required')
    .isMongoId().withMessage('Invalid Class ID format'),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date format'),
  body('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date format')
];

const createScheduleSchema = [
  body('examId').notEmpty().withMessage('Exam ID is required').isMongoId().withMessage('Invalid Exam ID format'),
  body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Invalid date format'),
  body('subjectId').notEmpty().withMessage('Subject ID is required').isMongoId().withMessage('Invalid Subject ID format'),
  body('classId').notEmpty().withMessage('Class ID is required').isMongoId().withMessage('Invalid Class ID format'),
  body('time').trim().notEmpty().withMessage('Time slot is required'),
  body('hall').trim().notEmpty().withMessage('Hall name is required')
];

const saveMarksSchema = [
  body('studentId').notEmpty().withMessage('Student ID is required').isMongoId().withMessage('Invalid Student ID format'),
  body('examId').notEmpty().withMessage('Exam ID is required').isMongoId().withMessage('Invalid Exam ID format'),
  body('subjectId').notEmpty().withMessage('Subject ID is required').isMongoId().withMessage('Invalid Subject ID format'),
  body('marksObtained').notEmpty().withMessage('Marks obtained is required')
    .isNumeric().withMessage('Marks obtained must be a number')
    .custom((val) => val >= 0).withMessage('Marks obtained cannot be negative'),
  body('maxMarks').optional()
    .isNumeric().withMessage('Maximum marks must be a number')
    .custom((val) => val > 0).withMessage('Maximum marks must be greater than zero')
];

const createGradeSchema = [
  body('gradeName').trim().notEmpty().withMessage('Grade name is required'),
  body('minMarks').notEmpty().withMessage('Minimum marks limit is required')
    .isNumeric().withMessage('Minimum marks must be a number')
    .custom((val) => val >= 0).withMessage('Minimum marks cannot be negative'),
  body('maxMarks').notEmpty().withMessage('Maximum marks limit is required')
    .isNumeric().withMessage('Maximum marks must be a number')
    .custom((val) => val >= 0).withMessage('Maximum marks cannot be negative'),
  body('gpa').notEmpty().withMessage('GPA value is required')
    .isNumeric().withMessage('GPA must be a number')
    .custom((val) => val >= 0).withMessage('GPA cannot be negative')
];

module.exports = {
  createExamSchema,
  createScheduleSchema,
  saveMarksSchema,
  createGradeSchema
};
