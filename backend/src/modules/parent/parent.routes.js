const express = require('express');
const parentController = require('./parent.controller');
const {
  createParentSchema,
  updateParentSchema,
  linkStudentSchema,
  addDocumentSchema,
  addCommunicationSchema
} = require('./parent.validator');
const { validate } = require('../../middlewares/validation.middleware');
const { uploadDocument, handleMulterError } = require('../../middlewares/upload.middleware');

const router = express.Router();

// Parent Portal Dedicated Feature Endpoints (Defined before /:id to avoid route collision)
router.get('/dashboard', parentController.getDashboard);
router.get('/children', parentController.getChildren);
router.get('/child/:id', parentController.getChildProfile);
router.get('/attendance-summary', parentController.getAttendanceSummary);
router.get('/timetable', parentController.getTimetable);
router.get('/calendar', parentController.getCalendar);

// Parent CRUD & Bulk Import
router.get('/', parentController.getParents);
router.post('/', createParentSchema, validate, parentController.createParent);
router.post('/import', parentController.importParents);
router.get('/:id', parentController.getParentById);
router.put('/:id', updateParentSchema, validate, parentController.updateParent);
router.delete('/:id', parentController.deleteParent);

// Student Linking
router.get('/:id/students', parentController.getLinkedStudents);
router.post('/:id/link-student', linkStudentSchema, validate, parentController.linkStudent);
router.delete('/:id/unlink-student/:studentId', parentController.unlinkStudent);

// Guardians / Emergency Contacts
router.get('/:id/guardians', parentController.getGuardians);
router.post('/:id/guardians', parentController.addGuardian);

// Parent Documents
router.get('/:id/documents', parentController.getDocuments);
router.post(
  '/:id/documents',
  uploadDocument.single('document'),
  handleMulterError,
  addDocumentSchema,
  validate,
  parentController.uploadDocument
);
router.delete('/:id/documents/:docId', parentController.deleteDocument);

// Communication History
router.get('/:id/communications', parentController.getCommunications);
router.post('/:id/communications', addCommunicationSchema, validate, parentController.addCommunication);

module.exports = router;
