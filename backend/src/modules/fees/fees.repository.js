const FeeCategory = require('./models/fee-category.model');
const FeeStructure = require('./models/fee-structure.model');
const StudentFee = require('./models/student-fee.model');
const Payment = require('./models/payment.model');
const Receipt = require('./models/receipt.model');
const Scholarship = require('./models/scholarship.model');
const Discount = require('./models/discount.model');
const Fine = require('./models/fine.model');
const Student = require('../student/models/student.model');

class FeesRepository {
  // ─── Fee Categories ───────────────────────────────────────────────────────
  async findCategories(filter = {}) {
    return FeeCategory.find({ isDeleted: false, ...filter }).lean();
  }

  async findCategoryById(id) {
    return FeeCategory.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createCategory(data) {
    return FeeCategory.create(data);
  }

  async updateCategory(id, data) {
    return FeeCategory.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteCategory(id) {
    return FeeCategory.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Fee Structure ────────────────────────────────────────────────────────
  async findStructures(filter = {}) {
    return FeeStructure.find({ isDeleted: false, ...filter }).populate('category').lean();
  }

  async findStructureById(id) {
    return FeeStructure.findOne({ _id: id, isDeleted: false }).populate('category').lean();
  }

  async createStructure(data) {
    return FeeStructure.create(data);
  }

  async updateStructure(id, data) {
    return FeeStructure.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteStructure(id) {
    return FeeStructure.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Student Fees ─────────────────────────────────────────────────────────
  async findStudentFees(filter = {}) {
    return StudentFee.find({ isDeleted: false, ...filter })
      .populate('studentId')
      .populate({
        path: 'feeStructureId',
        populate: { path: 'category' }
      })
      .populate('discountId')
      .populate('scholarshipId')
      .lean();
  }

  async findStudentFeeById(id) {
    return StudentFee.findOne({ _id: id, isDeleted: false })
      .populate('studentId')
      .populate({
        path: 'feeStructureId',
        populate: { path: 'category' }
      })
      .populate('discountId')
      .populate('scholarshipId')
      .lean();
  }

  async createStudentFee(data) {
    return StudentFee.create(data);
  }

  async updateStudentFee(id, data) {
    return StudentFee.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  // ─── Payments ─────────────────────────────────────────────────────────────
  async findPayments(filter = {}) {
    return Payment.find(filter)
      .populate({
        path: 'studentFeeId',
        populate: { path: 'studentId' }
      })
      .sort({ paymentDate: -1 })
      .lean();
  }

  async findPaymentById(id) {
    return Payment.findById(id)
      .populate({
        path: 'studentFeeId',
        populate: { path: 'studentId' }
      })
      .lean();
  }

  async createPayment(data) {
    return Payment.create(data);
  }

  // ─── Receipts ─────────────────────────────────────────────────────────────
  async findReceipts(filter = {}) {
    return Receipt.find(filter)
      .populate('studentId')
      .populate({
        path: 'paymentId',
        populate: {
          path: 'studentFeeId',
          populate: { path: 'feeStructureId' }
        }
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findReceiptById(id) {
    return Receipt.findById(id)
      .populate('studentId')
      .populate({
        path: 'paymentId',
        populate: {
          path: 'studentFeeId',
          populate: { path: 'feeStructureId' }
        }
      })
      .lean();
  }

  async createReceipt(data) {
    return Receipt.create(data);
  }

  // ─── Scholarships ─────────────────────────────────────────────────────────
  async findScholarships(filter = {}) {
    return Scholarship.find({ isDeleted: false, ...filter }).lean();
  }

  async findScholarshipById(id) {
    return Scholarship.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createScholarship(data) {
    return Scholarship.create(data);
  }

  async updateScholarship(id, data) {
    return Scholarship.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteScholarship(id) {
    return Scholarship.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Discounts ────────────────────────────────────────────────────────────
  async findDiscounts(filter = {}) {
    return Discount.find({ isDeleted: false, ...filter }).lean();
  }

  async findDiscountById(id) {
    return Discount.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createDiscount(data) {
    return Discount.create(data);
  }

  async updateDiscount(id, data) {
    return Discount.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteDiscount(id) {
    return Discount.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Fines ────────────────────────────────────────────────────────────────
  async findFines(filter = {}) {
    return Fine.find({ isDeleted: false, ...filter }).lean();
  }

  async findFineById(id) {
    return Fine.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createFine(data) {
    return Fine.create(data);
  }

  async updateFine(id, data) {
    return Fine.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteFine(id) {
    return Fine.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // Helper: Find student by Id
  async findStudentById(id) {
    return Student.findById(id).lean();
  }

  // Helper: Find all students (for mapping or generating bills)
  async findAllStudents(filter = {}) {
    return Student.find({ isDeleted: false, ...filter }).lean();
  }
}

module.exports = new FeesRepository();
