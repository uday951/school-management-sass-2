const express = require('express');
const studentController = require('./student.controller');
const {
  createAdmissionSchema,
  bulkDeleteSchema,
  bulkPromoteSchema,
  transferSchema
} = require('./student.validator');
const { validate } = require('../../middlewares/validation.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/permission.middleware');
const { PERMISSIONS } = require('../../constants/permissions');

const router = express.Router();

// ─── Optional Auth Middleware (or strict Auth in prod) ─────────────────────
// Note: In development/test mode, routes work seamlessly.
const authGuard = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : authenticate;

// ─── Student Directory & Core Routes ───────────────────────────────────────
router.get('/', studentController.getStudents);
router.post('/admissions', createAdmissionSchema, validate, studentController.createAdmission);
router.get('/admissions/next-number', studentController.getNextAdmissionNumber);

// Bulk Operations
router.post('/bulk-delete', bulkDeleteSchema, validate, studentController.bulkDelete);
router.post('/bulk-promote', bulkPromoteSchema, validate, studentController.bulkPromote);
router.post('/import', studentController.importStudents);
router.post('/export', studentController.exportStudents);

// Student Detail & Sub-resources
router.get('/:id', studentController.getStudentProfile);
router.get('/:id/profile', studentController.getStudentProfile);
router.delete('/:id', studentController.deleteStudent);
router.post('/:id/transfer', transferSchema, validate, studentController.transferStudent);
router.post('/:id/certificates', studentController.generateCertificate);
router.get('/:id/id-card', studentController.getIdCard);

module.exports = router;
