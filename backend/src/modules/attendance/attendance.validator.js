const { body, query } = require('express-validator');

const markStudentSchema = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('status').isIn(['present', 'absent', 'late', 'halfday']).withMessage('Invalid attendance status')
];

const markTeacherSchema = [
  body('teacherId').notEmpty().withMessage('Teacher ID is required'),
  body('status').isIn(['present', 'absent', 'late', 'halfday']).withMessage('Invalid attendance status')
];

const createHolidaySchema = [
  body('title').trim().notEmpty().withMessage('Holiday title is required'),
  body('date').notEmpty().withMessage('Holiday date is required').isISO8601().withMessage('Invalid date format')
];

module.exports = {
  markStudentSchema,
  markTeacherSchema,
  createHolidaySchema
};
