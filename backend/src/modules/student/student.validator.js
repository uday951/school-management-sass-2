const { body, param, query } = require('express-validator');

const createAdmissionSchema = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('studentClass').optional().trim(),
  body('section').optional().trim(),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender value'),
  body('phone').optional().trim(),
  body('email').optional().isEmail().withMessage('Invalid email address')
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
