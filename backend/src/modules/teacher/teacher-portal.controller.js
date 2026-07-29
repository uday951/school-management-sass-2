const mongoose = require('mongoose');
const Teacher = require('./models/teacher.model');
const TeacherLeave = require('./models/leave.model');
const TeacherDocument = require('./models/document.model');
const Payslip = require('../payroll/models/payslip.model');
const Announcement = require('../communication/models/announcement.model');
const Notice = require('../communication/models/notice.model');
const ChatMessage = require('../communication/models/chat-message.model');
const Student = require('../student/models/student.model');
const Homework = require('../academic/homework.model');
const Marks = require('../exam/models/marks.model');
const Exam = require('../exam/models/exam.model');
const User = require('../user/user.model');
const Parent = require('../parent/parent.model');
const StudentAttendance = require('../attendance/models/student-attendance.model');

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated } = require('../../utils/response.util');
const ApiError = require('../../utils/apiError.util');

class TeacherPortalController {
  // GET /teacher/profile
  getProfile = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) throw ApiError.notFound('Teacher profile not found.');
    return sendSuccess(res, 'Profile retrieved successfully.', teacher);
  });

  // PUT /teacher/profile
  updateProfile = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const teacher = await Teacher.findByIdAndUpdate(teacherId, req.body, { new: true, runValidators: true }).lean();
    if (!teacher) throw ApiError.notFound('Teacher profile not found.');
    return sendSuccess(res, 'Profile updated successfully.', teacher);
  });

  // PUT /teacher/change-password
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw ApiError.badRequest('Current password and new password are required.');
    const user = await User.findOne({ email: req.user.email });
    if (user) { user.password = newPassword; await user.save(); }
    return sendSuccess(res, 'Password changed successfully.');
  });

  // GET /teacher/dashboard  — Real DB aggregation dashboard
  getDashboard = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) throw ApiError.notFound('Teacher not found.');

    const assignedClasses = teacher.assignedClasses || [];
    const classNames = assignedClasses.map(c => c.className).filter(Boolean);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const next7Days = new Date(today); next7Days.setDate(next7Days.getDate() + 7);

    const [totalStudents, pendingHomework, upcomingExams, unreadMessages, recentAnnouncements] = await Promise.all([
      classNames.length > 0 ? Student.countDocuments({ studentClass: { $in: classNames }, isDeleted: { $ne: true } }) : Promise.resolve(0),
      Homework.countDocuments({ teacherId, isDeleted: { $ne: true }, dueDate: { $gte: today } }),
      Exam.countDocuments({ isDeleted: { $ne: true }, startDate: { $gte: today, $lte: next7Days } }),
      ChatMessage.countDocuments({ receiverId: teacherId, readStatus: false }),
      Announcement.find({ isDeleted: { $ne: true } }).sort({ publishDate: -1 }).limit(5).lean()
    ]);

    return sendSuccess(res, 'Teacher dashboard retrieved.', {
      teacherProfile: {
        name: `${teacher.firstName} ${teacher.lastName}`,
        employeeId: teacher.employeeId,
        department: teacher.department,
        email: teacher.email,
        designation: teacher.designation,
        avatarUrl: teacher.avatarUrl
      },
      assignedClassesCount: assignedClasses.length,
      totalStudentCount: totalStudents,
      pendingHomeworkCount: pendingHomework,
      upcomingExamsCount: upcomingExams,
      unreadMessagesCount: unreadMessages,
      announcements: recentAnnouncements.map(a => ({
        id: a._id, title: a.title, type: a.priority || 'info',
        date: a.publishDate ? new Date(a.publishDate).toLocaleDateString() : ''
      })),
      todaysSchedule: [],
      attendanceSummary: { presentRate: 0 }
    });
  });

  // GET /teacher/my-classes — teacher's assigned classes
  getMyClasses = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) throw ApiError.notFound('Teacher not found.');
    const assignedClasses = teacher.assignedClasses || [];
    return sendSuccess(res, 'Assigned classes retrieved.', assignedClasses);
  });

  // GET /teacher/my-students — students in teacher's assigned classes
  getMyStudents = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const { page = 1, limit = 20, search } = req.query;
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) throw ApiError.notFound('Teacher not found.');

    const assignedClasses = teacher.assignedClasses || [];
    const classNames = assignedClasses.map(c => c.className).filter(Boolean);

    const query = { isDeleted: { $ne: true } };
    if (classNames.length > 0) query.studentClass = { $in: classNames };
    if (search) query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { admissionNo: { $regex: search, $options: 'i' } }
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [students, total] = await Promise.all([
      Student.find(query).skip(skip).limit(parseInt(limit)).lean(),
      Student.countDocuments(query)
    ]);

    return sendSuccess(res, 'Students retrieved.', {
      data: students,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    });
  });

  // GET /teacher/payslips
  getPayslips = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const payslips = await Payslip.find({ teacherId }).sort({ createdAt: -1 }).lean();
    return sendSuccess(res, 'Payslips retrieved successfully.', payslips);
  });

  // GET /teacher/payroll-history
  getPayrollHistory = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const payslips = await Payslip.find({ teacherId }).select('netSalary grossSalary deductionsAmount status paymentDate createdAt').sort({ createdAt: -1 }).lean();
    return sendSuccess(res, 'Payroll history retrieved.', payslips);
  });

  // GET /teacher/announcements
  getAnnouncements = asyncHandler(async (req, res) => {
    const list = await Announcement.find({ isDeleted: { $ne: true } }).sort({ publishDate: -1 }).limit(20).lean();
    return sendSuccess(res, 'Announcements retrieved.', list);
  });

  // GET /teacher/notices
  getNotices = asyncHandler(async (req, res) => {
    const list = await Notice.find({ isDeleted: { $ne: true } }).sort({ publishDate: -1 }).limit(20).lean();
    return sendSuccess(res, 'Notices retrieved.', list);
  });

  // GET /teacher/leave-history
  getLeaveHistory = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const leaves = await TeacherLeave.find({ teacherId }).sort({ appliedOn: -1 }).lean();
    const totalAllowed = 15;
    const usedCount = leaves.filter(l => l.status === 'approved').length;
    return sendSuccess(res, 'Leave history and balances retrieved.', {
      leaves,
      balances: { total: totalAllowed, used: usedCount, available: totalAllowed - usedCount }
    });
  });

  // POST /teacher/leave
  createLeave = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason) throw ApiError.badRequest('Start date, end date, and reason are required.');
    const leave = await TeacherLeave.create({ teacherId, leaveType, startDate, endDate, reason, status: 'pending' });
    return sendCreated(res, 'Leave application submitted successfully.', leave);
  });

  // PUT /teacher/leave/:id
  updateLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const leave = await TeacherLeave.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).lean();
    if (!leave) throw ApiError.notFound('Leave request not found.');
    return sendSuccess(res, 'Leave application updated.', leave);
  });

  // DELETE /teacher/leave/:id
  deleteLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const leave = await TeacherLeave.findByIdAndDelete(id);
    if (!leave) throw ApiError.notFound('Leave request not found.');
    return sendSuccess(res, 'Leave application cancelled successfully.');
  });

  // GET /teacher/documents
  getDocuments = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const docs = await TeacherDocument.find({ teacherId }).lean();
    return sendSuccess(res, 'Teacher documents retrieved.', docs);
  });

  // GET /teacher/messages
  getMessages = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const messages = await ChatMessage.find({
      $or: [{ senderId: teacherId }, { receiverId: teacherId }]
    }).sort({ createdAt: -1 }).lean();

    const conversationsMap = {};
    for (let msg of messages) {
      const partnerId = msg.senderId.toString() === teacherId.toString() ? msg.receiverId.toString() : msg.senderId.toString();
      if (!conversationsMap[partnerId]) {
        conversationsMap[partnerId] = {
          partnerId,
          partnerModel: msg.senderId.toString() === teacherId.toString() ? msg.receiverModel : msg.senderModel,
          lastMessage: msg.message, lastTimestamp: msg.createdAt,
          unreadCount: (!msg.readStatus && msg.receiverId.toString() === teacherId.toString()) ? 1 : 0,
          messages: []
        };
      } else {
        if (!msg.readStatus && msg.receiverId.toString() === teacherId.toString()) conversationsMap[partnerId].unreadCount++;
      }
      conversationsMap[partnerId].messages.push(msg);
    }

    const resolvedConversations = [];
    for (let partnerId of Object.keys(conversationsMap)) {
      const conv = conversationsMap[partnerId];
      let partnerName = 'Unknown User'; let details = null;
      if (conv.partnerModel === 'Parent') {
        details = await Parent.findById(partnerId).select('name phone email').lean();
        partnerName = details ? details.name : 'Parent';
      } else if (conv.partnerModel === 'Student') {
        details = await Student.findById(partnerId).select('firstName lastName').lean();
        partnerName = details ? `${details.firstName} ${details.lastName}` : 'Student';
      } else {
        details = await User.findById(partnerId).select('name email').lean();
        partnerName = details ? details.name : 'Staff';
      }
      resolvedConversations.push({ ...conv, partnerName, partnerDetails: details });
    }
    return sendSuccess(res, 'Teacher messages and chats retrieved.', resolvedConversations);
  });

  // POST /teacher/chat
  createChat = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const { receiverId, receiverModel, studentContextId, message, attachments } = req.body;
    if (!receiverId || !receiverModel || !message) throw ApiError.badRequest('Receiver information and message text are required.');
    const chatMsg = await ChatMessage.create({
      tenantId: 'default_school', senderId: teacherId, senderModel: 'Teacher',
      receiverId, receiverModel, studentContextId, message, attachments: attachments || [], readStatus: false
    });
    return sendCreated(res, 'Message sent successfully.', chatMsg);
  });

  // GET /teacher/homework — list teacher's homework assignments
  getHomework = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const homework = await Homework.find({ teacherId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 }).lean();
    const enriched = homework.map(hw => ({
      ...hw,
      id: hw._id,
      submissionsCount: (hw.submissions || []).length,
      submittedCount: (hw.submissions || []).filter(s => s.status === 'submitted' || s.status === 'evaluated').length
    }));
    return sendSuccess(res, 'Homework list retrieved.', enriched);
  });

  // POST /teacher/homework — create a new homework assignment
  createHomework = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const { classId, className, subjectId, subjectName, title, description, dueDate } = req.body;
    if (!title || !dueDate) throw ApiError.badRequest('Title and due date are required.');
    const homework = await Homework.create({
      teacherId, classId, subjectId, title, description, dueDate,
      tenantId: 'default_school', submissions: []
    });
    return sendCreated(res, 'Homework assigned successfully.', homework);
  });

  // PUT /teacher/homework/:id — update homework
  updateHomework = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const teacherId = req.user.id;
    const hw = await Homework.findOneAndUpdate(
      { _id: id, teacherId },
      req.body,
      { new: true, runValidators: true }
    ).lean();
    if (!hw) throw ApiError.notFound('Homework not found.');
    return sendSuccess(res, 'Homework updated.', hw);
  });

  // DELETE /teacher/homework/:id — soft delete homework
  deleteHomework = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const teacherId = req.user.id;
    const hw = await Homework.findOneAndUpdate(
      { _id: id, teacherId },
      { isDeleted: true },
      { new: true }
    );
    if (!hw) throw ApiError.notFound('Homework not found.');
    return sendSuccess(res, 'Homework deleted successfully.');
  });

  // GET /teacher/homework/:id/submissions — get student submissions for a homework
  getHomeworkSubmissions = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const teacherId = req.user.id;
    const hw = await Homework.findOne({ _id: id, teacherId }).lean();
    if (!hw) throw ApiError.notFound('Homework not found.');

    const submissions = hw.submissions || [];
    // Enrich with student names
    const enriched = await Promise.all(submissions.map(async sub => {
      let studentName = 'Unknown Student';
      let rollNo = '';
      try {
        const student = await Student.findById(sub.studentId).select('firstName lastName rollNo').lean();
        if (student) { studentName = `${student.firstName} ${student.lastName}`; rollNo = student.rollNo || ''; }
      } catch (_) {}
      return { ...sub, studentName, rollNo, score: sub.marks || 0 };
    }));

    return sendSuccess(res, 'Homework submissions retrieved.', {
      homework: { id: hw._id, title: hw.title, dueDate: hw.dueDate },
      submissions: enriched
    });
  });

  // PUT /teacher/homework/:id/submissions/:studentId — evaluate a submission
  evaluateSubmission = asyncHandler(async (req, res) => {
    const { id, studentId } = req.params;
    const { marks, feedback, status } = req.body;
    const teacherId = req.user.id;
    const hw = await Homework.findOne({ _id: id, teacherId });
    if (!hw) throw ApiError.notFound('Homework not found.');
    const sub = hw.submissions.find(s => s.studentId.toString() === studentId);
    if (!sub) throw ApiError.notFound('Submission not found for this student.');
    if (marks !== undefined) sub.marks = marks;
    if (feedback !== undefined) sub.feedback = feedback;
    if (status !== undefined) sub.status = status;
    else sub.status = 'evaluated';
    await hw.save();
    return sendSuccess(res, 'Submission evaluated.', sub);
  });

  // GET /teacher/exams — get exams relevant to teacher's classes
  getExams = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) throw ApiError.notFound('Teacher not found.');
    const assignedClasses = (teacher.assignedClasses || []).map(c => c.classId).filter(Boolean);
    const query = { isDeleted: { $ne: true } };
    if (assignedClasses.length > 0) query.classId = { $in: assignedClasses };
    const exams = await Exam.find(query).sort({ startDate: -1 }).limit(20).lean();
    return sendSuccess(res, 'Exams retrieved.', exams);
  });

  // GET /teacher/marks — get marks entered by this teacher
  getMarks = asyncHandler(async (req, res) => {
    const { examId, studentId, subjectId } = req.query;
    const query = {};
    if (examId) query.examId = examId;
    if (studentId) query.studentId = studentId;
    if (subjectId) query.subjectId = subjectId;
    const marks = await Marks.find(query).lean();
    return sendSuccess(res, 'Marks retrieved.', marks);
  });

  // POST /teacher/marks — save student exam marks
  saveMarks = asyncHandler(async (req, res) => {
    const { studentId, examId, subjectId, marksObtained, maxMarks, remarks } = req.body;
    if (!studentId || !examId || !subjectId || marksObtained === undefined) {
      throw ApiError.badRequest('studentId, examId, subjectId, and marksObtained are required.');
    }
    // Upsert — if marks already exist for this student+exam+subject, update; else create
    const marks = await Marks.findOneAndUpdate(
      { studentId, examId, subjectId },
      { marksObtained, maxMarks: maxMarks || 100, remarks, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    return sendSuccess(res, 'Marks saved successfully.', marks);
  });

  // GET /teacher/reports — real analytics from DB
  getReports = asyncHandler(async (req, res) => {
    const teacherId = req.user.id;
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) throw ApiError.notFound('Teacher not found.');

    const assignedClasses = teacher.assignedClasses || [];
    const classNames = assignedClasses.map(c => c.className).filter(Boolean);

    const [totalStudents, totalHomework, allMarks] = await Promise.all([
      classNames.length > 0 ? Student.countDocuments({ studentClass: { $in: classNames }, isDeleted: { $ne: true } }) : Promise.resolve(0),
      Homework.countDocuments({ teacherId, isDeleted: { $ne: true } }),
      classNames.length > 0 ? Marks.find({}).lean() : Promise.resolve([])
    ]);

    const totalMarksSum = allMarks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
    const avgScore = allMarks.length > 0 ? +(totalMarksSum / allMarks.length).toFixed(1) : 0;

    // Per-class attendance summary (real data)
    const classPerformance = [];
    const attendanceSummary = [];
    for (const cls of assignedClasses) {
      const className = cls.className || 'Class';
      const studentsInClass = await Student.find({ studentClass: className, isDeleted: { $ne: true } }).select('_id').lean();
      const studentIds = studentsInClass.map(s => s._id);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [attendanceData, marksData] = await Promise.all([
        StudentAttendance.find({ studentId: { $in: studentIds }, date: { $gte: thirtyDaysAgo } }).lean(),
        Marks.find({ studentId: { $in: studentIds } }).lean()
      ]);

      const totalAtt = attendanceData.length;
      const presentAtt = attendanceData.filter(a => a.status === 'present').length;
      const attRate = totalAtt > 0 ? +((presentAtt / totalAtt) * 100).toFixed(1) : 0;

      const marksSum = marksData.reduce((s, m) => s + (m.marksObtained || 0), 0);
      const marksAvg = marksData.length > 0 ? +(marksSum / marksData.length).toFixed(1) : 0;

      classPerformance.push({ label: className, value: marksAvg });
      attendanceSummary.push({ label: className, value: attRate });
    }

    return sendSuccess(res, 'Teacher metrics reports retrieved.', {
      studentCount: totalStudents,
      homeworkCount: totalHomework,
      gradesAverage: avgScore,
      analytics: { classPerformance, attendanceSummary }
    });
  });
}

module.exports = new TeacherPortalController();
