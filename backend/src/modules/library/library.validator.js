const { body, param } = require('express-validator');

// Category Validators
const createCategoryRules = [
  body('categoryName').trim().notEmpty().withMessage('Category Name is required'),
  body('status').optional().isIn(['active', 'inactive'])
];

const updateCategoryRules = [
  param('id').isMongoId().withMessage('Invalid Category ID'),
  body('categoryName').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive'])
];

// Book Validators
const createBookRules = [
  body('isbn').trim().notEmpty().withMessage('ISBN is required'),
  body('title').trim().notEmpty().withMessage('Book Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('publisher').trim().notEmpty().withMessage('Publisher is required'),
  body('quantity').notEmpty().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const updateBookRules = [
  param('id').isMongoId().withMessage('Invalid Book ID'),
  body('isbn').optional().trim().notEmpty(),
  body('title').optional().trim().notEmpty(),
  body('quantity').optional().isInt({ min: 1 })
];

// Author Validators
const createAuthorRules = [
  body('name').trim().notEmpty().withMessage('Author Name is required')
];

const updateAuthorRules = [
  param('id').isMongoId().withMessage('Invalid Author ID'),
  body('name').optional().trim().notEmpty()
];

// Publisher Validators
const createPublisherRules = [
  body('publisherName').trim().notEmpty().withMessage('Publisher Name is required')
];

const updatePublisherRules = [
  param('id').isMongoId().withMessage('Invalid Publisher ID'),
  body('publisherName').optional().trim().notEmpty()
];

// Book Issue Validators
const createBookIssueRules = [
  body('member').trim().notEmpty().withMessage('Member Name is required'),
  body('book').trim().notEmpty().withMessage('Book Title is required'),
  body('isbn').trim().notEmpty().withMessage('ISBN is required'),
  body('issueDate').trim().notEmpty().withMessage('Issue Date is required'),
  body('dueDate').trim().notEmpty().withMessage('Due Date is required')
];

const updateBookIssueRules = [
  param('id').isMongoId().withMessage('Invalid Issue ID')
];

// Book Return Validators
const createBookReturnRules = [
  body('issueId').isMongoId().withMessage('Valid Issue ID is required'),
  body('returnDate').trim().notEmpty().withMessage('Return Date is required')
];

// Reservation Validators
const createReservationRules = [
  body('member').trim().notEmpty().withMessage('Member Name is required'),
  body('book').trim().notEmpty().withMessage('Book Title is required'),
  body('reservationDate').trim().notEmpty().withMessage('Reservation Date is required')
];

// Fine Validators
const createFineRules = [
  body('member').trim().notEmpty().withMessage('Member Name is required'),
  body('book').trim().notEmpty().withMessage('Book Title is required'),
  body('amount').notEmpty().isFloat({ min: 0 }).withMessage('Amount must be positive')
];

module.exports = {
  createCategoryRules,
  updateCategoryRules,
  createBookRules,
  updateBookRules,
  createAuthorRules,
  updateAuthorRules,
  createPublisherRules,
  updatePublisherRules,
  createBookIssueRules,
  updateBookIssueRules,
  createBookReturnRules,
  createReservationRules,
  createFineRules
};
