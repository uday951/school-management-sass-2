const feesService = require('./fees.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated } = require('../../utils/response.util');

class FeesController {
  // ─── Fee Categories ───────────────────────────────────────────────────────
  getCategories = asyncHandler(async (req, res) => {
    const list = await feesService.getCategories(req.query);
    return sendSuccess(res, 'Fee categories fetched successfully.', list);
  });

  createCategory = asyncHandler(async (req, res) => {
    const category = await feesService.createCategory(req.body);
    return sendCreated(res, 'Fee category created successfully.', category);
  });

  updateCategory = asyncHandler(async (req, res) => {
    const category = await feesService.updateCategory(req.params.id, req.body);
    return sendSuccess(res, 'Fee category updated successfully.', category);
  });

  deleteCategory = asyncHandler(async (req, res) => {
    const category = await feesService.deleteCategory(req.params.id);
    return sendSuccess(res, 'Fee category soft-deleted successfully.', category);
  });

  // ─── Fee Structure ────────────────────────────────────────────────────────
  getStructures = asyncHandler(async (req, res) => {
    const list = await feesService.getStructures(req.query);
    return sendSuccess(res, 'Fee structures fetched successfully.', list);
  });

  createStructure = asyncHandler(async (req, res) => {
    const structure = await feesService.createStructure(req.body);
    return sendCreated(res, 'Fee structure created successfully.', structure);
  });

  updateStructure = asyncHandler(async (req, res) => {
    const structure = await feesService.updateStructure(req.params.id, req.body);
    return sendSuccess(res, 'Fee structure updated successfully.', structure);
  });

  deleteStructure = asyncHandler(async (req, res) => {
    const structure = await feesService.deleteStructure(req.params.id);
    return sendSuccess(res, 'Fee structure soft-deleted successfully.', structure);
  });

  // ─── Student Fees ─────────────────────────────────────────────────────────
  getStudentFees = asyncHandler(async (req, res) => {
    const list = await feesService.getStudentFees(req.query);
    return sendSuccess(res, 'Student fees fetched successfully.', list);
  });

  getStudentFeeById = asyncHandler(async (req, res) => {
    const fee = await feesService.getStudentFeeById(req.params.id);
    return sendSuccess(res, 'Student fee record fetched.', fee);
  });

  // ─── Fee Collection & Payments ────────────────────────────────────────────
  collectPayment = asyncHandler(async (req, res) => {
    const receipt = await feesService.collectPayment(req.body);
    return sendCreated(res, 'Payment collected and receipt generated successfully.', receipt);
  });

  getPaymentHistory = asyncHandler(async (req, res) => {
    const history = await feesService.getPaymentHistory(req.query);
    return sendSuccess(res, 'Payment transactions ledger retrieved.', history);
  });

  // ─── Receipts ─────────────────────────────────────────────────────────────
  getReceipts = asyncHandler(async (req, res) => {
    const list = await feesService.getReceipts(req.query);
    return sendSuccess(res, 'Receipts records list fetched.', list);
  });

  getReceiptById = asyncHandler(async (req, res) => {
    const receipt = await feesService.getReceiptById(req.params.id);
    return sendSuccess(res, 'Receipt details fetched.', receipt);
  });

  // ─── Scholarships ─────────────────────────────────────────────────────────
  getScholarships = asyncHandler(async (req, res) => {
    const list = await feesService.getScholarships(req.query);
    return sendSuccess(res, 'Scholarships criteria list fetched.', list);
  });

  createScholarship = asyncHandler(async (req, res) => {
    const schol = await feesService.createScholarship(req.body);
    return sendCreated(res, 'Scholarship rule created.', schol);
  });

  updateScholarship = asyncHandler(async (req, res) => {
    const schol = await feesService.updateScholarship(req.params.id, req.body);
    return sendSuccess(res, 'Scholarship updated successfully.', schol);
  });

  deleteScholarship = asyncHandler(async (req, res) => {
    const schol = await feesService.deleteScholarship(req.params.id);
    return sendSuccess(res, 'Scholarship soft-deleted.', schol);
  });

  // ─── Discounts ────────────────────────────────────────────────────────────
  getDiscounts = asyncHandler(async (req, res) => {
    const list = await feesService.getDiscounts(req.query);
    return sendSuccess(res, 'Discounts criteria list fetched.', list);
  });

  createDiscount = asyncHandler(async (req, res) => {
    const disc = await feesService.createDiscount(req.body);
    return sendCreated(res, 'Discount criteria created.', disc);
  });

  updateDiscount = asyncHandler(async (req, res) => {
    const disc = await feesService.updateDiscount(req.params.id, req.body);
    return sendSuccess(res, 'Discount updated successfully.', disc);
  });

  deleteDiscount = asyncHandler(async (req, res) => {
    const disc = await feesService.deleteDiscount(req.params.id);
    return sendSuccess(res, 'Discount soft-deleted.', disc);
  });

  // ─── Fines ────────────────────────────────────────────────────────────────
  getFines = asyncHandler(async (req, res) => {
    const list = await feesService.getFines(req.query);
    return sendSuccess(res, 'Fine rules list fetched.', list);
  });

  createFine = asyncHandler(async (req, res) => {
    const fine = await feesService.createFine(req.body);
    return sendCreated(res, 'Fine rule successfully created.', fine);
  });

  updateFine = asyncHandler(async (req, res) => {
    const fine = await feesService.updateFine(req.params.id, req.body);
    return sendSuccess(res, 'Fine rule updated successfully.', fine);
  });

  deleteFine = asyncHandler(async (req, res) => {
    const fine = await feesService.deleteFine(req.params.id);
    return sendSuccess(res, 'Fine rule soft-deleted.', fine);
  });

  // ─── Due Reports ──────────────────────────────────────────────────────────
  getDueReports = asyncHandler(async (req, res) => {
    const report = await feesService.getDueReports();
    return sendSuccess(res, 'Fees due report generated successfully.', report);
  });
}

module.exports = new FeesController();
