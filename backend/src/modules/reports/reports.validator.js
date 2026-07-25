const { body } = require('express-validator');

const createTemplateSchema = [
  body('name').trim().notEmpty().withMessage('Template name is required.'),
  body('category').trim().notEmpty().withMessage('Report category is required.'),
  body('columns').isArray({ min: 1 }).withMessage('Columns array with at least 1 column is required.')
];

const runCustomReportSchema = [
  body('category').trim().notEmpty().withMessage('Report category is required.'),
  body('columns').isArray({ min: 1 }).withMessage('Columns array with at least 1 column is required.')
];

module.exports = {
  createTemplateSchema,
  runCustomReportSchema
};
