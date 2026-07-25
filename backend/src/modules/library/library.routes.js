const express = require('express');

const { optionalAuthenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { uploadImage, handleMulterError } = require('../../middlewares/upload.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const ROLES = require('../../constants/roles');

const libraryController = require('./library.controller');

const {
  createCategoryRules,
  updateCategoryRules,
  createBookRules,
  updateBookRules,
  createAuthorRules,
  updateAuthorRules,
  createPublisherRules,
  updatePublisherRules,
  createBookIssueRules,
  createBookReturnRules,
  createReservationRules,
  createFineRules
} = require('./library.validator');

const router = express.Router();

// ─── DASHBOARD ROUTE ─────────────────────────────────────────────────────────

router.get(
  '/library/dashboard',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT),
  libraryController.getDashboardData
);

// ─── CATEGORY ROUTES ─────────────────────────────────────────────────────────

router.get(
  '/categories',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT),
  libraryController.getCategories
);

router.post(
  '/categories',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createCategoryRules,
  validate,
  libraryController.createCategory
);

router.put(
  '/categories/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateCategoryRules,
  validate,
  libraryController.updateCategory
);

router.delete(
  '/categories/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  libraryController.deleteCategory
);

// ─── BOOK ROUTES ─────────────────────────────────────────────────────────────

router.get(
  '/books',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT),
  libraryController.getBooks
);

router.post(
  '/books',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  uploadImage.single('cover'),
  handleMulterError,
  createBookRules,
  validate,
  libraryController.createBook
);

router.put(
  '/books/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  uploadImage.single('cover'),
  handleMulterError,
  updateBookRules,
  validate,
  libraryController.updateBook
);

router.delete(
  '/books/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  libraryController.deleteBook
);

// ─── AUTHOR ROUTES ───────────────────────────────────────────────────────────

router.get(
  '/authors',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT),
  libraryController.getAuthors
);

router.post(
  '/authors',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createAuthorRules,
  validate,
  libraryController.createAuthor
);

router.put(
  '/authors/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateAuthorRules,
  validate,
  libraryController.updateAuthor
);

router.delete(
  '/authors/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  libraryController.deleteAuthor
);

// ─── PUBLISHER ROUTES ────────────────────────────────────────────────────────

router.get(
  '/publishers',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT),
  libraryController.getPublishers
);

router.post(
  '/publishers',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createPublisherRules,
  validate,
  libraryController.createPublisher
);

router.put(
  '/publishers/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updatePublisherRules,
  validate,
  libraryController.updatePublisher
);

router.delete(
  '/publishers/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  libraryController.deletePublisher
);

// ─── BOOK ISSUE ROUTES ───────────────────────────────────────────────────────

router.get(
  '/book-issues',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT),
  libraryController.getBookIssues
);

router.post(
  '/book-issues',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createBookIssueRules,
  validate,
  libraryController.createBookIssue
);

// ─── BOOK RETURN ROUTES ──────────────────────────────────────────────────────

router.get(
  '/book-returns',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT),
  libraryController.getBookReturns
);

router.post(
  '/book-returns',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createBookReturnRules,
  validate,
  libraryController.createBookReturn
);

// ─── RESERVATION ROUTES ──────────────────────────────────────────────────────

router.get(
  '/reservations',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT),
  libraryController.getReservations
);

router.post(
  '/reservations',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createReservationRules,
  validate,
  libraryController.createReservation
);

router.put(
  '/reservations/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  libraryController.updateReservation
);

router.delete(
  '/reservations/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  libraryController.deleteReservation
);

// ─── FINE ROUTES ─────────────────────────────────────────────────────────────

router.get(
  '/fines',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER),
  libraryController.getFines
);

router.put(
  '/fines/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  libraryController.updateFineStatus
);

// ─── LIBRARY REPORTS ROUTE ───────────────────────────────────────────────────

router.get(
  '/library-reports',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER),
  libraryController.getLibraryReports
);

module.exports = router;
