const mongoose = require('mongoose');

const Student = require('../student/models/student.model');
const Teacher = require('../teacher/models/teacher.model');
const TeacherAttendance = require('../attendance/models/teacher-attendance.model');
const StudentAttendance = require('../attendance/models/student-attendance.model');
const Payment = require('../fees/models/payment.model');
const StudentFee = require('../fees/models/student-fee.model');
const Class = require('../academic/class.model');
const Subject = require('../academic/subject.model');
const Exam = require('../exam/models/exam.model');
const BookIssue = require('../library/book-issue.model');
const Book = require('../library/book.model');
const Payroll = require('../payroll/models/payroll.model');
const Vehicle = require('../transport/models/vehicle.model');
const StudentTransport = require('../transport/models/student-transport.model');
const Notification = require('../communication/models/notification.model');
const Announcement = require('../communication/models/announcement.model');
const Asset = require('../inventory/asset.model');
const Stock = require('../inventory/stock.model');
const Parent = require('../parent/parent.model');

class DashboardService {
  async getOverview() {
    try {
      return {
        schoolName: process.env.SCHOOL_NAME || 'School ERP',
        currentDate: new Date(),
        academicYear: process.env.ACADEMIC_YEAR || '2025-2026',
      };
    } catch (error) {
      return {
        schoolName: 'School ERP',
        currentDate: new Date(),
        academicYear: '2025-2026'
      };
    }
  }

  async getStudentKPIs() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const result = await Student.aggregate([
        { $match: { isDeleted: false } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            active: [{ $match: { status: 'active' } }, { $count: 'count' }],
            inactive: [{ $match: { status: 'inactive' } }, { $count: 'count' }],
            newToday: [{ $match: { admissionDate: { $gte: today } } }, { $count: 'count' }],
            newThisMonth: [{ $match: { admissionDate: { $gte: firstOfMonth } } }, { $count: 'count' }],
            genderBreakdown: [
              { $group: { _id: '$gender', count: { $sum: 1 } } }
            ]
          }
        }
      ]);

      const data = result[0];
      const genders = data.genderBreakdown || [];
      const male = genders.find(g => g._id === 'male')?.count || 0;
      const female = genders.find(g => g._id === 'female')?.count || 0;
      const other = genders.find(g => !['male','female'].includes(g._id))?.count || 0;
      return {
        total: data.total[0]?.count || 0,
        active: data.active[0]?.count || 0,
        inactive: data.inactive[0]?.count || 0,
        newToday: data.newToday[0]?.count || 0,
        newThisMonth: data.newThisMonth[0]?.count || 0,
        male, female, other,
        genderBreakdown: data.genderBreakdown || []
      };
    } catch (error) {
      return { total: 0, active: 0, inactive: 0, newToday: 0, newThisMonth: 0, male: 0, female: 0, other: 0, genderBreakdown: [] };
    }
  }

  async getAttendanceKPIs() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [studentResult, teacherResult] = await Promise.all([
        StudentAttendance.aggregate([
          { $match: { date: { $gte: today, $lt: tomorrow } } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        TeacherAttendance.aggregate([
          { $match: { date: { $gte: today, $lt: tomorrow } } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      ]);

      const calc = (records) => {
        let total = 0, present = 0, absent = 0, late = 0, halfday = 0;
        records.forEach(r => {
          total += r.count;
          if (r._id === 'present') present = r.count;
          if (r._id === 'absent') absent = r.count;
          if (r._id === 'late') late = r.count;
          if (r._id === 'halfday') halfday = r.count;
        });
        return { total, present, absent, late, halfday, pct: total > 0 ? +((present / total) * 100).toFixed(1) : 0 };
      };

      const studentStats = calc(studentResult);
      const teacherStats = calc(teacherResult);

      // Flat shape for frontend compatibility
      return {
        studentAttendancePct: studentStats.pct,
        teacherAttendancePct: teacherStats.pct,
        present: studentStats.present,
        absent: studentStats.absent,
        late: studentStats.late,
        halfday: studentStats.halfday,
        totalStudentsMarked: studentStats.total,
        teacherPresent: teacherStats.present,
        teacherAbsent: teacherStats.absent,
        student: studentStats,
        teacher: teacherStats
      };
    } catch (error) {
      return {
        studentAttendancePct: 0, teacherAttendancePct: 0,
        present: 0, absent: 0, late: 0, halfday: 0,
        totalStudentsMarked: 0, teacherPresent: 0, teacherAbsent: 0,
        student: {}, teacher: {}
      };
    }
  }

  async getFinanceKPIs() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const [payments, fees] = await Promise.all([
        Payment.aggregate([
          { $match: { status: 'success' } },
          {
            $facet: {
              today: [
                { $match: { paymentDate: { $gte: today } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
              ],
              monthly: [
                { $match: { paymentDate: { $gte: firstDayOfMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
              ]
            }
          }
        ]),
        StudentFee.aggregate([
          {
            $facet: {
              outstanding: [{ $match: { status: { $ne: 'paid' } } }, { $group: { _id: null, total: { $sum: '$balanceAmount' }, count: { $sum: 1 } } }],
              paid: [{ $match: { status: 'paid' } }, { $count: 'count' }],
              partial: [{ $match: { status: 'partial' } }, { $count: 'count' }],
              unpaid: [{ $match: { status: 'unpaid' } }, { $count: 'count' }],
              totalBilled: [{ $count: 'count' }]
            }
          }
        ])
      ]);

      const feeData = fees[0];
      return {
        todayCollection: payments[0]?.today[0]?.total || 0,
        monthlyCollection: payments[0]?.monthly[0]?.total || 0,
        outstanding: feeData?.outstanding[0]?.total || 0,
        outstandingFees: feeData?.outstanding[0]?.total || 0,
        pendingCount: feeData?.outstanding[0]?.count || 0,
        paid: feeData?.paid[0]?.count || 0,
        partial: feeData?.partial[0]?.count || 0,
        unpaid: feeData?.unpaid[0]?.count || 0,
        totalBilled: feeData?.totalBilled[0]?.count || 0
      };
    } catch (error) {
      return { todayCollection: 0, monthlyCollection: 0, outstanding: 0, outstandingFees: 0, pendingCount: 0, paid: 0, partial: 0, unpaid: 0, totalBilled: 0 };
    }
  }

  async getAcademicsKPIs() {
    try {
      const today = new Date();

      const [classes, subjects, exams] = await Promise.all([
        Class.countDocuments({ isDeleted: false }),
        Subject.countDocuments({ isDeleted: false }),
        Exam.aggregate([
          { $match: { isDeleted: false } },
          {
            $facet: {
              totalActive: [{ $match: { status: 'active' } }, { $count: 'count' }],
              upcoming: [
                { $match: { startDate: { $gte: today } } },
                { $count: 'count' }
              ]
            }
          }
        ])
      ]);

      return {
        classes: classes || 0,
        subjects: subjects || 0,
        activeExams: exams[0]?.totalActive[0]?.count || 0,
        upcomingExams: exams[0]?.upcoming[0]?.count || 0
      };
    } catch (error) {
      return { classes: 0, subjects: 0, activeExams: 0, upcomingExams: 0 };
    }
  }

  async getPayrollKPIs() {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      const payroll = await Payroll.findOne({ month: currentMonth, year: currentYear, isDeleted: false }).lean();

      return {
        status: payroll?.status || 'not_generated',
        netAmount: payroll?.netAmount || 0,
        totalAmount: payroll?.totalAmount || 0,
        totalDeductions: payroll?.totalDeductions || 0,
        totalAllowances: payroll?.totalAllowances || 0,
        pendingAmount: payroll?.status === 'pending' ? payroll?.netAmount || 0 : 0,
        month: currentMonth,
        year: currentYear
      };
    } catch (error) {
      return { status: 'not_generated', netAmount: 0, totalAmount: 0, totalDeductions: 0, totalAllowances: 0, pendingAmount: 0 };
    }
  }

  async getTransportKPIs() {
    try {
      const Route = require('../transport/models/route.model');
      const [vehicles, students, routes] = await Promise.all([
        Vehicle.aggregate([
          { $match: { isDeleted: { $ne: true } } },
          {
            $facet: {
              total: [{ $count: 'count' }],
              maintenance: [{ $match: { status: 'maintenance' } }, { $count: 'count' }]
            }
          }
        ]),
        StudentTransport.countDocuments({ isDeleted: { $ne: true } }),
        Route.countDocuments({ isDeleted: { $ne: true } }).catch(() => 0)
      ]);

      return {
        vehicles: vehicles[0]?.total[0]?.count || 0,
        maintenanceAlerts: vehicles[0]?.maintenance[0]?.count || 0,
        assignedStudents: students || 0,
        routes: routes || 0
      };
    } catch (error) {
      return { vehicles: 0, maintenanceAlerts: 0, assignedStudents: 0, routes: 0 };
    }
  }

  async getLibraryKPIs() {
    try {
      const [books, issues] = await Promise.all([
        Book.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: '$quantity' },
              available: { $sum: '$availableCopies' }
            }
          }
        ]),
        BookIssue.aggregate([
          {
            $facet: {
              issued: [{ $match: { status: 'issued' } }, { $count: 'count' }],
              overdue: [{ $match: { status: 'overdue' } }, { $count: 'count' }]
            }
          }
        ])
      ]);

      return {
        total: books[0]?.total || 0,
        available: books[0]?.available || 0,
        issued: issues[0]?.issued[0]?.count || 0,
        overdue: issues[0]?.overdue[0]?.count || 0
      };
    } catch (error) {
      return { total: 0, available: 0, issued: 0, overdue: 0 };
    }
  }

  async getCommunicationKPIs() {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const [unread, total, announcements] = await Promise.all([
        Notification.countDocuments({ isDeleted: false, status: 'unread' }),
        Notification.countDocuments({ isDeleted: false }),
        Announcement.countDocuments({ isDeleted: false, status: 'published', publishDate: { $gte: firstDayOfMonth } }).catch(() => 0)
      ]);

      return {
        unread: unread || 0,
        total: total || 0,
        announcements: announcements || 0,
        unreadNotifications: unread || 0,
        announcementsThisMonth: announcements || 0
      };
    } catch (error) {
      return { unread: 0, total: 0, announcements: 0, unreadNotifications: 0, announcementsThisMonth: 0 };
    }
  }

  async getInventoryKPIs() {
    try {
      const [assets, lowStock] = await Promise.all([
        Asset.countDocuments({ isDeleted: { $ne: true } }).catch(() => 0),
        Stock.aggregate([
          { $match: { isDeleted: { $ne: true }, $expr: { $lt: ['$quantity', '$minimumQuantity'] } } },
          { $count: 'count' }
        ]).catch(() => [])
      ]);

      return {
        assets: assets || 0,
        stockAlerts: lowStock[0]?.count || 0,
        lowStockItems: lowStock[0]?.count || 0
      };
    } catch (error) {
      return { assets: 0, stockAlerts: 0, lowStockItems: 0 };
    }
  }

  async getTeacherKPIs() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [total, attendance] = await Promise.all([
        Teacher.countDocuments({ isDeleted: false }),
        TeacherAttendance.aggregate([
          { $match: { date: { $gte: today, $lt: tomorrow } } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      ]);

      let present = 0, absent = 0;
      attendance.forEach(a => {
        if (a._id === 'present') present = a.count;
        if (a._id === 'absent') absent = a.count;
      });

      return { total, present, absent };
    } catch (error) {
      return { total: 0, present: 0, absent: 0 };
    }
  }

  async getParentKPIs() {
    try {
      const result = await Parent.aggregate([
        { $match: { isDeleted: false } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            active: [{ $match: { status: 'active' } }, { $count: 'count' }]
          }
        }
      ]);

      return {
        total: result[0]?.total[0]?.count || 0,
        active: result[0]?.active[0]?.count || 0
      };
    } catch (error) {
      return { total: 0, active: 0 };
    }
  }

  async getAttendanceTrend() {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const result = await StudentAttendance.aggregate([
        { $match: { date: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              day: { $dayOfMonth: '$date' }
            },
            total: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      return result.map(r => ({
        date: `${r._id.year}-${String(r._id.month).padStart(2, '0')}-${String(r._id.day).padStart(2, '0')}`,
        percentage: r.total > 0 ? Number(((r.present / r.total) * 100).toFixed(2)) : 0
      }));
    } catch (error) {
      return [];
    }
  }

  async getMonthlyAdmissions() {
    try {
      const currentYear = new Date().getFullYear();

      const result = await Student.aggregate([
        { 
          $match: { 
            isDeleted: false,
            admissionDate: { 
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1)
            }
          }
        },
        {
          $group: {
            _id: { $month: '$admissionDate' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = new Array(12).fill(0);
      
      result.forEach(r => {
        if (r._id >= 1 && r._id <= 12) {
          monthlyData[r._id - 1] = r.count;
        }
      });

      return months.map((month, index) => ({
        label: month,
        value: monthlyData[index]
      }));
    } catch (error) {
      return [];
    }
  }

  async getFeeCollectionTrend() {
    try {
      const currentYear = new Date().getFullYear();

      const result = await Payment.aggregate([
        { 
          $match: { 
            status: 'success',
            paymentDate: { 
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1)
            }
          }
        },
        {
          $group: {
            _id: { $month: '$paymentDate' },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = new Array(12).fill(0);
      
      result.forEach(r => {
        if (r._id >= 1 && r._id <= 12) {
          monthlyData[r._id - 1] = r.amount;
        }
      });

      return months.map((month, index) => ({
        label: month,
        value: monthlyData[index]
      }));
    } catch (error) {
      return [];
    }
  }

  async getRecentActivity() {
    try {
      const [admissions, payments, attendance] = await Promise.all([
        Student.find({ isDeleted: false })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('firstName lastName admissionNo admissionDate createdAt')
          .lean(),
        Payment.find({ status: 'success' })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('amount paymentDate method createdAt')
          .lean(),
        StudentAttendance.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('date status createdAt')
          .populate('studentId', 'firstName lastName admissionNo')
          .lean()
      ]);

      return { admissions, payments, attendance };
    } catch (error) {
      return { admissions: [], payments: [], attendance: [] };
    }
  }

  async getUpcomingExams() {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const exams = await Exam.find({
        isDeleted: false,
        startDate: { $gte: today, $lte: nextWeek }
      })
      .sort({ startDate: 1 })
      .select('name startDate endDate type status section')
      .lean();

      return (exams || []).map(e => ({
        ...e,
        examDate: e.startDate // alias for frontend
      }));
    } catch (error) {
      return [];
    }
  }

  async getSystemHealth() {
    try {
      return {
        uptime: process.uptime(),
        mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date(),
        nodeVersion: process.version
      };
    } catch (error) {
      return {
        uptime: 0,
        mongodbStatus: 'unknown',
        timestamp: new Date(),
        nodeVersion: process.version
      };
    }
  }

  async getAllKPIs() {
    try {
      const [
        students,
        teachers,
        attendance,
        finance,
        academics,
        payroll,
        transport,
        library,
        communication,
        inventory,
        parents,
        monthlyAdmissions,
        feeCollectionTrend,
        attendanceTrend
      ] = await Promise.allSettled([
        this.getStudentKPIs(),
        this.getTeacherKPIs(),
        this.getAttendanceKPIs(),
        this.getFinanceKPIs(),
        this.getAcademicsKPIs(),
        this.getPayrollKPIs(),
        this.getTransportKPIs(),
        this.getLibraryKPIs(),
        this.getCommunicationKPIs(),
        this.getInventoryKPIs(),
        this.getParentKPIs(),
        this.getMonthlyAdmissions(),
        this.getFeeCollectionTrend(),
        this.getAttendanceTrend()
      ]);

      const val = (p) => p.status === 'fulfilled' ? p.value : {};

      return {
        students: val(students),
        teachers: val(teachers),
        attendance: val(attendance),
        finance: val(finance),
        academics: val(academics),
        payroll: val(payroll),
        transport: val(transport),
        library: val(library),
        communication: val(communication),
        inventory: val(inventory),
        parents: val(parents),
        monthlyAdmissions: val(monthlyAdmissions),
        feeCollectionTrend: val(feeCollectionTrend),
        attendanceTrend: val(attendanceTrend)
      };
    } catch (error) {
      return {};
    }
  }
}

module.exports = new DashboardService();
