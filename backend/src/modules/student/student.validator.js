const { body, param, query } = require('express-validator');

const createAdmissionSchema = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('studentClass').optional({ values: 'falsy' }).trim(),
  body('section').optional({ values: 'falsy' }).trim(),
  body('gender').optional({ values: 'falsy' }).isIn(['male', 'female', 'other']).withMessage('Invalid gender value'),
  body('phone').optional({ values: 'falsy' }).trim(),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email address')
];

const bulkDeleteSchema = [
  body('studentIds').isArray({ min: 1 }).withMessage('studentIds must be a non-empty array of IDs')
];

const bulkPromoteSchema = [
  body('studentIds').isArray({ min: 1 }).withMessage('studentIds must be a non-empty array'),
  body('targetClass').notEmpty().withMessage('targetClass is required'),
  body('targetSection').notEmpty().withMessage('targetSection is required')
];

const transferSchema = [
  param('id').isMongoId().withMessage('Invalid student ID format'),
  body('reason').notEmpty().withMessage('Transfer reason is required')
];

module.exports = {
  createAdmissionSchema,
  bulkDeleteSchema,
  bulkPromoteSchema,
  transferSchema
};
