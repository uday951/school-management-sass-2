const feesRepository = require('./fees.repository');
const ApiError = require('../../utils/apiError.util');

class FeesService {
  // ─── Fee Categories ───────────────────────────────────────────────────────
  async getCategories(queryParams) {
    const filter = {};
    if (queryParams.isActive) filter.isActive = queryParams.isActive === 'true';
    return feesRepository.findCategories(filter);
  }

  async createCategory(payload) {
    const { name, description = '', isActive = true } = payload;
    if (!name) throw ApiError.badRequest('Category Name is required.');
    return feesRepository.createCategory({ name, description, isActive });
  }

  async updateCategory(id, payload) {
    const category = await feesRepository.findCategoryById(id);
    if (!category) throw ApiError.notFound('Category not found.');
    return feesRepository.updateCategory(id, payload);
  }

  async deleteCategory(id) {
    const category = await feesRepository.findCategoryById(id);
    if (!category) throw ApiError.notFound('Category not found.');
    return feesRepository.softDeleteCategory(id);
  }

  // ─── Fee Structure ────────────────────────────────────────────────────────
  async getStructures(queryParams) {
    const filter = {};
    if (queryParams.class) filter.class = queryParams.class;
    if (queryParams.academicYear) filter.academicYear = queryParams.academicYear;
    return feesRepository.findStructures(filter);
  }

  async createStructure(payload) {
    const { academicYear, class: className, category, amount, dueDate, lateFee = 0 } = payload;
    if (!academicYear || !className || !category || !amount || !dueDate) {
      throw ApiError.badRequest('Missing required fee structure fields.');
    }

    const structure = await feesRepository.createStructure({
      academicYear,
      class: className,
      category,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      lateFee: Number(lateFee)
    });

    // Auto-invoice assignment: Create StudentFee records for all students in this class
    const students = await feesRepository.findAllStudents({ class: className });
    for (const student of students) {
      await feesRepository.createStudentFee({
        studentId: student._id,
        feeStructureId: structure._id,
        amount: Number(amount),
        totalAmount: Number(amount),
        pendingAmount: Number(amount),
        status: 'unpaid'
      });
    }

    return structure;
  }

  async updateStructure(id, payload) {
    const structure = await feesRepository.findStructureById(id);
    if (!structure) throw ApiError.notFound('Fee structure not found.');
    return feesRepository.updateStructure(id, payload);
  }

  async deleteStructure(id) {
    const structure = await feesRepository.findStructureById(id);
    if (!structure) throw ApiError.notFound('Fee structure not found.');
    return feesRepository.softDeleteStructure(id);
  }

  // ─── Student Fees ─────────────────────────────────────────────────────────
  async getStudentFees(queryParams) {
    const filter = {};
    if (queryParams.studentId) filter.studentId = queryParams.studentId;
    if (queryParams.status) filter.status = queryParams.status;

    return feesRepository.findStudentFees(filter);
  }

  async getStudentFeeById(id) {
    const fee = await feesRepository.findStudentFeeById(id);
    if (!fee) throw ApiError.notFound('Student fee record not found.');
    return fee;
  }

  // ─── Fee Collection & Payments ────────────────────────────────────────────
  async collectPayment(payload) {
    const { studentFeeId, amount, method, transactionId = '', collectedBy = 'Admin' } = payload;
    if (!studentFeeId || !amount || !method) {
      throw ApiError.badRequest('Missing required payment fields.');
    }

    const studentFee = await feesRepository.findStudentFeeById(studentFeeId);
    if (!studentFee) throw ApiError.notFound('Student fee record not found.');

    const payAmount = Number(amount);
    if (payAmount <= 0) throw ApiError.badRequest('Payment amount must be greater than zero.');
    if (payAmount > studentFee.pendingAmount) {
      throw ApiError.badRequest(`Payment amount cannot exceed the pending balance of ${studentFee.pendingAmount}`);
    }

    // Save payment log
    const payment = await feesRepository.createPayment({
      studentFeeId,
      amount: payAmount,
      method,
      transactionId,
      collectedBy,
      status: 'success'
    });

    // Update student fee allocation balances
    const newPaidAmount = studentFee.paidAmount + payAmount;
    const newPendingAmount = studentFee.pendingAmount - payAmount;
    const newStatus = newPendingAmount === 0 ? 'paid' : 'partial';

    await feesRepository.updateStudentFee(studentFeeId, {
      paidAmount: newPaidAmount,
      pendingAmount: newPendingAmount,
      status: newStatus
    });

    // Generate printable receipt record
    const receiptNo = `REC-${Date.now()}`;
    const mongoose = require('mongoose');
    let targetStudentId = studentFee.studentId;
    if (!targetStudentId) {
      targetStudentId = new mongoose.Types.ObjectId();
    } else if (typeof targetStudentId === 'object' && targetStudentId._id) {
      targetStudentId = targetStudentId._id;
    }

    const receipt = await feesRepository.createReceipt({
      receiptNumber: receiptNo,
      paymentId: payment._id,
      studentId: targetStudentId,
      details: {
        method,
        collectedBy,
        date: new Date().toLocaleDateString()
      }
    });

    return { payment, receipt };
  }

  async getPaymentHistory(queryParams) {
    const filter = {};
    if (queryParams.studentFeeId) filter.studentFeeId = queryParams.studentFeeId;
    return feesRepository.findPayments(filter);
  }

  // ─── Receipts ─────────────────────────────────────────────────────────────
  async getReceipts(queryParams) {
    const filter = {};
    if (queryParams.studentId) filter.studentId = queryParams.studentId;
    return feesRepository.findReceipts(filter);
  }

  async getReceiptById(id) {
    const receipt = await feesRepository.findReceiptById(id);
    if (!receipt) throw ApiError.notFound('Receipt not found.');
    return receipt;
  }

  // ─── Scholarships ─────────────────────────────────────────────────────────
  async getScholarships(queryParams) {
    const filter = {};
    if (queryParams.isActive) filter.isActive = queryParams.isActive === 'true';
    return feesRepository.findScholarships(filter);
  }

  async createScholarship(payload) {
    const { name, eligibility = '', amount = 0, percentage = 0, isActive = true } = payload;
    if (!name) throw ApiError.badRequest('Scholarship Name is required.');
    return feesRepository.createScholarship({ name, eligibility, amount: Number(amount), percentage: Number(percentage), isActive });
  }

  async updateScholarship(id, payload) {
    const schol = await feesRepository.findScholarshipById(id);
    if (!schol) throw ApiError.notFound('Scholarship not found.');
    return feesRepository.updateScholarship(id, payload);
  }

  async deleteScholarship(id) {
    const schol = await feesRepository.findScholarshipById(id);
    if (!schol) throw ApiError.notFound('Scholarship not found.');
    return feesRepository.softDeleteScholarship(id);
  }

  // ─── Discounts ────────────────────────────────────────────────────────────
  async getDiscounts(queryParams) {
    const filter = {};
    if (queryParams.isActive) filter.isActive = queryParams.isActive === 'true';
    return feesRepository.findDiscounts(filter);
  }

  async createDiscount(payload) {
    const { name, percentage = 0, fixedAmount = 0, reason = '', isActive = true } = payload;
    if (!name) throw ApiError.badRequest('Discount Name is required.');
    return feesRepository.createDiscount({ name, percentage: Number(percentage), fixedAmount: Number(fixedAmount), reason, isActive });
  }

  async updateDiscount(id, payload) {
    const disc = await feesRepository.findDiscountById(id);
    if (!disc) throw ApiError.notFound('Discount not found.');
    return feesRepository.updateDiscount(id, payload);
  }

  async deleteDiscount(id) {
    const disc = await feesRepository.findDiscountById(id);
    if (!disc) throw ApiError.notFound('Discount not found.');
    return feesRepository.softDeleteDiscount(id);
  }

  // ─── Fines ────────────────────────────────────────────────────────────────
  async getFines(queryParams) {
    const filter = {};
    if (queryParams.isActive) filter.isActive = queryParams.isActive === 'true';
    return feesRepository.findFines(filter);
  }

  async createFine(payload) {
    const { name, fineRules = '', lateFee, gracePeriod = 0, penaltyAmount = 0 } = payload;
    if (!name || lateFee === undefined) throw ApiError.badRequest('Fine Name and Late Fee are required.');
    return feesRepository.createFine({ name, fineRules, lateFee: Number(lateFee), gracePeriod: Number(gracePeriod), penaltyAmount: Number(penaltyAmount) });
  }

  async updateFine(id, payload) {
    const fine = await feesRepository.findFineById(id);
    if (!fine) throw ApiError.notFound('Fine rule not found.');
    return feesRepository.updateFine(id, payload);
  }

  async deleteFine(id) {
    const fine = await feesRepository.findFineById(id);
    if (!fine) throw ApiError.notFound('Fine rule not found.');
    return feesRepository.softDeleteFine(id);
  }

  // ─── Due Reports ──────────────────────────────────────────────────────────
  async getDueReports() {
    const studentFees = await feesRepository.findStudentFees({});
    const payments = await feesRepository.findPayments({});

    const totalInvoiced = studentFees.reduce((acc, f) => acc + (f.totalAmount || f.amount), 0);
    const totalCollected = studentFees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const totalOutstanding = studentFees.reduce((acc, f) => acc + (f.pendingAmount || 0), 0);

    const pendingList = studentFees.filter(f => f.status !== 'paid').map(f => ({
      id: f._id,
      studentName: f.studentId ? `${f.studentId.firstName} ${f.studentId.lastName}`.trim() : 'Unknown Student',
      class: f.studentId ? f.studentId.class : 'N/A',
      feeCategory: f.feeStructureId?.category?.name || 'Other',
      dueAmount: f.pendingAmount,
      dueDate: f.feeStructureId?.dueDate || new Date()
    }));

    const collectionSummary = {
      cash: payments.filter(p => p.method === 'cash').reduce((acc, p) => acc + p.amount, 0),
      upi: payments.filter(p => p.method === 'upi').reduce((acc, p) => acc + p.amount, 0),
      card: payments.filter(p => p.method === 'card').reduce((acc, p) => acc + p.amount, 0),
      bank_transfer: payments.filter(p => p.method === 'bank_transfer').reduce((acc, p) => acc + p.amount, 0)
    };

    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      pendingList,
      collectionSummary
    };
  }
}

module.exports = new FeesService();
