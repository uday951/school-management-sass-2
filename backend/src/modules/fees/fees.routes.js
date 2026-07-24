const express = require('express');
const feesController = require('./fees.controller');
const { 
  createCategorySchema, 
  createStructureSchema, 
  collectPaymentSchema,
  createScholarshipSchema,
  createDiscountSchema,
  createFineSchema
} = require('./fees.validator');
const { validate } = require('../../middlewares/validation.middleware');

const router = express.Router();

// ─── Fee Categories ───────────────────────────────────────────────────────
router.get('/categories', feesController.getCategories);
router.post('/categories', createCategorySchema, validate, feesController.createCategory);
router.put('/categories/:id', feesController.updateCategory);
router.delete('/categories/:id', feesController.deleteCategory);

// ─── Fee Structure ────────────────────────────────────────────────────────
router.get('/structures', feesController.getStructures);
router.post('/structures', createStructureSchema, validate, feesController.createStructure);
router.put('/structures/:id', feesController.updateStructure);
router.delete('/structures/:id', feesController.deleteStructure);

// ─── Student Fees ─────────────────────────────────────────────────────────
router.get('/student-fees', feesController.getStudentFees);
router.get('/student-fees/:id', feesController.getStudentFeeById);

// ─── Fee Collection & Payments ────────────────────────────────────────────
router.post('/payments', collectPaymentSchema, validate, feesController.collectPayment);
router.get('/payments/history', feesController.getPaymentHistory);

// ─── Receipts ─────────────────────────────────────────────────────────────
router.get('/receipts', feesController.getReceipts);
router.get('/receipts/:id', feesController.getReceiptById);

// ─── Scholarships ─────────────────────────────────────────────────────────
router.get('/scholarships', feesController.getScholarships);
router.post('/scholarships', createScholarshipSchema, validate, feesController.createScholarship);
router.put('/scholarships/:id', feesController.updateScholarship);
router.delete('/scholarships/:id', feesController.deleteScholarship);

// ─── Discounts ────────────────────────────────────────────────────────────
router.get('/discounts', feesController.getDiscounts);
router.post('/discounts', createDiscountSchema, validate, feesController.createDiscount);
router.put('/discounts/:id', feesController.updateDiscount);
router.delete('/discounts/:id', feesController.deleteDiscount);

// ─── Fines ────────────────────────────────────────────────────────────────
router.get('/fines', feesController.getFines);
router.post('/fines', createFineSchema, validate, feesController.createFine);
router.put('/fines/:id', feesController.updateFine);
router.delete('/fines/:id', feesController.deleteFine);

// ─── Due Reports ──────────────────────────────────────────────────────────
router.get('/reports', feesController.getDueReports);

module.exports = router;
