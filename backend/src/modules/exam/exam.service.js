const examRepository = require('./exam.repository');
const ApiError = require('../../utils/apiError.util');
const Student = require('../student/models/student.model');
const mongoose = require('mongoose');

class ExamService {
  // --- EXAMS ---
  async getExams(filters = {}, options = {}) {
    return examRepository.getExams(filters, options);
  }

  async getExamById(id) {
    const exam = await examRepository.findExamById(id);
    if (!exam) throw ApiError.notFound('Exam not found.');
    return exam;
  }

  async createExam(data) {
    if (!data.name || !data.type || !data.classId || !data.startDate || !data.endDate) {
      throw ApiError.badRequest('Required fields: name, type, classId, startDate, endDate.');
    }
    return examRepository.createExam(data);
  }

  async updateExam(id, data) {
    await this.getExamById(id);
    return examRepository.updateExam(id, data);
  }

  async deleteExam(id) {
    await this.getExamById(id);
    return examRepository.deleteExam(id);
  }

  // --- SCHEDULES ---
  async getSchedules(filters = {}) {
    return examRepository.getSchedules(filters);
  }

  async createSchedule(data) {
    const { examId, date, subjectId, classId, section, time, hall } = data;
    if (!examId || !date || !subjectId || !classId || !time || !hall) {
      throw ApiError.badRequest('Required schedule fields: examId, date, subjectId, classId, time, hall.');
    }

    // Verify Exam exists
    const exam = await examRepository.findExamById(examId);
    if (!exam) throw ApiError.notFound('Exam does not exist.');

    // Verify conflicts
    const { classConflict, hallConflict } = await examRepository.checkScheduleConflict(date, time, classId, hall);
    if (classConflict) {
      throw ApiError.badRequest('Conflict: This class already has an exam scheduled at the same date and time.');
    }
    if (hallConflict) {
      throw ApiError.badRequest('Conflict: This exam hall is already booked for another exam at the same date and time.');
    }

    return examRepository.createSchedule(data);
  }

  async deleteSchedule(id) {
    return examRepository.deleteSchedule(id);
  }

  // --- GRADES SCALE SETUP ---
  async getGrades() {
    return examRepository.getGrades();
  }

  async createGrade(data) {
    const { gradeName, minMarks, maxMarks, gpa } = data;
    if (!gradeName || minMarks === undefined || maxMarks === undefined || gpa === undefined) {
      throw ApiError.badRequest('Required grade fields: gradeName, minMarks, maxMarks, gpa.');
    }
    if (minMarks > maxMarks) {
      throw ApiError.badRequest('Minimum marks cannot be greater than maximum marks.');
    }

    // Check for overlap
    const grades = await examRepository.getGrades();
    const overlap = grades.some(g => {
      return (minMarks >= g.minMarks && minMarks <= g.maxMarks) ||
             (maxMarks >= g.minMarks && maxMarks <= g.maxMarks);
    });
    if (overlap) {
      throw ApiError.badRequest('Conflict: Grade marks range overlaps with an existing definition.');
    }

    return examRepository.createGrade(data);
  }

  async updateGrade(id, data) {
    return examRepository.updateGrade(id, data);
  }

  async deleteGrade(id) {
    return examRepository.deleteGrade(id);
  }

  // Calculate corresponding grade letter & GPA based on marks obtained
  async calculateGradeForMarks(score, maxScore = 100) {
    const percentage = (score / maxScore) * 100;
    const grades = await examRepository.getGrades();

    // Find first matching range
    const match = grades.find(g => percentage >= g.minMarks && percentage <= g.maxMarks);
    if (match) {
      return { gradeName: match.gradeName, gpa: match.gpa };
    }
    // Fallback default
    return percentage >= 50 ? { gradeName: 'C', gpa: 2.0 } : { gradeName: 'F', gpa: 0.0 };
  }

  // --- MARKS ---
  async getMarks(filters = {}) {
    return examRepository.getMarks(filters);
  }

  async saveMarks(data) {
    const { studentId, examId, subjectId, marksObtained, maxMarks } = data;
    if (!studentId || !examId || !subjectId || marksObtained === undefined) {
      throw ApiError.badRequest('Required marks fields: studentId, examId, subjectId, marksObtained.');
    }
    if (marksObtained < 0) {
      throw ApiError.badRequest('Marks obtained cannot be negative.');
    }
    const limitMax = maxMarks || 100;
    if (marksObtained > limitMax) {
      throw ApiError.badRequest(`Marks obtained cannot exceed maximum marks of ${limitMax}.`);
    }

    // Calculate letter grade
    const grading = await this.calculateGradeForMarks(marksObtained, limitMax);
    const updatedPayload = {
      ...data,
      maxMarks: limitMax,
      grade: grading.gradeName
    };

    return examRepository.saveMarks(updatedPayload);
  }

  // --- RESULT PROCESSING & RANKINGS ---
  async processResults(examId) {
    if (!examId) throw ApiError.badRequest('Exam ID is required.');

    const exam = await examRepository.findExamById(examId);
    if (!exam) throw ApiError.notFound('Exam not found.');

    // 1. Fetch class / section details
    const classId = exam.classId._id || exam.classId;
    const section = exam.section || 'A';

    // 2. Fetch all students in the class/section
    let students = [];
    if (mongoose.connection.readyState === 1) {
      // Find class details
      const Class = require('../academic/class.model');
      const cls = await Class.findById(classId);
      const classNameStr = cls ? cls.className : '';
      students = await Student.find({ class: classNameStr, section, isDeleted: false });
    } else {
      // Fallback
      students = [
        { _id: '60d01b123432ab34523912a1', firstName: 'Alex', lastName: 'Rivera', admissionNo: 'ADM001', rollNo: '101' }
      ];
    }

    if (students.length === 0) {
      throw ApiError.notFound('No active students found in the scheduled exam class/section.');
    }

    // 3. Process marks for each student
    const results = [];
    for (const stud of students) {
      const studId = stud._id.toString();
      const studentMarks = await examRepository.getMarks({ studentId: studId, examId });

      if (studentMarks.length === 0) continue; // Skip students with no marks entered yet

      let totalObtained = 0;
      let totalMax = 0;
      let totalGpa = 0;

      studentMarks.forEach(m => {
        totalObtained += m.marksObtained;
        totalMax += m.maxMarks;
      });

      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const grading = await this.calculateGradeForMarks(totalObtained, totalMax);

      // Pass/Fail criteria: Fail if overall percentage is under 50% or if any subject marks are F
      const hasFailedSubject = studentMarks.some(m => m.grade === 'F');
      const status = (percentage >= 50 && !hasFailedSubject) ? 'Pass' : 'Fail';

      const resultRecord = await examRepository.saveResult({
        studentId: studId,
        examId,
        totalMarks: totalObtained,
        maxMarks: totalMax,
        percentage: parseFloat(percentage.toFixed(2)),
        gpa: grading.gpa,
        grade: grading.gradeName,
        status,
        isPublished: false
      });

      results.push(resultRecord);
    }

    // 4. Calculate Ranks
    results.sort((a, b) => b.totalMarks - a.totalMarks);
    for (let idx = 0; idx < results.length; idx++) {
      const res = results[idx];
      const rank = idx + 1;
      await examRepository.saveResult({
        studentId: res.studentId.toString(),
        examId,
        rank
      });
    }

    return { processedCount: results.length };
  }

  async getResults(filters = {}, options = {}) {
    return examRepository.getResults(filters, options);
  }

  // --- RESULT PUBLISHING ---
  async publishResults(examId, isPublished) {
    if (!examId) throw ApiError.badRequest('Exam ID is required.');
    return examRepository.publishResults(examId, isPublished);
  }

  // --- REPORT CARDS ---
  async getReportCardDetails(studentId, examId) {
    if (!studentId || !examId) {
      throw ApiError.badRequest('Student ID and Exam ID are required.');
    }

    const exam = await examRepository.findExamById(examId);
    if (!exam) throw ApiError.notFound('Exam not found.');

    // Fetch processed result details
    const resultQuery = await examRepository.getResults({ studentId, examId });
    if (!resultQuery.items || resultQuery.items.length === 0) {
      throw ApiError.notFound('Consolidated result not processed yet for this student.');
    }
    const result = resultQuery.items[0];

    // Fetch subject wise marks details
    const subjectMarks = await examRepository.getMarks({ studentId, examId });

    // Fetch Student metadata
    let student = null;
    if (mongoose.connection.readyState === 1) {
      student = await Student.findById(studentId);
    } else {
      student = { _id: studentId, firstName: 'Alex', lastName: 'Rivera', admissionNo: 'ADM001', rollNo: '101' };
    }

    // Return aggregated Report Card object
    return {
      student,
      exam,
      result,
      subjectMarks,
      generatedDate: new Date()
    };
  }
}

module.exports = new ExamService();
