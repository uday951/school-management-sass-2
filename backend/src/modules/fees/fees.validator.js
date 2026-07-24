const { body } = require('express-validator');

const createCategorySchema = [
  body('name').trim().notEmpty().withMessage('Category Name is required.')
];

const createStructureSchema = [
  body('academicYear').trim().notEmpty().withMessage('Academic year is required.'),
  body('class').trim().notEmpty().withMessage('Class name is required.'),
  body('category').isMongoId().withMessage('Valid category reference is required.'),
  body('amount').isNumeric().withMessage('Amount must be a numeric value.'),
  body('dueDate').isISO8601().withMessage('Valid ISO due date is required.')
];

const collectPaymentSchema = [
  body('studentFeeId').isMongoId().withMessage('Valid Student Fee reference is required.'),
  body('amount').isNumeric().withMessage('Amount must be a numeric value.'),
  body('method').isIn(['cash', 'upi', 'card', 'bank_transfer']).withMessage('Invalid payment method.')
];

const createScholarshipSchema = [
  body('name').trim().notEmpty().withMessage('Scholarship Name is required.'),
  body('amount').optional().isNumeric().withMessage('Amount must be numeric.'),
  body('percentage').optional().isNumeric().withMessage('Percentage must be numeric.')
];

const createDiscountSchema = [
  body('name').trim().notEmpty().withMessage('Discount Name is required.'),
  body('percentage').optional().isNumeric().withMessage('Percentage must be numeric.'),
  body('fixedAmount').optional().isNumeric().withMessage('Fixed Amount must be numeric.')
];

const createFineSchema = [
  body('name').trim().notEmpty().withMessage('Fine Rule Name is required.'),
  body('lateFee').isNumeric().withMessage('Late fee must be a numeric value.')
];

module.exports = {
  createCategorySchema,
  createStructureSchema,
  collectPaymentSchema,
  createScholarshipSchema,
  createDiscountSchema,
  createFineSchema
};
