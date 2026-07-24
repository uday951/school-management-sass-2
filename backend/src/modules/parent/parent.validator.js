const { body, param } = require('express-validator');

const createParentSchema = [
  body('name').trim().notEmpty().withMessage('Parent full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email address format'),
  body('relationship').optional({ values: 'falsy' }).trim(),
  body('altPhone').optional({ values: 'falsy' }).trim(),
  body('address').optional({ values: 'falsy' }).trim(),
  body('city').optional({ values: 'falsy' }).trim(),
  body('state').optional({ values: 'falsy' }).trim(),
  body('country').optional({ values: 'falsy' }).trim(),
  body('occupation').optional({ values: 'falsy' }).trim()
];

const updateParentSchema = [
  param('id').notEmpty().withMessage('Parent ID parameter is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email address format')
];

const linkStudentSchema = [
  param('id').notEmpty().withMessage('Parent ID parameter is required'),
  body('studentId').notEmpty().withMessage('studentId is required to link student'),
  body('relationship').optional().trim()
];

const addDocumentSchema = [
  param('id').notEmpty().withMessage('Parent ID parameter is required'),
  body('documentName').optional({ values: 'falsy' }).trim()
];

const addCommunicationSchema = [
  param('id').notEmpty().withMessage('Parent ID parameter is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
];

module.exports = {
  createParentSchema,
  updateParentSchema,
  linkStudentSchema,
  addDocumentSchema,
  addCommunicationSchema
};
