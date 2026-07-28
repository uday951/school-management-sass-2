const mongoose = require('mongoose');
const Teacher = require('./models/teacher.model');
const User = require('../user/user.model');
const Student = require('../student/models/student.model');
const Parent = require('../parent/parent.model');
const ParentStudentMapping = require('../parent/models/parent-student-mapping.model');
const TeacherLeave = require('./models/leave.model');
const Payslip = require('../payroll/models/payslip.model');
const TeacherDocument = require('./models/document.model');
const ChatMessage = require('../communication/models/chat-message.model');
const Notice = require('../communication/models/notice.model');
const Announcement = require('../communication/models/announcement.model');
const Marks = require('../exam/models/marks.model');
const Class = require('../academic/class.model');

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated } = require('../../utils/response.util');
const ApiError = require('../../utils/apiError.util');

class TeacherPortalController {
  // Helper to get active teacher matching logged-in user
  async _getTeacher(req) {
    const teacher = await Teacher.findOne({ email: req.user.email, isDeleted: false }).lean();
    if (!teacher) {
      throw ApiError.notFound('Teacher profile record not found.');
    }
    return teacher;
  }

  // GET /teacher/profile
  getProfile = asyncHandler(async (req, res) => {
    const teacher = await this._getTeacher(req);
    return sendSuccess(res, 'Teacher profile retrieved successfully.', teacher);
  });

  // PUT /teacher/profile
  updateProfile = asyncHandler(async (req, res) => {
    const teacher = await this._getTeacher(req);
    const updated = await Teacher.findByIdAndUpdate(teacher._id, req.body, { new: true, runValidators: true }).lean();
    return sendSuccess(res, 'Profile updated successfully.', updated);
  });

  // PUT /teacher/change-password
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('Current password and new password are required.');
    }
    const user = await User.findOne({ email: req.user.email });
    if (user) {
      user.password = newPassword;
      await user.save();
    }
    return sendSuccess(res, 'Password changed successfully.');
  });

  // GET /teacher/announcements
  getAnnouncements = asyncHandler(async (req, res) => {
    const list = await Announcement.find({ isDeleted: false })
      .sort({ publishDate: -1 })
      .limit(20)
      .lean();
    return sendSuccess(res, 'Announcements retrieved.', list);
  });

  // POST /teacher/leave
  applyLeave = asyncHandler(async (req, res) => {
    const teacher = await this._getTeacher(req);
    const leave = await TeacherLeave.create({
      ...req.body,
      teacherId: teacher._id,
      status: 'pending'
    });
    return sendCreated(res, 'Leave application submitted.', leave);
  });

  // GET /teacher/leave-history
  getLeaveHistory = asyncHandler(async (req, res) => {
    const teacher = await this._getTeacher(req);
    const history = await TeacherLeave.find({ teacherId: teacher._id })
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, 'Leave history retrieved.', history);
  });

  // PUT /teacher/leave/:id
  updateLeave = asyncHandler(async (req, res) => {
    const teacher = await this._getTeacher(req);
    const leave = await TeacherLeave.findOneAndUpdate(
      { _id: req.params.id, teacherId: teacher._id, status: 'pending' },
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!leave) {
      throw ApiError.notFound('Leave request not found or not editable.');
    }
    return sendSuccess(res, 'Leave application updated.', leave);
  });

  // DELETE /teacher/leave/:id
  cancelLeave = asyncHandler(async (req, res) => {
    const teacher = await this._getTeacher(req);
    const leave = await TeacherLeave.findOneAndDelete({
      _id: req.params.id,
      teacherId: teacher._id,
      status: 'pending'
    }).lean();

    if (!leave) {
      throw ApiError.notFound('Leave request not found or cannot be cancelled.');
    }
    return sendSuccess(res, 'Leave application cancelled.');
  });

  // GET /teacher/payslips
  getPayslips = asyncHandler(async (req, res) => {
    const teacher = await this._getTeacher(req);
    const slips = await Payslip.find({ teacherId: teacher._id })
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, 'Payslip logs retrieved.', slips);
  });

  // GET /teacher/payroll-history
  getPayrollHistory = asyncHandler(async (req, res) => {
    const teacher = await this._getTeacher(req);
    const slips = await Payslip.find({ teacherId: teacher._id, status: 'paid' })
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, 'Payroll history retrieved.', slips);
  });

  // GET /teacher/documents
  getDocuments = asyncHandler(async (req, res) => {
    const teacher = await this._getTeacher(req);
    const docs = await TeacherDocument.find({ teacherId: teacher._id }).lean();
    return sendSuccess(res, 'Teacher documents retrieved.', docs);
  });

  // GET /teacher/reports
  getReports = asyncHandler(async (req, res) => {
    const teacher = await this._getTeacher(req);
    
    // Find all student marks in classes assigned to teacher
    const classNames = teacher.assignedClasses || [];
    const students = await Student.find({ class: { $in: classNames }, isDeleted: false }).lean();
    const studentIds = students.map(s => s._id);

    const [marks, leavesCount] = await Promise.all([
      Marks.find({ studentId: { $in: studentIds } }).populate('subjectId', 'subjectName').lean(),
      TeacherLeave.countDocuments({ teacherId: teacher._id, status: 'approved' })
    ]);

    // Aggregate marks by subject
    const subjectStats = {};
    marks.forEach(m => {
      const subName = m.subjectId?.subjectName || 'General';
      if (!subjectStats[subName]) {
        subjectStats[subName] = { name: subName, totalMarks: 0, count: 0 };
      }
      subjectStats[subName].totalMarks += m.marksObtained || 0;
      subjectStats[subName].count += 1;
    });

    const analytics = Object.values(subjectStats).map(s => ({
      subject: s.name,
      average: s.count > 0 ? +(s.totalMarks / s.count).toFixed(1) : 0
    }));

    return sendSuccess(res, 'Teacher reports analytics retrieved.', {
      leavesApproved: leavesCount,
      totalAssignedStudents: students.length,
      subjectAverages: analytics
    });
  });

  // GET /teacher/conversations (list chat partners)
  getChatConversations = asyncHandler(async (req, res) => {
    const teacher = await this._getTeacher(req);
    const classNames = teacher.assignedClasses || [];

    // Find students in teacher's classes
    const students = await Student.find({ class: { $in: classNames }, isDeleted: false }).lean();
    const studentIds = students.map(s => s._id);

    // Find parents linked to those students
    const mappings = await ParentStudentMapping.find({ studentId: { $in: studentIds } })
      .populate('parentId')
      .populate('studentId')
      .lean();

    const parentList = mappings.map(m => ({
      id: m.parentId?._id || '',
      name: m.parentId?.name || 'Parent',
      email: m.parentId?.email || '',
      phone: m.parentId?.phone || '',
      relationship: m.relationship || 'Parent',
      student: {
        id: m.studentId?._id || '',
        name: `${m.studentId?.firstName || ''} ${m.studentId?.lastName || ''}`,
        class: m.studentId?.class || ''
      }
    })).filter(p => p.id);

    return sendSuccess(res, 'Chat conversation list retrieved.', parentList);
  });

  // GET /teacher/messages?recipientId=...
  getMessages = asyncHandler(async (req, res) => {
    const { recipientId } = req.query;
    if (!recipientId) {
      throw ApiError.badRequest('Recipient ID is required.');
    }

    // Get user document matching recipient (parent / student)
    // First lookup Parent model
    let recipientUser = await Parent.findById(recipientId).lean();
    if (!recipientUser) {
      recipientUser = await Student.findById(recipientId).lean();
    }
    if (!recipientUser) {
      // Direct User lookup fallback
      recipientUser = await User.findById(recipientId).lean();
    }
    if (!recipientUser) {
      throw ApiError.notFound('Recipient user not found.');
    }

    // Fetch messages between teacher and recipient
    const teacher = await this._getTeacher(req);
    
    // We need the User ID matching the teacher (req.user.id or lookup User by teacher email)
    const teacherUser = await User.findOne({ email: req.user.email }).lean();
    const teacherUserId = teacherUser ? teacherUser._id : teacher._id;

    // Find recipient User ID (if recipient is a Parent model, find the user matching parent's email)
    let recipientUserId = recipientId;
    if (recipientUser.email) {
      const rUser = await User.findOne({ email: recipientUser.email }).lean();
      if (rUser) recipientUserId = rUser._id;
    }

    const messages = await ChatMessage.find({
      $or: [
        { senderId: teacherUserId, recipientId: recipientUserId },
        { senderId: recipientUserId, recipientId: teacherUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .lean();

    return sendSuccess(res, 'Message history retrieved.', messages);
  });

  // POST /teacher/chat
  postChatMessage = asyncHandler(async (req, res) => {
    const { recipientId, message, attachments = [], studentContextId } = req.body;
    if (!recipientId || !message) {
      throw ApiError.badRequest('Recipient ID and message text are required.');
    }

    const teacher = await this._getTeacher(req);
    const teacherUser = await User.findOne({ email: req.user.email }).lean();
    const senderId = teacherUser ? teacherUser._id : teacher._id;

    // Find recipient User ID matching recipient model
    let recipientUserId = recipientId;
    const parent = await Parent.findById(recipientId).lean();
    if (parent && parent.email) {
      const rUser = await User.findOne({ email: parent.email }).lean();
      if (rUser) recipientUserId = rUser._id;
    } else {
      const student = await Student.findById(recipientId).lean();
      if (student && student.email) {
        const rUser = await User.findOne({ email: student.email }).lean();
        if (rUser) recipientUserId = rUser._id;
      }
    }

    const chatMsg = await ChatMessage.create({
      senderId,
      senderRole: 'teacher',
      recipientId: recipientUserId,
      recipientRole: parent ? 'parent' : 'student',
      studentContextId,
      message,
      attachments
    });

    return sendCreated(res, 'Chat message sent successfully.', chatMsg);
  });
}

module.exports = new TeacherPortalController();
