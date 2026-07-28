import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// LocalStorage Fallback Storage Helpers
const getStoredData = (key, initial) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initial;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return initial;
  }
};

const setStoredData = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (error) {
    console.error(`Error saving localStorage key "${key}":`, error);
  }
};

const INITIAL_PARENTS = [];

const loadLocalParents = () => {
  let parents = getStoredData('school_parents_db', null);
  if (!parents || !Array.isArray(parents)) {
    parents = [];
    setStoredData('school_parents_db', parents);
  }
  return parents;
};

export const parentService = {
  // Fetch list of parents (with query filters)
  async getParents(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/parents`, { params });
      if (response.data?.success && Array.isArray(response.data.data)) {
        return {
          parents: response.data.data.map((p) => ({
            ...p,
            id: p._id || p.id
          })),
          pagination: response.data.pagination || { totalRecords: response.data.data.length, totalPages: 1 }
        };
      }
    } catch (err) {
      console.warn('[API Notice] Fallback to local parent store:', err.message);
    }

    // Fallback search & filter locally
    let parents = loadLocalParents();
    if (params.status) {
      parents = parents.filter((p) => p.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      parents = parents.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q)
      );
    }
    return { parents, pagination: { totalRecords: parents.length, totalPages: 1, currentPage: 1 } };
  },

  // Get single parent details
  async getParentById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/parents/${id}`);
      if (response.data?.success && response.data.data) {
        const item = response.data.data;
        return { ...item, id: item._id || item.id };
      }
    } catch (err) {
      console.warn('[API Notice] Fallback to local parent profile:', err.message);
    }

    const parents = loadLocalParents();
    const found = parents.find((p) => p.id === id || p._id === id);
    if (!found) throw new Error('Parent record not found.');
    return found;
  },

  // Create new parent
  async createParent(parentData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/parents`, parentData);
      if (response.data?.success && response.data.data) {
        const newP = response.data.data;
        return { ...newP, id: newP._id || newP.id };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 400) throw new Error(msg);
      console.warn('[API Notice] Creating parent locally due to offline server:', msg);
    }

    const parents = loadLocalParents();
    const newParent = {
      id: 'P' + Math.floor(Math.random() * 9000 + 1000),
      _id: '60d01b' + Math.floor(Math.random() * 89999999 + 10000000),
      name: parentData.name,
      relationship: parentData.relationship || 'Father',
      email: parentData.email || '',
      phone: parentData.phone,
      altPhone: parentData.altPhone || '',
      address: parentData.address || '',
      city: parentData.city || '',
      state: parentData.state || '',
      country: parentData.country || 'USA',
      occupation: parentData.occupation || '',
      avatarUrl: parentData.avatarUrl || '',
      status: 'active',
      guardians: parentData.guardianName
        ? [
            {
              id: 'G' + Date.now(),
              guardianName: parentData.guardianName,
              relationship: parentData.guardianRelation || 'Guardian',
              phone: parentData.guardianPhone || parentData.phone,
              email: parentData.guardianEmail || '',
              isEmergencyContact: true
            }
          ]
        : [],
      linkedStudents: [],
      documents: [],
      communications: []
    };

    parents.unshift(newParent);
    setStoredData('school_parents_db', parents);
    return newParent;
  },

  // Update existing parent
  async updateParent(id, updateData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/parents/${id}`, updateData);
      if (response.data?.success && response.data.data) {
        const item = response.data.data;
        return { ...item, id: item._id || item.id };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 400) throw new Error(msg);
      console.warn('[API Notice] Updating parent locally due to offline server:', msg);
    }

    const parents = loadLocalParents();
    const index = parents.findIndex((p) => p.id === id || p._id === id);
    if (index === -1) throw new Error('Parent record not found.');

    parents[index] = { ...parents[index], ...updateData };
    setStoredData('school_parents_db', parents);
    return parents[index];
  },

  // Delete parent
  async deleteParent(id) {
    try {
      await axios.delete(`${API_BASE_URL}/parents/${id}`);
      return true;
    } catch (err) {
      console.warn('[API Notice] Deleting parent locally:', err.message);
    }

    const parents = loadLocalParents();
    const updated = parents.filter((p) => p.id !== id && p._id !== id);
    setStoredData('school_parents_db', updated);
    return true;
  },

  // --- Student Linking ---
  async getLinkedStudents(parentId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/parents/${parentId}/students`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[API Notice] Fallback for getLinkedStudents:', err.message);
    }

    const parent = await this.getParentById(parentId);
    return parent.linkedStudents || [];
  },

  async linkStudent(parentId, studentPayload) {
    try {
      const response = await axios.post(`${API_BASE_URL}/parents/${parentId}/link-student`, studentPayload);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 400 || err.response?.status === 404) {
        throw new Error(msg);
      }
      console.warn('[API Notice] Linking student locally:', msg);
    }

    const parents = loadLocalParents();
    const index = parents.findIndex((p) => p.id === parentId || p._id === parentId);
    if (index === -1) throw new Error('Parent record not found.');

    const studentId = studentPayload.studentId;
    const existing = (parents[index].linkedStudents || []).find((s) => s.studentId === studentId || s.student?._id === studentId);
    if (existing) throw new Error('Student is already linked to this parent.');

    const newLink = {
      id: 'M' + Date.now(),
      studentId,
      relationship: studentPayload.relationship || 'Parent',
      isPrimary: studentPayload.isPrimary ?? true,
      student: studentPayload.studentDetails || {
        _id: studentId,
        name: studentPayload.studentName || 'Student',
        admissionNo: studentPayload.admissionNo || 'ADM00' + Math.floor(Math.random() * 90 + 10),
        class: studentPayload.class || 'Grade 10',
        section: studentPayload.section || 'A'
      }
    };

    parents[index].linkedStudents = parents[index].linkedStudents || [];
    parents[index].linkedStudents.push(newLink);
    setStoredData('school_parents_db', parents);
    return newLink;
  },

  async unlinkStudent(parentId, studentId) {
    try {
      await axios.delete(`${API_BASE_URL}/parents/${parentId}/unlink-student/${studentId}`);
      return true;
    } catch (err) {
      console.warn('[API Notice] Unlinking student locally:', err.message);
    }

    const parents = loadLocalParents();
    const index = parents.findIndex((p) => p.id === parentId || p._id === parentId);
    if (index !== -1 && parents[index].linkedStudents) {
      parents[index].linkedStudents = parents[index].linkedStudents.filter(
        (m) => m.studentId !== studentId && m.student?._id !== studentId && m.student?.id !== studentId
      );
      setStoredData('school_parents_db', parents);
    }
    return true;
  },

  // --- Parent Documents ---
  async addDocument(parentId, formData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/parents/${parentId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[API Notice] Uploading parent document locally:', err.message);
    }

    const parents = loadLocalParents();
    const index = parents.findIndex((p) => p.id === parentId || p._id === parentId);
    if (index === -1) throw new Error('Parent record not found.');

    const docName = formData.get ? formData.get('documentName') : formData.documentName;
    const docType = formData.get ? formData.get('documentType') : formData.documentType;

    const newDoc = {
      id: 'D' + Date.now(),
      documentName: docName || 'Uploaded_Document.pdf',
      documentType: docType || 'Identity Proof',
      fileUrl: 'https://via.placeholder.com/150',
      uploadedDate: new Date().toISOString().split('T')[0]
    };

    parents[index].documents = parents[index].documents || [];
    parents[index].documents.unshift(newDoc);
    setStoredData('school_parents_db', parents);
    return newDoc;
  },

  async deleteDocument(parentId, docId) {
    try {
      await axios.delete(`${API_BASE_URL}/parents/${parentId}/documents/${docId}`);
      return true;
    } catch (err) {
      console.warn('[API Notice] Deleting document locally:', err.message);
    }

    const parents = loadLocalParents();
    const index = parents.findIndex((p) => p.id === parentId || p._id === parentId);
    if (index !== -1 && parents[index].documents) {
      parents[index].documents = parents[index].documents.filter((d) => d.id !== docId && d._id !== docId);
      setStoredData('school_parents_db', parents);
    }
    return true;
  },

  // --- Communication History ---
  async addCommunication(parentId, commData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/parents/${parentId}/communications`, commData);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[API Notice] Recording communication locally:', err.message);
    }

    const parents = loadLocalParents();
    const index = parents.findIndex((p) => p.id === parentId || p._id === parentId);
    if (index === -1) throw new Error('Parent record not found.');

    const newComm = {
      id: 'C' + Date.now(),
      type: commData.type || 'SMS',
      title: commData.title,
      message: commData.message,
      status: 'Sent',
      sentAt: new Date().toISOString()
    };

    parents[index].communications = parents[index].communications || [];
    parents[index].communications.unshift(newComm);
    setStoredData('school_parents_db', parents);
    return newComm;
  },

  // --- Bulk Import ---
  async importParents(records = []) {
    try {
      const response = await axios.post(`${API_BASE_URL}/parents/import`, { records });
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[API Notice] Fallback for importParents locally:', err.message);
    }

    let importedCount = 0;
    let linkedCount = 0;

    for (const rec of records) {
      try {
        const parentName = rec.name || rec.parentName || rec.fullName;
        const parentPhone = rec.phone || rec.parentPhone;
        if (!parentName || !parentPhone) continue;

        const newP = await this.createParent({
          name: parentName,
          relationship: rec.relationship || 'Father',
          email: rec.email || '',
          phone: parentPhone,
          altPhone: rec.altPhone || '',
          address: rec.address || '',
          city: rec.city || '',
          state: rec.state || '',
          occupation: rec.occupation || ''
        });
        importedCount++;

        const studentRef = rec.admissionNo || rec.studentAdmissionNo;
        if (studentRef && newP) {
          try {
            await this.linkStudent(newP.id || newP._id, {
              studentId: studentRef,
              studentName: rec.studentName || 'Linked Student',
              relationship: rec.relationship || 'Parent',
              admissionNo: studentRef
            });
            linkedCount++;
          } catch (_e) {}
        }
      } catch (_e) {}
    }

    return { importedCount, totalParsed: records.length, linkedCount };
  },

  // --- Dedicated Parent Portal Feature APIs ---
  async getParentDashboard(studentId = '') {
    try {
      const response = await axios.get(`${API_BASE_URL}/parent/dashboard`, { params: { studentId } });
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[API Notice] Fallback for getParentDashboard:', err.message);
    }
    return {
      childOverview: {
        _id: 'std_01',
        name: 'Alexander Wright',
        admissionNo: 'ADM-2026-001',
        class: 'Grade 10',
        section: 'A',
        rollNo: '101',
        gender: 'Male',
        dob: '2012-05-14'
      },
      attendancePercentage: 94,
      pendingHomework: 3,
      upcomingExams: 2,
      feeDue: 450,
      notifications: [
        { id: 'n1', title: 'Parent-Teacher Meeting', date: '2026-08-05', type: 'Event' },
        { id: 'n2', title: 'Mid-Term Exam Schedule Released', date: '2026-08-01', type: 'Academic' }
      ]
    };
  },

  async getChildren() {
    try {
      const response = await axios.get(`${API_BASE_URL}/parent/children`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[API Notice] Fallback for getChildren:', err.message);
    }
    return [
      {
        _id: 'std_01',
        name: 'Alexander Wright',
        firstName: 'Alexander',
        lastName: 'Wright',
        admissionNo: 'ADM-2026-001',
        class: 'Grade 10',
        section: 'A',
        rollNo: '101'
      }
    ];
  },

  async getChildProfile(childId = '') {
    try {
      const response = await axios.get(`${API_BASE_URL}/parent/child/${childId || 'default'}`);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[API Notice] Fallback for getChildProfile:', err.message);
    }
    return {
      personalDetails: {
        _id: 'std_01',
        name: 'Alexander Wright',
        firstName: 'Alexander',
        lastName: 'Wright',
        admissionNo: 'ADM-2026-001',
        rollNo: '101',
        gender: 'Male',
        dob: '2012-05-14',
        bloodGroup: 'O+',
        address: '124 School Street, Cityville'
      },
      academicDetails: {
        class: 'Grade 10',
        section: 'A',
        rollNo: '101',
        admissionDate: '2024-09-01'
      },
      teacherDetails: {
        name: 'Dr. Sarah Connor',
        email: 'sarah.connor@schoolerp.edu',
        phone: '+1-555-0144',
        subject: 'Class Teacher'
      },
      medicalInfo: {
        allergies: 'None',
        conditions: 'Good Health',
        doctorName: 'Dr. Robert Bruce',
        doctorPhone: '+1-555-9988'
      },
      emergencyContact: {
        name: 'Parent / Guardian',
        relationship: 'Primary Guardian',
        phone: '+1-555-0199',
        email: 'parent@example.com'
      },
      academicOverview: {
        gpa: '3.8 / 4.0',
        grade: 'A',
        performanceSummary: 'Excellent performance in Science and Mathematics. Regular attendance and active participation.'
      }
    };
  },

  async getAttendanceSummary(childId = '') {
    try {
      const response = await axios.get(`${API_BASE_URL}/parent/attendance-summary`, { params: { childId } });
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[API Notice] Fallback for getAttendanceSummary:', err.message);
    }
    return {
      workingDays: 40,
      presentDays: 37,
      absentDays: 2,
      lateDays: 1,
      rate: 92.5,
      monthlyLogs: [
        { month: 'January', present: 20, absent: 1, rate: 95 },
        { month: 'February', present: 17, absent: 1, rate: 94 }
      ]
    };
  },

  async getTimetable(childId = '') {
    try {
      const response = await axios.get(`${API_BASE_URL}/parent/timetable`, { params: { childId } });
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[API Notice] Fallback for getTimetable:', err.message);
    }
    return {
      className: 'Grade 10-A',
      schedule: [
        { day: 'Monday', period: '1', time: '08:30 - 09:15', subject: 'Mathematics', teacher: 'Mr. Smith', room: '101' },
        { day: 'Monday', period: '2', time: '09:15 - 10:00', subject: 'Physics', teacher: 'Dr. Connor', room: 'Lab 2' },
        { day: 'Tuesday', period: '1', time: '08:30 - 09:15', subject: 'English', teacher: 'Mrs. Davis', room: '101' },
        { day: 'Wednesday', period: '1', time: '08:30 - 09:15', subject: 'Chemistry', teacher: 'Dr. Bruce', room: 'Lab 1' }
      ]
    };
  },

  async getCalendar() {
    try {
      const response = await axios.get(`${API_BASE_URL}/parent/calendar`);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[API Notice] Fallback for getCalendar:', err.message);
    }
    return {
      academicYear: '2026-2027',
      events: [
        { id: '1', title: 'Independence Day Holiday', date: '2026-08-15', type: 'Holiday' },
        { id: '2', title: 'Parent-Teacher Conference', date: '2026-08-20', type: 'Meeting' },
        { id: '3', title: 'Mid-Term Examinations', date: '2026-09-10', type: 'Exam' }
      ]
    };
  }
};
