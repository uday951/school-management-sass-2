const { body, query, param } = require('express-validator');

const createSubjectRules = [
  body('subjectName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject name is required'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject name is required'),
  body()
    .custom((payload) => {
      if (!payload.subjectName && !payload.name) {
        throw new Error('Subject name (subjectName or name) is required');
      }
      return true;
    }),
  body('subjectCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject code is required'),
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject code is required'),
  body()
    .custom((payload) => {
      if (!payload.subjectCode && !payload.code) {
        throw new Error('Subject code (subjectCode or code) is required');
      }
      return true;
    }),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('credits')
    .notEmpty()
    .withMessage('Credits are required')
    .isFloat({ min: 0 })
    .withMessage('Credits must be a non-negative number'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status must be ACTIVE or INACTIVE'),
  body('teacher')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid teacher ID format'),
  body('teacherId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid teacherId format'),
  body('classes')
    .optional()
    .isArray()
    .withMessage('Classes must be an array of class IDs'),
  body('classes.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid class ID in classes array'),
  body('assignedClasses')
    .optional()
    .isArray()
    .withMessage('Assigned classes must be an array of class IDs'),
  body('assignedClasses.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid class ID in assignedClasses array')
];

const updateSubjectRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid subject ID parameter'),
  body('subjectName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject name cannot be empty'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject name cannot be empty'),
  body('subjectCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject code cannot be empty'),
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject code cannot be empty'),
  body('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty'),
  body('credits')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Credits must be a non-negative number'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status must be ACTIVE or INACTIVE')
];

const subjectIdParamRule = [
  param('id')
    .isMongoId()
    .withMessage('Invalid subject ID parameter')
];

const getSubjectQueryRules = [
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
  query('department')
    .optional()
    .trim()
];

const assignSubjectRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid subject ID parameter'),
  body('teacher')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid teacher ID format'),
  body('teacherId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid teacherId format'),
  body('classes')
    .optional()
    .isArray()
    .withMessage('Classes must be an array'),
  body('classes.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid class ID in classes array'),
  body('assignedClasses')
    .optional()
    .isArray()
    .withMessage('Assigned classes must be an array'),
  body('assignedClasses.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid class ID in assignedClasses array')
];

const toggleStatusRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid subject ID parameter'),
  body('status')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status must be ACTIVE or INACTIVE')
];

module.exports = {
  createSubjectRules,
  updateSubjectRules,
  subjectIdParamRule,
  getSubjectQueryRules,
  assignSubjectRules,
  toggleStatusRules
};
