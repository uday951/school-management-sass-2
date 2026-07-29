const mongoose = require('mongoose');
const Parent = require('./parent.model');
const ParentStudentMapping = require('./models/parent-student-mapping.model');
const Student = require('../student/models/student.model');
const User = require('../user/user.model');
const Teacher = require('../teacher/models/teacher.model');
const Announcement = require('../communication/models/announcement.model');
const Notice = require('../communication/models/notice.model');
const Notification = require('../communication/models/notification.model');
const ChatMessage = require('../communication/models/chat-message.model');
const Homework = require('../academic/homework.model');
const Exam = require('../exam/models/exam.model');
const Marks = require('../exam/models/marks.model');
const ReportCard = require('../exam/models/report-card.model');
const BookIssue = require('../library/book-issue.model');
const StudentFee = require('../fees/models/student-fee.model');
const Payment = require('../fees/models/payment.model');
const Receipt = require('../fees/models/receipt.model');
const StudentTransport = require('../transport/models/student-transport.model');
const StudentDocument = require('../student/models/document.model');

// Attendance model
let StudentAttendance;
try { StudentAttendance = require('../attendance/models/student-attendance.model'); } catch(_) {
  try { StudentAttendance = require('../attendance/student-attendance.model'); } catch(__) { StudentAttendance = null; }
}

// Timetable model
let Timetable;
try { Timetable = require('../timetable/models/timetable.model'); } catch(_) {
  try { Timetable = require('../timetable/timetable.model'); } catch(__) { Timetable = null; }
}

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated } = require('../../utils/response.util');
const ApiError = require('../../utils/apiError.util');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get verified children for this parent
// ─────────────────────────────────────────────────────────────────────────────
async function getChildrenForParent(parentId) {
  const mappings = await ParentStudentMapping.find({ parentId }).lean();
  const studentIds = mappings.map(m => m.studentId);
  const students = await Student.find({ _id: { $in: studentIds }, isDeleted: { $ne: true } }).lean();
  return students;
}

async function verifyChildAccess(parentId, studentId) {
  const mapping = await ParentStudentMapping.findOne({ parentId, studentId }).lean();
  if (!mapping) throw ApiError.forbidden('You do not have access to this student.');
}

class ParentPortalController {

  // ─── Profile ─────────────────────────────────────────────────────────────
  getMyProfile = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const parent = await Parent.findById(parentId).lean();
    if (!parent) throw ApiError.notFound('Parent profile not found.');
    return sendSuccess(res, 'Profile retrieved.', parent);
  });

  updateMyProfile = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const parent = await Parent.findByIdAndUpdate(parentId, req.body, { new: true, runValidators: true }).lean();
    if (!parent) throw ApiError.notFound('Parent profile not found.');
    return sendSuccess(res, 'Profile updated.', parent);
  });

  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw ApiError.badRequest('Both passwords are required.');
    const user = await User.findOne({ email: req.user.email });
    if (user) { user.password = newPassword; await user.save(); }
    return sendSuccess(res, 'Password changed successfully.');
  });

  // ─── My Children ─────────────────────────────────────────────────────────
  getMyChildren = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const children = await getChildrenForParent(parentId);
    return sendSuccess(res, 'Children retrieved.', children);
  });

  // ─── Child Summary (Dashboard) ────────────────────────────────────────────
  getChildSummary = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { studentId } = req.params;
    await verifyChildAccess(parentId, studentId);

    const student = await Student.findById(studentId).lean();
    if (!student) throw ApiError.notFound('Student not found.');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Real attendance using Mongoose model
    let attendanceRate = 0;
    let todayAttendance = null;
    if (StudentAttendance) {
      const [todayRecord, monthRecords] = await Promise.all([
        StudentAttendance.findOne({ studentId, date: { $gte: today } }).lean(),
        StudentAttendance.find({ studentId, date: { $gte: monthStart } }).lean()
      ]);
      todayAttendance = todayRecord ? todayRecord.status : null;
      const presentDays = monthRecords.filter(r => r.status === 'present' || r.status === 'halfday').length;
      attendanceRate = monthRecords.length > 0 ? +((presentDays / monthRecords.length) * 100).toFixed(1) : 0;
    }

    // Homework pending
    const pendingHomework = await Homework.countDocuments({
      isDeleted: { $ne: true },
      dueDate: { $gte: today },
      'submissions.studentId': { $ne: mongoose.Types.ObjectId.isValid(studentId) ? new mongoose.Types.ObjectId(studentId) : studentId }
    }).catch(() => 0);

    // Upcoming exams (next 7 days)
    const next7 = new Date(today);
    next7.setDate(next7.getDate() + 7);
    const upcomingExams = await Exam.find({ isDeleted: { $ne: true }, startDate: { $gte: today, $lte: next7 } }).limit(3).lean().catch(() => []);

    // Fee outstanding
    const feeSummary = await StudentFee.findOne({ studentId }).lean().catch(() => null);
    const outstandingFee = feeSummary ? (feeSummary.pendingAmount || feeSummary.balanceAmount || 0) : 0;

    // Library issued count
    const issuedBooks = await BookIssue.countDocuments({ member: `${student.firstName} ${student.lastName}`, status: 'issued' }).catch(() => 0);

    return sendSuccess(res, 'Child summary retrieved.', {
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        studentClass: student.studentClass,
        section: student.section,
        avatarUrl: student.avatarUrl
      },
      attendance: { rate: attendanceRate, todayStatus: todayAttendance },
      pendingHomework,
      upcomingExams,
      outstandingFee,
      issuedBooks
    });
  });

  // ─── Child Homework ───────────────────────────────────────────────────────
  getChildHomework = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { studentId } = req.params;
    await verifyChildAccess(parentId, studentId);

    const student = await Student.findById(studentId).lean();
    if (!student) throw ApiError.notFound('Student not found.');

    // Scope to student's class only
    const query = { isDeleted: { $ne: true } };
    if (student.studentClass) query.className = student.studentClass;

    const homeworkList = await Homework.find(query).sort({ createdAt: -1 }).limit(30).lean();

    // Find this student's submission status in each homework
    const sId = studentId.toString();
    const enriched = homeworkList.map(hw => {
      const submission = (hw.submissions || []).find(s => s.studentId && s.studentId.toString() === sId);
      return {
        ...hw,
        submissionStatus: submission ? submission.status : 'pending',
        marks: submission ? submission.marks : null,
        feedback: submission ? (submission.feedback || submission.remarks) : null,
        submissionDate: submission ? submission.submissionDate : null
      };
    });

    return sendSuccess(res, 'Homework retrieved.', enriched);
  });

  // ─── Child Exam Results ───────────────────────────────────────────────────
  getChildResults = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { studentId } = req.params;
    await verifyChildAccess(parentId, studentId);

    const results = await Marks.find({ studentId }).populate('examId subjectId').sort({ createdAt: -1 }).lean().catch(() => []);
    return sendSuccess(res, 'Results retrieved.', results);
  });

  // ─── Child Report Card ────────────────────────────────────────────────────
  getChildReportCard = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { studentId } = req.params;
    await verifyChildAccess(parentId, studentId);

    let reportCards = [];
    try {
      if (ReportCard) reportCards = await ReportCard.find({ studentId }).sort({ createdAt: -1 }).lean();
    } catch(_) {}
    return sendSuccess(res, 'Report cards retrieved.', reportCards);
  });

  // ─── Child Library ────────────────────────────────────────────────────────
  getChildLibrary = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { studentId } = req.params;
    await verifyChildAccess(parentId, studentId);

    const student = await Student.findById(studentId).select('firstName lastName').lean();
    if (!student) throw ApiError.notFound('Student not found.');

    const memberName = `${student.firstName} ${student.lastName}`;
    const issued = await BookIssue.find({ member: memberName, memberType: 'Student' }).sort({ issueDate: -1 }).lean();
    return sendSuccess(res, 'Library records retrieved.', issued);
  });

  // ─── Child Documents ──────────────────────────────────────────────────────
  getChildDocuments = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { studentId } = req.params;
    await verifyChildAccess(parentId, studentId);

    let documents = [];
    try {
      documents = await StudentDocument.find({ studentId }).lean();
    } catch(_) {}
    return sendSuccess(res, 'Documents retrieved.', documents);
  });

  // ─── Child Transport ──────────────────────────────────────────────────────
  getChildTransport = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { studentId } = req.params;
    await verifyChildAccess(parentId, studentId);

    const allocation = await StudentTransport.findOne({ studentId, status: 'active' })
      .populate('routeId vehicleId driverId pickupStopId dropStopId')
      .lean();

    return sendSuccess(res, 'Transport details retrieved.', allocation || null);
  });

  // ─── Child Timetable (NEW) ────────────────────────────────────────────────
  getChildTimetable = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { studentId } = req.params;
    await verifyChildAccess(parentId, studentId);

    const student = await Student.findById(studentId).lean();
    if (!student) throw ApiError.notFound('Student not found.');

    let timetableEntries = [];
    if (Timetable) {
      // Try to find by class name or classId
      const query = {};
      if (student.classId) query.classId = student.classId;
      else if (student.studentClass) query.className = student.studentClass;
      timetableEntries = await Timetable.find(query).populate('subjectId teacherId').sort({ dayOfWeek: 1 }).lean().catch(() => []);
    }

    return sendSuccess(res, 'Timetable retrieved.', timetableEntries);
  });

  // ─── Child Attendance (NEW — Mongoose model, not raw collection) ──────────
  getChildAttendance = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { studentId } = req.params;
    await verifyChildAccess(parentId, studentId);

    const { month, year } = req.query;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) !== undefined && !isNaN(parseInt(month)) ? parseInt(month) : now.getMonth();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    let records = [];
    if (StudentAttendance) {
      records = await StudentAttendance.find({
        studentId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 }).lean();
    }

    const presentDays = records.filter(r => r.status === 'present' || r.status === 'halfday').length;
    const absentDays = records.filter(r => r.status === 'absent').length;
    const lateDays = records.filter(r => r.status === 'late').length;
    const totalMarked = records.length;
    const attendanceRate = totalMarked > 0 ? +((presentDays / totalMarked) * 100).toFixed(1) : 0;

    return sendSuccess(res, 'Attendance retrieved.', {
      records,
      summary: { presentDays, absentDays, lateDays, totalMarked, attendanceRate }
    });
  });

  // ─── Child Performance Analytics (NEW) ───────────────────────────────────
  getChildPerformance = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { studentId } = req.params;
    await verifyChildAccess(parentId, studentId);

    const student = await Student.findById(studentId).lean();
    if (!student) throw ApiError.notFound('Student not found.');

    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [allMarks, allHomework, attendanceRecords] = await Promise.all([
      Marks.find({ studentId }).populate('subjectId examId').lean().catch(() => []),
      Homework.find({ isDeleted: { $ne: true }, className: student.studentClass }).lean().catch(() => []),
      StudentAttendance ? StudentAttendance.find({ studentId, date: { $gte: sixMonthsAgo } }).lean().catch(() => []) : Promise.resolve([])
    ]);

    // Subject performance
    const subjectMap = {};
    allMarks.forEach(m => {
      const subjectName = m.subjectId?.name || m.subjectId?.subjectName || 'Unknown';
      if (!subjectMap[subjectName]) subjectMap[subjectName] = { total: 0, max: 0, count: 0 };
      subjectMap[subjectName].total += (m.marksObtained || 0);
      subjectMap[subjectName].max += (m.maxMarks || 100);
      subjectMap[subjectName].count++;
    });
    const subjectPerformance = Object.entries(subjectMap).map(([name, data]) => ({
      subject: name,
      average: data.max > 0 ? +((data.total / data.max) * 100).toFixed(1) : 0
    })).sort((a, b) => b.average - a.average);

    // Homework completion
    const sId = studentId.toString();
    const totalHomework = allHomework.length;
    const submittedHomework = allHomework.filter(hw =>
      (hw.submissions || []).some(s => s.studentId && s.studentId.toString() === sId && s.status !== 'pending')
    ).length;
    const homeworkRate = totalHomework > 0 ? +((submittedHomework / totalHomework) * 100).toFixed(1) : 0;

    // Monthly attendance trend
    const monthlyAttendance = {};
    attendanceRecords.forEach(r => {
      const key = `${new Date(r.date).getFullYear()}-${String(new Date(r.date).getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyAttendance[key]) monthlyAttendance[key] = { present: 0, total: 0 };
      if (r.status === 'present' || r.status === 'halfday') monthlyAttendance[key].present++;
      monthlyAttendance[key].total++;
    });
    const attendanceTrend = Object.entries(monthlyAttendance).map(([month, data]) => ({
      month,
      rate: data.total > 0 ? +((data.present / data.total) * 100).toFixed(1) : 0
    })).sort((a, b) => a.month.localeCompare(b.month));

    const overallAvg = subjectPerformance.length > 0
      ? +(subjectPerformance.reduce((s, p) => s + p.average, 0) / subjectPerformance.length).toFixed(1)
      : 0;

    return sendSuccess(res, 'Performance analytics retrieved.', {
      subjectPerformance,
      strongSubjects: subjectPerformance.slice(0, 3),
      weakSubjects: [...subjectPerformance].reverse().slice(0, 3),
      homeworkRate,
      submittedHomework,
      totalHomework,
      attendanceTrend,
      overallAverage: overallAvg
    });
  });

  // ─── Announcements & Notices ──────────────────────────────────────────────
  getAnnouncements = asyncHandler(async (req, res) => {
    const list = await Announcement.find({ isDeleted: { $ne: true } }).sort({ publishDate: -1 }).limit(20).lean();
    return sendSuccess(res, 'Announcements retrieved.', list);
  });

  getNotices = asyncHandler(async (req, res) => {
    const list = await Notice.find({ isDeleted: { $ne: true } }).sort({ publishDate: -1 }).limit(20).lean();
    return sendSuccess(res, 'Notices retrieved.', list);
  });

  // ─── Fees (NEW) ───────────────────────────────────────────────────────────
  getChildFees = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const children = await getChildrenForParent(parentId);
    const studentIds = children.map(c => c._id);

    const fees = await StudentFee.find({ studentId: { $in: studentIds } })
      .populate('studentId feeStructureId')
      .sort({ createdAt: -1 })
      .lean();

    const totalBilled = fees.reduce((s, f) => s + (f.totalAmount || f.amount || 0), 0);
    const totalPaid = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
    const outstanding = fees.reduce((s, f) => s + (f.pendingAmount || f.balanceAmount || 0), 0);

    return sendSuccess(res, 'Fee summary retrieved.', { fees, totalBilled, totalPaid, outstanding });
  });

  // ─── Payment History (NEW) ────────────────────────────────────────────────
  getChildPayments = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { page = 1, limit = 10, status, search } = req.query;
    const children = await getChildrenForParent(parentId);
    const studentIds = children.map(c => c._id);

    const fees = await StudentFee.find({ studentId: { $in: studentIds } }).select('_id').lean();
    const feeIds = fees.map(f => f._id);

    const query = { studentFeeId: { $in: feeIds } };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [payments, total] = await Promise.all([
      Payment.find(query).sort({ paymentDate: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Payment.countDocuments(query)
    ]);

    return sendSuccess(res, 'Payment history retrieved.', {
      payments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    });
  });

  // ─── Receipts (NEW) ───────────────────────────────────────────────────────
  getChildReceipts = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const children = await getChildrenForParent(parentId);
    const studentIds = children.map(c => c._id);

    let receipts = [];
    try {
      receipts = await Receipt.find({ studentId: { $in: studentIds } }).sort({ createdAt: -1 }).lean();
    } catch (_) {}
    return sendSuccess(res, 'Receipts retrieved.', receipts);
  });

  // ─── Notifications (NEW) ─────────────────────────────────────────────────
  getNotifications = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const notifications = await Notification.find({
      $or: [
        { recipientId: parentId },
        { recipientRole: 'parent' },
        { isDeleted: { $ne: true } }
      ]
    }).sort({ createdAt: -1 }).limit(30).lean().catch(() => []);
    return sendSuccess(res, 'Notifications retrieved.', notifications);
  });

  markNotificationRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notif = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true }).lean().catch(() => null);
    return sendSuccess(res, 'Notification marked as read.', notif);
  });

  // ─── Chat (NEW) ───────────────────────────────────────────────────────────
  getChatTeachers = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const children = await getChildrenForParent(parentId);

    // Get teachers from children's assigned classes
    const classNames = [...new Set(children.map(c => c.studentClass).filter(Boolean))];
    const teachers = await Teacher.find({
      isDeleted: { $ne: true },
      status: 'active',
      $or: [
        { 'assignedClasses.className': { $in: classNames } },
        { assignedClasses: { $exists: true, $ne: [] } }
      ]
    }).select('firstName lastName employeeId designation department email avatarUrl assignedClasses').lean();

    return sendSuccess(res, 'Chat teachers retrieved.', teachers);
  });

  getChatMessages = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { teacherId } = req.params;
    const messages = await ChatMessage.find({
      $or: [
        { senderId: parentId, receiverId: teacherId },
        { senderId: teacherId, receiverId: parentId }
      ]
    }).sort({ createdAt: 1 }).lean();
    return sendSuccess(res, 'Chat history retrieved.', messages);
  });

  sendChatMessage = asyncHandler(async (req, res) => {
    const parentId = req.user.id;
    const { teacherId, studentContextId, message, attachments } = req.body;
    if (!teacherId || !message) throw ApiError.badRequest('Teacher ID and message are required.');
    const msg = await ChatMessage.create({
      tenantId: 'default_school',
      senderId: parentId, senderModel: 'Parent',
      receiverId: teacherId, receiverModel: 'Teacher',
      studentContextId, message, attachments: attachments || [], readStatus: false
    });
    return sendCreated(res, 'Message sent.', msg);
  });
}

module.exports = new ParentPortalController();
