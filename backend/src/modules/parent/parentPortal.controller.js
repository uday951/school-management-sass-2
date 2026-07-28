const Parent = require('./parent.model');
const ParentStudentMapping = require('./models/parent-student-mapping.model');
const Student = require('../student/models/student.model');
const StudentFee = require('../fees/models/student-fee.model');
const Payment = require('../fees/models/payment.model');
const Receipt = require('../fees/models/receipt.model');
const TransportFee = require('../transport/models/transport-fee.model');
const Announcement = require('../communication/models/announcement.model');
const Notice = require('../communication/models/notice.model');
const Notification = require('../communication/models/notification.model');
const ChatMessage = require('../communication/models/chat-message.model');
const User = require('../user/user.model');
const Teacher = require('../teacher/models/teacher.model');

const asyncHandler = require('../../utils/asyncHandler.util');
const ApiError = require('../../utils/apiError.util');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');

class ParentPortalController {
  // Helper to get active parent record matching authenticated user
  async getParentRecord(req) {
    const parentId = req.user?.id;
    if (!parentId) throw ApiError.unauthorized('Parent ID not found in session.');
    const parent = await Parent.findById(parentId).lean();
    if (!parent) throw ApiError.notFound('Parent profile not found.');
    return parent;
  }

  // GET /api/v1/parent/students
  getLinkedStudents = asyncHandler(async (req, res) => {
    const parent = await this.getParentRecord(req);
    const mappings = await ParentStudentMapping.find({ parentId: parent._id })
      .populate('studentId')
      .lean();
    const students = mappings.map(m => m.studentId).filter(Boolean);
    return sendSuccess(res, 'Linked student profiles retrieved.', students);
  });

  // GET /api/v1/parent/fees
  getFees = asyncHandler(async (req, res) => {
    const parent = await this.getParentRecord(req);
    const { studentId } = req.query;
    if (!studentId) throw ApiError.badRequest('Student ID query parameter is required.');

    // Authorize student is linked to parent
    const isMapped = await ParentStudentMapping.findOne({ parentId: parent._id, studentId });
    if (!isMapped) throw ApiError.forbidden('Access denied. This student is not linked to your profile.');

    // Fetch Student Fees
    const fees = await StudentFee.find({ studentId, isDeleted: false })
      .populate({
        path: 'feeStructureId',
        populate: { path: 'category' }
      })
      .populate('discountId')
      .populate('scholarshipId')
      .lean();

    // Summarize standard stats
    let amount = 0;
    let discountAmount = 0;
    let scholarshipAmount = 0;
    let fineAmount = 0;
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;

    const timeline = [];
    const scholarships = [];
    const discounts = [];

    fees.forEach(f => {
      amount += f.amount || 0;
      discountAmount += f.discountAmount || 0;
      scholarshipAmount += f.scholarshipAmount || 0;
      fineAmount += f.fineAmount || 0;
      totalAmount += f.totalAmount || 0;
      paidAmount += f.paidAmount || 0;
      pendingAmount += f.pendingAmount || 0;

      // Add to timeline
      timeline.push({
        feeId: f._id,
        category: f.feeStructureId?.category?.name || 'School Fee',
        amount: f.totalAmount,
        paidAmount: f.paidAmount,
        pendingAmount: f.pendingAmount,
        dueDate: f.feeStructureId?.dueDate || f.createdAt,
        status: f.status
      });

      // Add unique scholarships/discounts
      if (f.scholarshipId) {
        scholarships.push({
          _id: f.scholarshipId._id,
          name: f.scholarshipId.name,
          amount: f.scholarshipAmount,
          percentage: f.scholarshipId.percentage || 0,
          status: 'applied',
          appliedDate: f.createdAt
        });
      }
      if (f.discountId) {
        discounts.push({
          _id: f.discountId._id,
          name: f.discountId.name,
          amount: f.discountAmount,
          reason: f.discountId.description || 'Institutional Discount',
          validity: 'active',
          status: 'applied'
        });
      }
    });

    // Sort timeline by dueDate
    timeline.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Fetch Transport Fees
    const transportFee = await TransportFee.findOne({ studentId, isDeleted: false }).lean();
    const transportFeeAmt = transportFee ? (transportFee.yearlyFee || transportFee.monthlyFee * 12 || 0) : 0;

    return sendSuccess(res, 'Fee details retrieved successfully.', {
      stats: {
        totalFees: totalAmount,
        paidFees: paidAmount,
        pendingFees: pendingAmount,
        transportFees: transportFeeAmt,
        scholarshipAmount,
        discountAmount,
        outstandingBalance: pendingAmount
      },
      timeline,
      scholarships,
      discounts
    });
  });

  // GET /api/v1/parent/payments
  getPayments = asyncHandler(async (req, res) => {
    const parent = await this.getParentRecord(req);
    const { studentId, search = '', status = '', page = 1, limit = 10, sortBy = 'paymentDate', sortOrder = 'desc' } = req.query;
    if (!studentId) throw ApiError.badRequest('Student ID is required.');

    // Verify student link
    const isMapped = await ParentStudentMapping.findOne({ parentId: parent._id, studentId });
    if (!isMapped) throw ApiError.forbidden('Access denied.');

    // Fetch student's fee mappings
    const studentFees = await StudentFee.find({ studentId, isDeleted: false }).lean();
    const feeIds = studentFees.map(f => f._id);

    // Query Payments
    const query = { studentFeeId: { $in: feeIds } };
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { method: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: 'studentFeeId',
        populate: { path: 'feeStructureId', populate: { path: 'category' } }
      })
      .lean();

    return sendPaginated(res, 'Payment history retrieved successfully.', payments, {
      totalRecords: total,
      currentPage: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  });

  // GET /api/v1/parent/receipts
  getReceipts = asyncHandler(async (req, res) => {
    const parent = await this.getParentRecord(req);
    const { studentId } = req.query;
    if (!studentId) throw ApiError.badRequest('Student ID is required.');

    const isMapped = await ParentStudentMapping.findOne({ parentId: parent._id, studentId });
    if (!isMapped) throw ApiError.forbidden('Access denied.');

    const receipts = await Receipt.find({ studentId })
      .populate({
        path: 'paymentId',
        populate: {
          path: 'studentFeeId',
          populate: { path: 'feeStructureId', populate: { path: 'category' } }
        }
      })
      .populate('studentId')
      .sort({ issueDate: -1 })
      .lean();

    return sendSuccess(res, 'Receipts retrieved successfully.', receipts);
  });

  // GET /api/v1/parent/receipts/:id/pdf
  getReceiptPdf = asyncHandler(async (req, res) => {
    const parent = await this.getParentRecord(req);
    const receipt = await Receipt.findById(req.params.id)
      .populate({
        path: 'paymentId',
        populate: {
          path: 'studentFeeId',
          populate: { path: 'feeStructureId', populate: { path: 'category' } }
        }
      })
      .populate('studentId')
      .lean();

    if (!receipt) throw ApiError.notFound('Receipt not found.');

    // Verify access
    const isMapped = await ParentStudentMapping.findOne({ parentId: parent._id, studentId: receipt.studentId._id });
    if (!isMapped) throw ApiError.forbidden('Access denied.');

    // Generate a simple, printable HTML invoice page
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receipt.receiptNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #1e3a8a; }
          .meta-info { margin: 20px 0; display: flex; justify-content: space-between; font-size: 14px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { bg-color: #f3f4f6; font-weight: bold; }
          .total-row { font-weight: bold; bg-color: #f9fafb; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #6b7280; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 20px; font-weight: bold; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Receipt</button>
        </div>
        <div class="header">
          <div class="title">OFFICIAL FEES RECEIPT</div>
          <div style="font-size: 14px; margin-top: 5px;">School Management ERP Inc.</div>
        </div>
        <div class="meta-info">
          <div>
            <strong>Receipt No:</strong> ${receipt.receiptNumber}<br/>
            <strong>Date Issued:</strong> ${new Date(receipt.issueDate).toLocaleDateString()}<br/>
            <strong>Transaction ID:</strong> ${receipt.paymentId?.transactionId || 'N/A'}
          </div>
          <div style="text-align: right;">
            <strong>Student Name:</strong> ${receipt.studentId?.firstName} ${receipt.studentId?.lastName}<br/>
            <strong>Admission No:</strong> ${receipt.studentId?.admissionNo}<br/>
            <strong>Class:</strong> ${receipt.studentId?.class} - ${receipt.studentId?.section}
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Fee Particulars</th>
              <th>Payment Method</th>
              <th style="text-align: right;">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${receipt.paymentId?.studentFeeId?.feeStructureId?.category?.name || 'Term Fees'}</td>
              <td style="text-transform: uppercase;">${receipt.paymentId?.method || 'Cash'}</td>
              <td style="text-align: right;">$${receipt.paymentId?.amount || 0}</td>
            </tr>
            <tr class="total-row">
              <td colspan="2">Total Received</td>
              <td style="text-align: right;">$${receipt.paymentId?.amount || 0}</td>
            </tr>
          </tbody>
        </table>
        <div class="footer">
          <p>Thank you for your payment. This is a computer-generated receipt and requires no signature.</p>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlContent);
  });

  // GET /api/v1/parent/announcements
  getAnnouncements = asyncHandler(async (req, res) => {
    const parent = await this.getParentRecord(req);
    const announcements = await Announcement.find({
      targetAudience: { $in: ['parent', 'all'] },
      status: 'published',
      isDeleted: false
    })
      .sort({ publishDate: -1 })
      .lean();

    return sendSuccess(res, 'Announcements retrieved successfully.', announcements);
  });

  // GET /api/v1/parent/circulars
  getCirculars = asyncHandler(async (req, res) => {
    const parent = await this.getParentRecord(req);
    const circulars = await Notice.find({
      visibility: 'public',
      isDeleted: false
    })
      .sort({ publishDate: -1 })
      .lean();

    return sendSuccess(res, 'Circulars/Notices retrieved successfully.', circulars);
  });

  // GET /api/v1/parent/notifications
  getNotifications = asyncHandler(async (req, res) => {
    const parent = await this.getParentRecord(req);
    const { status, page = 1, limit = 20 } = req.query;

    const query = {
      recipientId: parent._id,
      recipientRole: 'parent',
      isDeleted: false
    };

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    return sendPaginated(res, 'Notifications retrieved successfully.', notifications, {
      totalRecords: total,
      currentPage: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  });

  // PATCH /api/v1/parent/notifications/:id/read
  markNotificationRead = asyncHandler(async (req, res) => {
    const parent = await this.getParentRecord(req);
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: parent._id, recipientRole: 'parent' },
      { $set: { status: 'read', readTime: new Date() } },
      { new: true }
    );

    if (!notification) throw ApiError.notFound('Notification not found or access denied.');
    return sendSuccess(res, 'Notification marked as read.', notification);
  });

  // GET /api/v1/parent/chat/teachers
  getTeachersList = asyncHandler(async (req, res) => {
    await this.getParentRecord(req);
    // Find all users who are teachers
    const teachers = await User.find({ role: 'teacher', status: 'active', isDeleted: false })
      .select('name email mobile department designation')
      .lean();

    return sendSuccess(res, 'Teachers list retrieved.', teachers);
  });

  // GET /api/v1/parent/chat/messages/:teacherId
  getChatHistory = asyncHandler(async (req, res) => {
    const parent = await this.getParentRecord(req);
    const { teacherId } = req.params;

    const messages = await ChatMessage.find({
      $or: [
        { senderId: parent._id, receiverId: teacherId },
        { senderId: teacherId, receiverId: parent._id }
      ],
      isDeleted: false
    })
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages sent by teacher to parent as read
    await ChatMessage.updateMany(
      { senderId: teacherId, receiverId: parent._id, status: 'unread' },
      { $set: { status: 'read' } }
    );

    return sendSuccess(res, 'Chat history retrieved.', messages);
  });

  // POST /api/v1/parent/chat
  sendMessage = asyncHandler(async (req, res) => {
    const parent = await this.getParentRecord(req);
    const { receiverId, message } = req.body;

    if (!receiverId) throw ApiError.badRequest('Receiver ID is required.');
    if (!message || !message.trim()) throw ApiError.badRequest('Message content is required.');

    // Verify receiver is indeed a teacher user
    const teacherUser = await User.findOne({ _id: receiverId, role: 'teacher' });
    if (!teacherUser) throw ApiError.notFound('Teacher user not found.');

    const newMsg = await ChatMessage.create({
      tenantId: parent.tenantId || 'default_school',
      senderId: parent._id,
      senderRole: 'parent',
      receiverId,
      receiverRole: 'teacher',
      message: message.trim()
    });

    return sendCreated(res, 'Message sent successfully.', newMsg);
  });
}

module.exports = new ParentPortalController();
