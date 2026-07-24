const mongoose = require('mongoose');
const Exam = require('./models/exam.model');
const ExamSchedule = require('./models/exam-schedule.model');
const Marks = require('./models/marks.model');
const Grade = require('./models/grade.model');
const Result = require('./models/result.model');
const ReportCard = require('./models/report-card.model');
const Student = require('../student/models/student.model');

// Mock memory store fallbacks for offline mode
let MOCK_EXAMS = [];
let MOCK_SCHEDULES = [];
let MOCK_MARKS = [];
let MOCK_GRADES = [
  { _id: 'g1', gradeName: 'A+', minMarks: 90, maxMarks: 100, gpa: 4.0, remarks: 'Excellent' },
  { _id: 'g2', gradeName: 'A', minMarks: 80, maxMarks: 89, gpa: 3.5, remarks: 'Very Good' },
  { _id: 'g3', gradeName: 'B', minMarks: 70, maxMarks: 79, gpa: 3.0, remarks: 'Good' },
  { _id: 'g4', gradeName: 'C', minMarks: 60, maxMarks: 69, gpa: 2.0, remarks: 'Satisfactory' },
  { _id: 'g5', gradeName: 'D', minMarks: 50, maxMarks: 59, gpa: 1.0, remarks: 'Pass' },
  { _id: 'g6', gradeName: 'F', minMarks: 0, maxMarks: 49, gpa: 0.0, remarks: 'Fail' }
];
let MOCK_RESULTS = [];
let MOCK_REPORT_CARDS = [];

class ExamRepository {
  isDbConnected() {
    return mongoose.connection.readyState === 1;
  }

  // --- EXAMS ---
  async getExams(filters = {}, options = {}) {
    if (this.isDbConnected()) {
      const query = { isDeleted: false };
      if (filters.search) {
        query.name = { $regex: filters.search, $options: 'i' };
      }
      if (filters.type) query.type = filters.type;
      if (filters.classId) query.classId = filters.classId;
      if (filters.status) query.status = filters.status;

      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 10;
      const skip = (page - 1) * limit;

      const items = await Exam.find(query)
        .populate('classId', 'className classCode')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Exam.countDocuments(query);

      return {
        items,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } else {
      let list = MOCK_EXAMS.filter(e => !e.isDeleted);
      if (filters.search) {
        list = list.filter(e => e.name.toLowerCase().includes(filters.search.toLowerCase()));
      }
      if (filters.type) list = list.filter(e => e.type === filters.type);
      if (filters.classId) list = list.filter(e => e.classId === filters.classId);
      if (filters.status) list = list.filter(e => e.status === filters.status);

      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 10;
      const skip = (page - 1) * limit;
      const paginated = list.slice(skip, skip + limit);

      return {
        items: paginated,
        pagination: {
          total: list.length,
          page,
          limit,
          pages: Math.ceil(list.length / limit)
        }
      };
    }
  }

  async findExamById(id) {
    if (this.isDbConnected()) {
      return Exam.findById(id).populate('classId', 'className classCode');
    }
    return MOCK_EXAMS.find(e => e._id.toString() === id.toString() && !e.isDeleted) || null;
  }

  async createExam(data) {
    if (this.isDbConnected()) {
      return Exam.create(data);
    }
    const newExam = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    MOCK_EXAMS.push(newExam);
    return newExam;
  }

  async updateExam(id, data) {
    if (this.isDbConnected()) {
      return Exam.findByIdAndUpdate(id, data, { new: true });
    }
    const idx = MOCK_EXAMS.findIndex(e => e._id.toString() === id.toString());
    if (idx !== -1) {
      MOCK_EXAMS[idx] = { ...MOCK_EXAMS[idx], ...data, updatedAt: new Date() };
      return MOCK_EXAMS[idx];
    }
    return null;
  }

  async deleteExam(id) {
    if (this.isDbConnected()) {
      return Exam.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
    const idx = MOCK_EXAMS.findIndex(e => e._id.toString() === id.toString());
    if (idx !== -1) {
      MOCK_EXAMS[idx].isDeleted = true;
      return MOCK_EXAMS[idx];
    }
    return null;
  }

  // --- SCHEDULES ---
  async getSchedules(filters = {}) {
    if (this.isDbConnected()) {
      const query = {};
      if (filters.examId) query.examId = filters.examId;
      if (filters.classId) query.classId = filters.classId;
      if (filters.subjectId) query.subjectId = filters.subjectId;
      return ExamSchedule.find(query)
        .populate('examId', 'name type')
        .populate('subjectId', 'subjectName subjectCode')
        .populate('classId', 'className classCode');
    }
    let list = [...MOCK_SCHEDULES];
    if (filters.examId) list = list.filter(s => s.examId.toString() === filters.examId.toString());
    if (filters.classId) list = list.filter(s => s.classId.toString() === filters.classId.toString());
    if (filters.subjectId) list = list.filter(s => s.subjectId.toString() === filters.subjectId.toString());
    return list;
  }

  async createSchedule(data) {
    if (this.isDbConnected()) {
      return ExamSchedule.create(data);
    }
    const newSched = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    MOCK_SCHEDULES.push(newSched);
    return newSched;
  }

  async deleteSchedule(id) {
    if (this.isDbConnected()) {
      return ExamSchedule.findByIdAndDelete(id);
    }
    const idx = MOCK_SCHEDULES.findIndex(s => s._id.toString() === id.toString());
    if (idx !== -1) {
      return MOCK_SCHEDULES.splice(idx, 1)[0];
    }
    return null;
  }

  // Check scheduling conflicts
  async checkScheduleConflict(date, time, classId, hall) {
    if (this.isDbConnected()) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23,59,59,999);

      // Check same class having an exam at the same time slot on the same day
      const classConflict = await ExamSchedule.findOne({
        classId,
        date: { $gte: startOfDay, $lte: endOfDay },
        time
      });

      // Check same hall assigned to another exam at the same time slot on the same day
      const hallConflict = await ExamSchedule.findOne({
        hall,
        date: { $gte: startOfDay, $lte: endOfDay },
        time
      });

      return { classConflict: !!classConflict, hallConflict: !!hallConflict };
    } else {
      const checkDayStr = new Date(date).toDateString();
      const classConflict = MOCK_SCHEDULES.some(
        s => s.classId.toString() === classId.toString() &&
             new Date(s.date).toDateString() === checkDayStr &&
             s.time === time
      );
      const hallConflict = MOCK_SCHEDULES.some(
        s => s.hall === hall &&
             new Date(s.date).toDateString() === checkDayStr &&
             s.time === time
      );
      return { classConflict, hallConflict };
    }
  }

  // --- MARKS ---
  async getMarks(filters = {}) {
    if (this.isDbConnected()) {
      const query = {};
      if (filters.studentId) query.studentId = filters.studentId;
      if (filters.examId) query.examId = filters.examId;
      if (filters.subjectId) query.subjectId = filters.subjectId;
      return Marks.find(query)
        .populate('studentId', 'firstName lastName admissionNo rollNo')
        .populate('examId', 'name type')
        .populate('subjectId', 'subjectName subjectCode');
    }
    let list = [...MOCK_MARKS];
    if (filters.studentId) list = list.filter(m => m.studentId.toString() === filters.studentId.toString());
    if (filters.examId) list = list.filter(m => m.examId.toString() === filters.examId.toString());
    if (filters.subjectId) list = list.filter(m => m.subjectId.toString() === filters.subjectId.toString());
    return list;
  }

  async saveMarks(data) {
    if (this.isDbConnected()) {
      return Marks.findOneAndUpdate(
        { studentId: data.studentId, examId: data.examId, subjectId: data.subjectId },
        data,
        { upsert: true, new: true }
      );
    }
    const idx = MOCK_MARKS.findIndex(
      m => m.studentId.toString() === data.studentId.toString() &&
           m.examId.toString() === data.examId.toString() &&
           m.subjectId.toString() === data.subjectId.toString()
    );
    if (idx !== -1) {
      MOCK_MARKS[idx] = { ...MOCK_MARKS[idx], ...data, updatedAt: new Date() };
      return MOCK_MARKS[idx];
    } else {
      const newMark = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      MOCK_MARKS.push(newMark);
      return newMark;
    }
  }

  // --- GRADES ---
  async getGrades() {
    if (this.isDbConnected()) {
      return Grade.find().sort({ minMarks: -1 });
    }
    return [...MOCK_GRADES].sort((a,b) => b.minMarks - a.minMarks);
  }

  async createGrade(data) {
    if (this.isDbConnected()) {
      return Grade.create(data);
    }
    const newGrade = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    MOCK_GRADES.push(newGrade);
    return newGrade;
  }

  async updateGrade(id, data) {
    if (this.isDbConnected()) {
      return Grade.findByIdAndUpdate(id, data, { new: true });
    }
    const idx = MOCK_GRADES.findIndex(g => g._id.toString() === id.toString());
    if (idx !== -1) {
      MOCK_GRADES[idx] = { ...MOCK_GRADES[idx], ...data, updatedAt: new Date() };
      return MOCK_GRADES[idx];
    }
    return null;
  }

  async deleteGrade(id) {
    if (this.isDbConnected()) {
      return Grade.findByIdAndDelete(id);
    }
    const idx = MOCK_GRADES.findIndex(g => g._id.toString() === id.toString());
    if (idx !== -1) {
      return MOCK_GRADES.splice(idx, 1)[0];
    }
    return null;
  }

  // --- RESULTS ---
  async getResults(filters = {}, options = {}) {
    if (this.isDbConnected()) {
      const query = {};
      if (filters.examId) query.examId = filters.examId;
      if (filters.studentId) query.studentId = filters.studentId;
      if (filters.status) query.status = filters.status;
      if (filters.isPublished !== undefined) query.isPublished = filters.isPublished;

      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 10;
      const skip = (page - 1) * limit;

      const items = await Result.find(query)
        .populate('studentId', 'firstName lastName admissionNo rollNo')
        .populate('examId', 'name type classId')
        .skip(skip)
        .limit(limit)
        .sort({ rank: 1, totalMarks: -1 });

      const total = await Result.countDocuments(query);

      return {
        items,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    }
    let list = [...MOCK_RESULTS];
    if (filters.examId) list = list.filter(r => r.examId.toString() === filters.examId.toString());
    if (filters.studentId) list = list.filter(r => r.studentId.toString() === filters.studentId.toString());
    if (filters.status) list = list.filter(r => r.status === filters.status);
    if (filters.isPublished !== undefined) list = list.filter(r => r.isPublished === filters.isPublished);

    list.sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      return b.totalMarks - a.totalMarks;
    });

    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;
    const paginated = list.slice(skip, skip + limit);

    return {
      items: paginated,
      pagination: {
        total: list.length,
        page,
        limit,
        pages: Math.ceil(list.length / limit)
      }
    };
  }

  async saveResult(data) {
    if (this.isDbConnected()) {
      return Result.findOneAndUpdate(
        { studentId: data.studentId, examId: data.examId },
        data,
        { upsert: true, new: true }
      );
    }
    const idx = MOCK_RESULTS.findIndex(
      r => r.studentId.toString() === data.studentId.toString() &&
           r.examId.toString() === data.examId.toString()
    );
    if (idx !== -1) {
      MOCK_RESULTS[idx] = { ...MOCK_RESULTS[idx], ...data, updatedAt: new Date() };
      return MOCK_RESULTS[idx];
    } else {
      const newRes = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      MOCK_RESULTS.push(newRes);
      return newRes;
    }
  }

  async publishResults(examId, isPublished) {
    if (this.isDbConnected()) {
      return Result.updateMany({ examId }, { isPublished });
    }
    MOCK_RESULTS.forEach(r => {
      if (r.examId.toString() === examId.toString()) {
        r.isPublished = isPublished;
      }
    });
    return { modifiedCount: MOCK_RESULTS.filter(r => r.examId.toString() === examId.toString()).length };
  }

  // --- REPORT CARDS ---
  async getReportCards(filters = {}) {
    if (this.isDbConnected()) {
      const query = {};
      if (filters.studentId) query.studentId = filters.studentId;
      if (filters.examId) query.examId = filters.examId;
      return ReportCard.find(query)
        .populate('studentId', 'firstName lastName admissionNo rollNo')
        .populate('examId', 'name type')
        .populate('resultId');
    }
    let list = [...MOCK_REPORT_CARDS];
    if (filters.studentId) list = list.filter(rc => rc.studentId.toString() === filters.studentId.toString());
    if (filters.examId) list = list.filter(rc => rc.examId.toString() === filters.examId.toString());
    return list;
  }

  async saveReportCard(data) {
    if (this.isDbConnected()) {
      return ReportCard.findOneAndUpdate(
        { studentId: data.studentId, examId: data.examId },
        data,
        { upsert: true, new: true }
      );
    }
    const idx = MOCK_REPORT_CARDS.findIndex(
      rc => rc.studentId.toString() === data.studentId.toString() &&
            rc.examId.toString() === data.examId.toString()
    );
    if (idx !== -1) {
      MOCK_REPORT_CARDS[idx] = { ...MOCK_REPORT_CARDS[idx], ...data, updatedAt: new Date() };
      return MOCK_REPORT_CARDS[idx];
    } else {
      const newRc = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      MOCK_REPORT_CARDS.push(newRc);
      return newRc;
    }
  }
}

module.exports = new ExamRepository();
