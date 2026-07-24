import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Helper for local storage operations
const getStoredData = (key, defaultVal = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultVal;
  }
};

const setStoredData = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (error) {
    console.error(`Error saving localStorage key "${key}":`, error);
  }
};

// Initial grades setup fallback
const DEFAULT_GRADES = [
  { id: 'g1', gradeName: 'A+', minMarks: 90, maxMarks: 100, gpa: 4.0, remarks: 'Excellent' },
  { id: 'g2', gradeName: 'A', minMarks: 80, maxMarks: 89, gpa: 3.5, remarks: 'Very Good' },
  { id: 'g3', gradeName: 'B', minMarks: 70, maxMarks: 79, gpa: 3.0, remarks: 'Good' },
  { id: 'g4', gradeName: 'C', minMarks: 60, maxMarks: 69, gpa: 2.0, remarks: 'Satisfactory' },
  { id: 'g5', gradeName: 'D', minMarks: 50, maxMarks: 59, gpa: 1.0, remarks: 'Pass' },
  { id: 'g6', gradeName: 'F', minMarks: 0, maxMarks: 49, gpa: 0.0, remarks: 'Fail' }
];

export const examService = {
  // --- EXAMS ---
  async getExams(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/exams`, { params });
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Fallback to local exams store:', err.message);
    }
    const list = getStoredData('school_exams_db', []);
    return {
      items: list,
      pagination: { total: list.length, page: 1, limit: 10, pages: 1 }
    };
  },

  async createExam(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/exams`, data);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Creating exam locally:', err.message);
    }
    const list = getStoredData('school_exams_db', []);
    const newExam = { ...data, _id: Date.now().toString(), id: Date.now().toString(), createdAt: new Date() };
    list.push(newExam);
    setStoredData('school_exams_db', list);
    return newExam;
  },

  async updateExam(id, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/exams/${id}`, data);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Updating exam locally:', err.message);
    }
    const list = getStoredData('school_exams_db', []);
    const idx = list.findIndex(e => e._id === id || e.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setStoredData('school_exams_db', list);
      return list[idx];
    }
    return null;
  },

  async deleteExam(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/exams/${id}`);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Deleting exam locally:', err.message);
    }
    const list = getStoredData('school_exams_db', []);
    const filtered = list.filter(e => e._id !== id && e.id !== id);
    setStoredData('school_exams_db', filtered);
    return { success: true };
  },

  // --- SCHEDULES ---
  async getSchedules(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/exams/schedules/all`, { params });
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Fallback to local schedules:', err.message);
    }
    let list = getStoredData('school_exam_schedules_db', []);
    if (params.examId) list = list.filter(s => s.examId === params.examId);
    return list;
  },

  async createSchedule(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/exams/schedules`, data);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Creating schedule locally:', err.message);
    }
    const list = getStoredData('school_exam_schedules_db', []);
    const newSched = { ...data, _id: Date.now().toString(), id: Date.now().toString(), createdAt: new Date() };
    list.push(newSched);
    setStoredData('school_exam_schedules_db', list);
    return newSched;
  },

  async deleteSchedule(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/exams/schedules/${id}`);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Deleting schedule locally:', err.message);
    }
    const list = getStoredData('school_exam_schedules_db', []);
    const filtered = list.filter(s => s._id !== id && s.id !== id);
    setStoredData('school_exam_schedules_db', filtered);
    return { success: true };
  },

  // --- GRADES ---
  async getGrades() {
    try {
      const response = await axios.get(`${API_BASE_URL}/exams/grades/all`);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Fallback to local grades setup:', err.message);
    }
    const list = getStoredData('school_grades_db', null);
    if (!list) {
      setStoredData('school_grades_db', DEFAULT_GRADES);
      return DEFAULT_GRADES;
    }
    return list;
  },

  async createGrade(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/exams/grades`, data);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Creating grade configuration locally:', err.message);
    }
    const list = getStoredData('school_grades_db', DEFAULT_GRADES);
    const newGrade = { ...data, _id: Date.now().toString(), id: Date.now().toString() };
    list.push(newGrade);
    setStoredData('school_grades_db', list);
    return newGrade;
  },

  async updateGrade(id, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/exams/grades/${id}`, data);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Updating grade locally:', err.message);
    }
    const list = getStoredData('school_grades_db', DEFAULT_GRADES);
    const idx = list.findIndex(g => g._id === id || g.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setStoredData('school_grades_db', list);
      return list[idx];
    }
    return null;
  },

  async deleteGrade(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/exams/grades/${id}`);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Deleting grade locally:', err.message);
    }
    const list = getStoredData('school_grades_db', DEFAULT_GRADES);
    const filtered = list.filter(g => g._id !== id && g.id !== id);
    setStoredData('school_grades_db', filtered);
    return { success: true };
  },

  // --- MARKS ---
  async getMarks(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/exams/marks/all`, { params });
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Fallback to local marks store:', err.message);
    }
    let list = getStoredData('school_marks_db', []);
    if (params.examId) list = list.filter(m => m.examId === params.examId);
    if (params.studentId) list = list.filter(m => m.studentId === params.studentId);
    return list;
  },

  async saveMarks(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/exams/marks`, data);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Saving marks score locally:', err.message);
    }
    const list = getStoredData('school_marks_db', []);
    const idx = list.findIndex(
      m => m.studentId === data.studentId && m.examId === data.examId && m.subjectId === data.subjectId
    );
    // calculate simple local grade if offline
    const pct = ((data.marksObtained || 0) / (data.maxMarks || 100)) * 100;
    const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
    const finalRecord = { ...data, grade, _id: Date.now().toString() };

    if (idx !== -1) {
      list[idx] = finalRecord;
    } else {
      list.push(finalRecord);
    }
    setStoredData('school_marks_db', list);
    return finalRecord;
  },

  // --- RESULTS ---
  async getResults(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/exams/results/all`, { params });
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Fallback to local processed results:', err.message);
    }
    let list = getStoredData('school_results_db', []);
    if (params.examId) list = list.filter(r => r.examId === params.examId);
    return { items: list, pagination: { total: list.length, page: 1, limit: 10, pages: 1 } };
  },

  async processResults(examId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/exams/results/process`, { examId });
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Processing consolidated results locally:', err.message);
    }

    // Mock processing logic locally
    const marks = getStoredData('school_marks_db', []).filter(m => m.examId === examId);
    const studentsGroup = {};
    marks.forEach(m => {
      if (!studentsGroup[m.studentId]) {
        studentsGroup[m.studentId] = { obtained: 0, max: 0 };
      }
      studentsGroup[m.studentId].obtained += m.marksObtained;
      studentsGroup[m.studentId].max += m.maxMarks;
    });

    const resultsList = Object.keys(studentsGroup).map(studId => {
      const g = studentsGroup[studId];
      const pct = (g.obtained / g.max) * 100;
      const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
      return {
        _id: studId + '_' + examId,
        studentId: studId,
        examId,
        totalMarks: g.obtained,
        maxMarks: g.max,
        percentage: parseFloat(pct.toFixed(2)),
        grade,
        gpa: pct >= 90 ? 4.0 : pct >= 80 ? 3.5 : pct >= 70 ? 3.0 : pct >= 60 ? 2.0 : pct >= 50 ? 1.0 : 0.0,
        status: pct >= 50 ? 'Pass' : 'Fail',
        isPublished: false
      };
    });

    // assign ranks
    resultsList.sort((a,b) => b.totalMarks - a.totalMarks);
    resultsList.forEach((r, idx) => { r.rank = idx + 1; });

    setStoredData('school_results_db', resultsList);
    return { processedCount: resultsList.length };
  },

  async publishResults(examId, isPublished) {
    try {
      const response = await axios.post(`${API_BASE_URL}/exams/publish-results`, { examId, isPublished });
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Setting results publishing status locally:', err.message);
    }
    const list = getStoredData('school_results_db', []);
    list.forEach(r => {
      if (r.examId === examId) {
        r.isPublished = isPublished;
      }
    });
    setStoredData('school_results_db', list);
    return { success: true };
  },

  // --- REPORT CARDS ---
  async getReportCardDetails(studentId, examId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/exams/report-card/details`, { params: { studentId, examId } });
      if (response.data?.success) return response.data.data;
    } catch (err) {
      console.warn('[API Notice] Resolving report card locally:', err.message);
    }

    // fallback mapping locally
    const exams = getStoredData('school_exams_db', []);
    const exam = exams.find(e => e._id === examId || e.id === examId) || { name: 'Term 1 Exam', type: 'Annual' };
    const results = getStoredData('school_results_db', []);
    const result = results.find(r => r.studentId === studentId && r.examId === examId) || {
      totalMarks: 0, maxMarks: 0, percentage: 0, grade: 'F', gpa: 0, rank: null, status: 'Fail'
    };
    const subjectMarks = getStoredData('school_marks_db', []).filter(m => m.studentId === studentId && m.examId === examId);

    // Mock student
    const student = { _id: studentId, firstName: 'Alex', lastName: 'Rivera', admissionNo: 'ADM001', rollNo: '101' };

    return {
      student,
      exam,
      result,
      subjectMarks,
      generatedDate: new Date()
    };
  }
}
export default examService
