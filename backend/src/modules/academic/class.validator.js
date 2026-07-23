const { body, query, param } = require('express-validator');

const createClassRules = [
  body('className')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Class name is required'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Class name is required'),
  body()
    .custom((payload) => {
      if (!payload.className && !payload.name) {
        throw new Error('Class name (className or name) is required');
      }
      return true;
    }),
  body('classCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Class code is required'),
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Class code is required'),
  body()
    .custom((payload) => {
      if (!payload.classCode && !payload.code) {
        throw new Error('Class code (classCode or code) is required');
      }
      return true;
    }),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('roomNumber')
    .trim()
    .notEmpty()
    .withMessage('Room number is required'),
  body('teacherId')
    .optional({ nullable: true, checkFalsy: true }),
  body('status')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status must be ACTIVE or INACTIVE')
];

const updateClassRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid class ID parameter'),
  body('className')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Class name cannot be empty'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Class name cannot be empty'),
  body('classCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Class code cannot be empty'),
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Class code cannot be empty'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('roomNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Room number cannot be empty'),
  body('teacherId')
    .optional({ nullable: true, checkFalsy: true }),
  body('status')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status must be ACTIVE or INACTIVE')
];

const classIdParamRule = [
  param('id')
    .isMongoId()
    .withMessage('Invalid class ID parameter')
];

const getClassQueryRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('status')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status must be ACTIVE or INACTIVE'),
  query('teacherId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid teacherId format')
];

module.exports = {
  createClassRules,
  updateClassRules,
  classIdParamRule,
  getClassQueryRules
};
