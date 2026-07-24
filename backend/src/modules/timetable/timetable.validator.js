const { body, param } = require('express-validator');

// Period Validators
const createPeriodRules = [
  body('name').trim().notEmpty().withMessage('Period Name is required'),
  body('startTime').trim().notEmpty().withMessage('Start Time is required'),
  body('endTime').trim().notEmpty().withMessage('End Time is required'),
  body('duration').notEmpty().withMessage('Duration is required').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('isBreak').optional().isBoolean(),
  body('status').optional().isIn(['active', 'inactive'])
];

const updatePeriodRules = [
  param('id').isMongoId().withMessage('Invalid Period ID'),
  body('name').optional().trim().notEmpty(),
  body('startTime').optional().trim().notEmpty(),
  body('endTime').optional().trim().notEmpty(),
  body('duration').optional().isInt({ min: 1 }),
  body('isBreak').optional().isBoolean(),
  body('status').optional().isIn(['active', 'inactive'])
];

// Timetable Entry Validators
const createTimetableRules = [
  body('academicYear').trim().notEmpty().withMessage('Academic Year is required'),
  body('campus').trim().notEmpty().withMessage('Campus is required'),
  body('class').trim().notEmpty().withMessage('Class is required'),
  body('section').trim().notEmpty().withMessage('Section is required'),
  body('day').trim().notEmpty().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Valid Day is required'),
  body('period').trim().notEmpty().withMessage('Period is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('teacher').trim().notEmpty().withMessage('Teacher is required'),
  body('room').trim().notEmpty().withMessage('Room is required')
];

const updateTimetableRules = [
  param('id').isMongoId().withMessage('Invalid Timetable ID'),
  body('academicYear').optional().trim().notEmpty(),
  body('campus').optional().trim().notEmpty(),
  body('class').optional().trim().notEmpty(),
  body('section').optional().trim().notEmpty(),
  body('day').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  body('period').optional().trim().notEmpty(),
  body('subject').optional().trim().notEmpty(),
  body('teacher').optional().trim().notEmpty(),
  body('room').optional().trim().notEmpty()
];

// Room Validators
const createRoomRules = [
  body('roomNumber').trim().notEmpty().withMessage('Room Number is required'),
  body('capacity').notEmpty().withMessage('Capacity is required').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('roomType').optional().isIn(['Classroom', 'Lab', 'Auditorium', 'Library', 'Sports Hall', 'Other'])
];

const updateRoomRules = [
  param('id').isMongoId().withMessage('Invalid Room ID'),
  body('roomNumber').optional().trim().notEmpty(),
  body('capacity').optional().isInt({ min: 1 }),
  body('roomType').optional().isIn(['Classroom', 'Lab', 'Auditorium', 'Library', 'Sports Hall', 'Other'])
];

// Subject Allocation Validators
const createSubjectAllocationRules = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('teacher').trim().notEmpty().withMessage('Teacher is required'),
  body('class').trim().notEmpty().withMessage('Class is required'),
  body('weeklyHours').notEmpty().withMessage('Weekly Hours is required').isInt({ min: 1 }).withMessage('Weekly Hours must be at least 1')
];

const updateSubjectAllocationRules = [
  param('id').isMongoId().withMessage('Invalid Subject Allocation ID'),
  body('subject').optional().trim().notEmpty(),
  body('teacher').optional().trim().notEmpty(),
  body('class').optional().trim().notEmpty(),
  body('weeklyHours').optional().isInt({ min: 1 })
];

// Substitute Teacher Validators
const createSubstituteRules = [
  body('originalTeacher').trim().notEmpty().withMessage('Original Teacher is required'),
  body('substituteTeacher').trim().notEmpty().withMessage('Substitute Teacher is required'),
  body('date').trim().notEmpty().withMessage('Date is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
];

const updateSubstituteRules = [
  param('id').isMongoId().withMessage('Invalid Substitute ID'),
  body('originalTeacher').optional().trim().notEmpty(),
  body('substituteTeacher').optional().trim().notEmpty(),
  body('date').optional().trim().notEmpty(),
  body('reason').optional().trim().notEmpty()
];

module.exports = {
  createPeriodRules,
  updatePeriodRules,
  createTimetableRules,
  updateTimetableRules,
  createRoomRules,
  updateRoomRules,
  createSubjectAllocationRules,
  updateSubjectAllocationRules,
  createSubstituteRules,
  updateSubstituteRules
};
