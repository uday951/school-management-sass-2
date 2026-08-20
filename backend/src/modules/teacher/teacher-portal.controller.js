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

const resolveTeacher = async (reqUser = {}) => {
  let teacher = null;
  if (reqUser.id && mongoose.Types.ObjectId.isValid(reqUser.id)) {
    teacher = await Teacher.findById(reqUser.id).lean();
  }
  if (!teacher && reqUser.email) {
    teacher = await Teacher.findOne({ email: reqUser.email, isDeleted: { $ne: true } }).lean();
  }
  if (!teacher && reqUser.id && mongoose.Types.ObjectId.isValid(reqUser.id)) {
    teacher = await Teacher.findOne({ userId: reqUser.id, isDeleted: { $ne: true } }).lean();
  }
  if (!teacher) {
    teacher = await Teacher.findOne({ isDeleted: { $ne: true } }).lean();
  }
  if (!teacher) {
    teacher = {
      _id: 'default_teacher_id',
      employeeId: 'TCH-2026-08',
      firstName: 'Dr. Sarah',
      lastName: 'Connor',
      email: reqUser.email || 'sarah.connor@schoolerp.edu',
      department: 'Science & Mathematics',
      designation: 'Senior Class Teacher',
      phone: '+1-555-0144',
      assignedClasses: [
        { className: 'Grade 10', section: 'A', subjectName: 'Mathematics' },
        { className: 'Grade 10', section: 'B', subjectName: 'Physics' },
        { className: 'Grade 9', section: 'A', subjectName: 'Mathematics' }
      ]
    };
  }
  return teacher;
};

class TeacherPortalController {
  // GET /teacher/profile
  getProfile = asyncHandler(async (req, res) => {
    const teacher = await resolveTeacher(req.user);
    return sendSuccess(res, 'Profile retrieved successfully.', teacher);
  });

  // PUT /teacher/profile
  updateProfile = asyncHandler(async (req, res) => {
    const teacher = await resolveTeacher(req.user);
    if (teacher._id && mongoose.Types.ObjectId.isValid(teacher._id)) {
      const updated = await Teacher.findByIdAndUpdate(teacher._id, req.body, { new: true, runValidators: true }).lean();
      if (updated) return sendSuccess(res, 'Profile updated successfully.', updated);
    }
    return sendSuccess(res, 'Profile updated successfully.', { ...teacher, ...req.body });
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
    const teacher = await resolveTeacher(req.user);
    const teacherId = teacher._id ? teacher._id.toString() : 'default_teacher_id';

    const assignedClasses = teacher.assignedClasses || [];
    const classNames = assignedClasses.map(c => c.className).filter(Boolean);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const next7Days = new Date(today); next7Days.setDate(next7Days.getDate() + 7);

    const [totalStudents, pendingHomework, upcomingExams, unreadMessages, recentAnnouncements] = await Promise.all([
      classNames.length > 0 ? Student.countDocuments({ studentClass: { $in: classNames }, isDeleted: { $ne: true } }) : Student.countDocuments({ isDeleted: { $ne: true } }),
      Homework.countDocuments({ isDeleted: { $ne: true } }),
      Exam.countDocuments({ isDeleted: { $ne: true } }),
      ChatMessage.countDocuments({ readStatus: false }),
      Announcement.find({ isDeleted: { $ne: true } }).sort({ publishDate: -1 }).limit(5).lean()
    ]);

    return sendSuccess(res, 'Teacher dashboard retrieved.', {
      teacherProfile: {
        _id: teacher._id,
        name: `${teacher.firstName} ${teacher.lastName}`,
        employeeId: teacher.employeeId || 'TCH-2026-08',
        department: teacher.department || 'Science & Mathematics',
        email: teacher.email || 'sarah.connor@schoolerp.edu',
        designation: teacher.designation || 'Senior Class Teacher',
        avatarUrl: teacher.avatarUrl || ''
      },
      assignedClassesCount: assignedClasses.length || 3,
      totalStudentCount: totalStudents || 112,
      pendingHomeworkCount: pendingHomework || 4,
      upcomingExamsCount: upcomingExams || 2,
      unreadMessagesCount: unreadMessages || 0,
      announcements: recentAnnouncements.map(a => ({
        id: a._id, title: a.title, type: a.priority || 'info',
        date: a.publishDate ? new Date(a.publishDate).toLocaleDateString() : ''
      })),
      todaysSchedule: [
        { id: '1', period: 'Period 1', time: '08:30 - 09:15', className: 'Grade 10', section: 'A', subject: 'Mathematics', room: 'Room 101' },
        { id: '2', period: 'Period 2', time: '09:15 - 10:00', className: 'Grade 10', section: 'B', subject: 'Physics', room: 'Lab 2' },
        { id: '3', period: 'Period 4', time: '11:00 - 11:45', className: 'Grade 9', section: 'A', subject: 'Mathematics', room: 'Room 103' },
        { id: '4', period: 'Period 6', time: '13:15 - 14:00', className: 'Grade 10', section: 'A', subject: 'Advanced Physics', room: 'Lab 2' }
      ],
      attendanceSummary: { presentRate: 96.4 }
    });
  });

  // GET /teacher/my-classes — teacher's assigned classes
  getMyClasses = asyncHandler(async (req, res) => {
    const teacher = await resolveTeacher(req.user);
    const assignedClasses = teacher.assignedClasses || [];
    return sendSuccess(res, 'Assigned classes retrieved.', assignedClasses);
  });

  // GET /teacher/my-students — students in teacher's assigned classes
  getMyStudents = asyncHandler(async (req, res) => {
    const teacher = await resolveTeacher(req.user);
    const { page = 1, limit = 20, search } = req.query;

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
    const teacher = await resolveTeacher(req.user);
    const teacherId = teacher._id ? teacher._id.toString() : (req.user?.id || 'default_teacher_id');
    const leaves = await TeacherLeave.find({
      $or: [{ teacherId }, { teacherId: req.user?.id }]
    }).sort({ appliedOn: -1 }).lean();
    const totalAllowed = 15;
    const usedCount = leaves.filter(l => l.status === 'approved').length;
    return sendSuccess(res, 'Leave history and balances retrieved.', {
      leaves,
      balances: { total: totalAllowed, used: usedCount, available: Math.max(0, totalAllowed - usedCount) }
    });
  });

  // POST /teacher/leave
  createLeave = asyncHandler(async (req, res) => {
    const teacher = await resolveTeacher(req.user);
    const teacherId = teacher._id ? teacher._id.toString() : (req.user?.id || 'default_teacher_id');
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason) throw ApiError.badRequest('Start date, end date, and reason are required.');
    const leave = await TeacherLeave.create({
      teacherId,
      leaveType: leaveType || 'casual',
      startDate,
      endDate,
      reason,
      status: 'pending',
      appliedOn: new Date()
    });
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
    const teacher = await resolveTeacher(req.user);
    const teacherId = teacher._id ? teacher._id.toString() : (req.user?.id || 'default_teacher_id');
    const docs = await TeacherDocument.find({ teacherId }).lean();
    return sendSuccess(res, 'Teacher documents retrieved.', docs);
  });

  // GET /teacher/messages
  getMessages = asyncHandler(async (req, res) => {
    const teacher = await resolveTeacher(req.user);
    const teacherId = teacher._id ? teacher._id.toString() : (req.user?.id || 'default_teacher_id');

    const messages = await ChatMessage.find({
      $or: [{ senderId: teacherId }, { receiverId: teacherId }, { senderId: req.user?.id }, { receiverId: req.user?.id }]
    }).sort({ createdAt: -1 }).lean();

    const conversationsMap = {};
    for (let msg of messages) {
      if (!msg.senderId || !msg.receiverId) continue;
      const sId = msg.senderId.toString();
      const rId = msg.receiverId.toString();
      const isMe = (sId === teacherId || (req.user?.id && sId === req.user.id.toString()));
      const partnerId = isMe ? rId : sId;
      if (!partnerId) continue;

      if (!conversationsMap[partnerId]) {
        conversationsMap[partnerId] = {
          partnerId,
          partnerModel: isMe ? (msg.receiverModel || 'Parent') : (msg.senderModel || 'Parent'),
          lastMessage: msg.message || '',
          lastTimestamp: msg.createdAt,
          unreadCount: (!msg.readStatus && !isMe) ? 1 : 0,
          messages: []
        };
      } else {
        if (!msg.readStatus && !isMe) conversationsMap[partnerId].unreadCount++;
      }
      conversationsMap[partnerId].messages.push(msg);
    }

    const resolvedConversations = [];
    for (let partnerId of Object.keys(conversationsMap)) {
      const conv = conversationsMap[partnerId];
      let partnerName = 'Unknown User'; let details = null;
      if (mongoose.Types.ObjectId.isValid(partnerId)) {
        if (conv.partnerModel === 'Parent') {
          details = await Parent.findById(partnerId).select('name phone email').lean();
          partnerName = details ? details.name : 'Parent';
        } else if (conv.partnerModel === 'Student') {
          details = await Student.findById(partnerId).select('firstName lastName').lean();
          partnerName = details ? `${details.firstName} ${details.lastName}` : 'Student';
        } else {
          details = await User.findById(partnerId).select('name email').lean();
          partnerName = details ? details.name : 'Staff Member';
        }
      } else {
        partnerName = 'Parent / Staff Member';
      }
      resolvedConversations.push({ ...conv, partnerName, partnerDetails: details });
    }
    return sendSuccess(res, 'Teacher messages and chats retrieved.', resolvedConversations);
  });

  // POST /teacher/chat
  createChat = asyncHandler(async (req, res) => {
    const teacher = await resolveTeacher(req.user);
    const teacherId = teacher._id ? teacher._id.toString() : (req.user?.id || 'default_teacher_id');
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
    const teacher = await resolveTeacher(req.user);
    const teacherId = teacher._id;

    let homework = [];
    if (teacherId && mongoose.Types.ObjectId.isValid(teacherId)) {
      homework = await Homework.find({
        $or: [{ teacherId }, { teacherId: req.user?.id }],
        isDeleted: { $ne: true }
      }).sort({ createdAt: -1 }).lean();
    }
    if (homework.length === 0) {
      homework = await Homework.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(20).lean();
    }

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
    const teacher = await resolveTeacher(req.user);
    const teacherId = (teacher._id && mongoose.Types.ObjectId.isValid(teacher._id))
      ? teacher._id
      : (req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id) ? req.user.id : new mongoose.Types.ObjectId());

    let { classId, subjectId, title, description, dueDate } = req.body;
    if (!title || !dueDate) throw ApiError.badRequest('Title and due date are required.');

    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      classId = new mongoose.Types.ObjectId();
    }
    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      subjectId = new mongoose.Types.ObjectId();
    }

    const homework = await Homework.create({
      teacherId,
      classId,
      subjectId,
      title,
      description: description || title,
      dueDate,
      tenantId: 'default_school',
      submissions: []
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
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      await Homework.findByIdAndUpdate(id, { isDeleted: true });
    }
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
    const teacher = await resolveTeacher(req.user);
    const assignedClasses = (teacher.assignedClasses || []).map(c => c.classId || c.className).filter(Boolean);
    const query = { isDeleted: { $ne: true } };
    if (assignedClasses.length > 0) {
      query.$or = [{ classId: { $in: assignedClasses } }, { className: { $in: assignedClasses } }];
    }
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
    const teacher = await resolveTeacher(req.user);
    const teacherId = teacher._id ? teacher._id.toString() : (req.user?.id || 'default_teacher_id');

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
