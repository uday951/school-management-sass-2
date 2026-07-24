const { body, param, query } = require('express-validator');

const createTeacherSchema = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email address is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('designation').notEmpty().withMessage('Designation is required'),
  body('joiningDate').notEmpty().withMessage('Joining date is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required')
];

const updateTeacherSchema = [
  param('id').isMongoId().withMessage('Invalid teacher ID'),
  body('email').optional().isEmail().withMessage('Valid email address is required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Valid gender is required')
];

const createDepartmentSchema = [
  body('name').notEmpty().withMessage('Department name is required'),
  body('code').notEmpty().withMessage('Department code is required')
];

const createDesignationSchema = [
  body('name').notEmpty().withMessage('Designation name is required'),
  body('code').notEmpty().withMessage('Designation code is required')
];

const addQualificationSchema = [
  body('degree').notEmpty().withMessage('Degree is required'),
  body('institution').notEmpty().withMessage('Institution is required'),
  body('year').isNumeric().withMessage('Valid year is required')
];

const addExperienceSchema = [
  body('organization').notEmpty().withMessage('Organization is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('startDate').notEmpty().withMessage('Start date is required')
];

const recordAttendanceSchema = [
  body('date').notEmpty().withMessage('Attendance date is required'),
  body('status').isIn(['present', 'absent', 'leave', 'half_day']).withMessage('Valid attendance status is required')
];

const requestLeaveSchema = [
  body('leaveType').notEmpty().withMessage('Leave type is required'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('endDate').notEmpty().withMessage('End date is required'),
  body('reason').notEmpty().withMessage('Reason is required')
];

module.exports = {
  createTeacherSchema,
  updateTeacherSchema,
  createDepartmentSchema,
  createDesignationSchema,
  addQualificationSchema,
  addExperienceSchema,
  recordAttendanceSchema,
  requestLeaveSchema
};
