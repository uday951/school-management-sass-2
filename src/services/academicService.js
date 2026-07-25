import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// LocalStorage fallback helpers
const getStoredData = (key, initial) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initial;
  } catch (error) {
    console.error(`Error loading localStorage key "${key}":`, error);
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

const loadDb = () => {
  let teachers = getStoredData('academic_teachers', []);
  let classes = getStoredData('academic_classes', []);
  let subjects = getStoredData('academic_subjects', []);

  // Filter legacy mock data
  teachers = teachers.filter((t) => !t.id?.startsWith('T10'));
  classes = classes.filter((c) => !c.id?.startsWith('C00'));
  subjects = subjects.filter((s) => !s.id?.startsWith('S00'));

  setStoredData('academic_teachers', teachers);
  setStoredData('academic_classes', classes);
  setStoredData('academic_subjects', subjects);

  return { teachers, classes, subjects };
};

export const academicService = {
  // --- Teachers ---
  async getTeachers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/administration/users?role=teacher`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data.map((t) => ({
          id: t._id || t.id,
          name: t.name,
          email: t.email,
          department: t.department || ''
        }));
      }
    } catch (_err) {
      // Fallback
    }
    const { teachers } = loadDb();
    return teachers;
  },

  // --- Classes ---
  async getClasses() {
    try {
      const response = await axios.get(`${API_BASE_URL}/classes?limit=100`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        const classes = response.data.data.map((item) => ({
          id: item._id || item.id,
          name: item.className || item.name,
          code: item.classCode || item.code,
          capacity: item.capacity,
          roomNumber: item.roomNumber,
          teacherId: item.teacherId?._id || item.teacherId || '',
          status: (item.status || 'ACTIVE').toLowerCase()
        }));
        setStoredData('academic_classes', classes);
        return classes;
      }
    } catch (err) {
      console.warn('[API Warning] Could not fetch classes from backend server, using local database:', err.message);
    }
    const { classes } = loadDb();
    return classes;
  },

  async getClassById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/classes/${id}`);
      if (response.data?.success && response.data.data) {
        const item = response.data.data;
        return {
          id: item._id || item.id,
          name: item.className || item.name,
          code: item.classCode || item.code,
          capacity: item.capacity,
          roomNumber: item.roomNumber,
          teacherId: item.teacherId?._id || item.teacherId || '',
          status: (item.status || 'ACTIVE').toLowerCase()
        };
      }
    } catch (err) {
      console.warn('[API Warning] Could not fetch class by ID from server:', err.message);
    }
    const { classes } = loadDb();
    const item = classes.find((c) => c.id === id);
    if (!item) throw new Error('Class not found.');
    return item;
  },

  async addClass(classData) {
    try {
      const payload = {
        className: classData.name,
        classCode: classData.code,
        capacity: Number(classData.capacity),
        roomNumber: classData.roomNumber,
        teacherId: classData.teacherId || null,
        status: (classData.status || 'ACTIVE').toUpperCase()
      };

      const response = await axios.post(`${API_BASE_URL}/classes`, payload);
      if (response.data?.success && response.data.data) {
        const item = response.data.data;
        const newClass = {
          id: item._id || item.id,
          name: item.className || item.name,
          code: item.classCode || item.code,
          capacity: item.capacity,
          roomNumber: item.roomNumber,
          teacherId: item.teacherId?._id || item.teacherId || '',
          status: (item.status || 'ACTIVE').toLowerCase()
        };

        const { classes } = loadDb();
        setStoredData('academic_classes', [newClass, ...classes]);
        return newClass;
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || err.message;
      throw new Error(serverMsg);
    }

    // Fallback if backend server down
    const { classes } = loadDb();
    if (!classData.name?.trim()) throw new Error('Class Name is required.');
    if (!classData.code?.trim()) throw new Error('Class Code is required.');
    if (!classData.roomNumber?.trim()) throw new Error('Room Number is required.');

    const codeUpper = classData.code.trim().toUpperCase();
    if (classes.some((c) => c.code.toUpperCase() === codeUpper)) {
      throw new Error(`Class Code "${codeUpper}" already exists.`);
    }

    const capacityNum = Number(classData.capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      throw new Error('Capacity must be a valid positive number.');
    }

    const newClass = {
      id: 'C' + Math.floor(Math.random() * 9000 + 1000),
      name: classData.name.trim(),
      code: codeUpper,
      capacity: capacityNum,
      roomNumber: classData.roomNumber.trim(),
      teacherId: classData.teacherId || '',
      status: classData.status || 'active'
    };

    classes.unshift(newClass);
    setStoredData('academic_classes', classes);
    return newClass;
  },

  async updateClass(id, classData) {
    try {
      const payload = {
        className: classData.name,
        classCode: classData.code,
        capacity: Number(classData.capacity),
        roomNumber: classData.roomNumber,
        teacherId: classData.teacherId || null,
        status: (classData.status || 'ACTIVE').toUpperCase()
      };

      const response = await axios.put(`${API_BASE_URL}/classes/${id}`, payload);
      if (response.data?.success && response.data.data) {
        const item = response.data.data;
        const updated = {
          id: item._id || item.id,
          name: item.className || item.name,
          code: item.classCode || item.code,
          capacity: item.capacity,
          roomNumber: item.roomNumber,
          teacherId: item.teacherId?._id || item.teacherId || '',
          status: (item.status || 'ACTIVE').toLowerCase()
        };

        const { classes } = loadDb();
        const updatedList = classes.map((c) => (c.id === id ? updated : c));
        setStoredData('academic_classes', updatedList);
        return updated;
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || err.message;
      throw new Error(serverMsg);
    }

    // Fallback
    const { classes } = loadDb();
    const index = classes.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Class not found.');

    const codeUpper = classData.code.trim().toUpperCase();
    const capacityNum = Number(classData.capacity);

    classes[index] = {
      ...classes[index],
      name: classData.name.trim(),
      code: codeUpper,
      capacity: capacityNum,
      roomNumber: classData.roomNumber.trim(),
      teacherId: classData.teacherId || '',
      status: classData.status || 'active'
    };

    setStoredData('academic_classes', classes);
    return classes[index];
  },

  async deleteClass(id) {
    try {
      await axios.delete(`${API_BASE_URL}/classes/${id}`);
      const { classes, subjects } = loadDb();
      const updatedClasses = classes.filter((c) => c.id !== id);
      setStoredData('academic_classes', updatedClasses);
      return true;
    } catch (err) {
      if (err.response?.status === 404) {
        // Fallback delete
      } else if (err.response?.data?.error?.message) {
        throw new Error(err.response.data.error.message);
      }
    }

    const { classes, subjects } = loadDb();
    const updatedClasses = classes.filter((c) => c.id !== id);
    setStoredData('academic_classes', updatedClasses);
    return true;
  },

  // --- Subjects ---
  async getSubjects() {
    try {
      const response = await axios.get(`${API_BASE_URL}/subjects?limit=100`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        const subjects = response.data.data.map((item) => ({
          id: item._id || item.id,
          name: item.subjectName || item.name,
          code: item.subjectCode || item.code,
          department: item.department,
          credits: item.credits,
          description: item.description || '',
          status: (item.status || 'ACTIVE').toLowerCase(),
          teacherId: item.teacher?._id || item.teacher || item.teacherId || '',
          assignedClasses: (item.classes || item.assignedClasses || []).map((c) => c._id || c)
        }));
        setStoredData('academic_subjects', subjects);
        return subjects;
      }
    } catch (err) {
      console.warn('[API Warning] Could not fetch subjects from server:', err.message);
    }
    const { subjects } = loadDb();
    return subjects;
  },

  async getSubjectById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/subjects/${id}`);
      if (response.data?.success && response.data.data) {
        const item = response.data.data;
        return {
          id: item._id || item.id,
          name: item.subjectName || item.name,
          code: item.subjectCode || item.code,
          department: item.department,
          credits: item.credits,
          description: item.description || '',
          status: (item.status || 'ACTIVE').toLowerCase(),
          teacherId: item.teacher?._id || item.teacher || item.teacherId || '',
          assignedClasses: (item.classes || item.assignedClasses || []).map((c) => c._id || c)
        };
      }
    } catch (err) {
      console.warn('[API Warning] Could not fetch subject by ID from server:', err.message);
    }
    const { subjects } = loadDb();
    const item = subjects.find((s) => s.id === id);
    if (!item) throw new Error('Subject not found.');
    return item;
  },

  async addSubject(subjectData) {
    try {
      const payload = {
        subjectName: subjectData.name,
        subjectCode: subjectData.code,
        department: subjectData.department,
        credits: Number(subjectData.credits),
        description: subjectData.description || '',
        status: (subjectData.status || 'ACTIVE').toUpperCase(),
        teacher: subjectData.teacherId || null,
        classes: subjectData.assignedClasses || []
      };

      const response = await axios.post(`${API_BASE_URL}/subjects`, payload);
      if (response.data?.success && response.data.data) {
        const item = response.data.data;
        const newSubject = {
          id: item._id || item.id,
          name: item.subjectName || item.name,
          code: item.subjectCode || item.code,
          department: item.department,
          credits: item.credits,
          description: item.description || '',
          status: (item.status || 'ACTIVE').toLowerCase(),
          teacherId: item.teacher?._id || item.teacher || item.teacherId || '',
          assignedClasses: (item.classes || item.assignedClasses || []).map((c) => c._id || c)
        };

        const { subjects } = loadDb();
        setStoredData('academic_subjects', [newSubject, ...subjects]);
        return newSubject;
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || err.message;
      throw new Error(serverMsg);
    }

    // Fallback
    const { subjects } = loadDb();
    const codeUpper = subjectData.code.trim().toUpperCase();
    const creditsNum = Number(subjectData.credits);

    const newSubject = {
      id: 'S' + Math.floor(Math.random() * 9000 + 1000),
      name: subjectData.name.trim(),
      code: codeUpper,
      department: subjectData.department.trim(),
      credits: creditsNum,
      description: subjectData.description?.trim() || '',
      status: subjectData.status || 'active',
      assignedClasses: subjectData.assignedClasses || [],
      teacherId: subjectData.teacherId || ''
    };

    subjects.unshift(newSubject);
    setStoredData('academic_subjects', subjects);
    return newSubject;
  },

  async updateSubject(id, subjectData) {
    try {
      const payload = {
        subjectName: subjectData.name,
        subjectCode: subjectData.code,
        department: subjectData.department,
        credits: Number(subjectData.credits),
        description: subjectData.description || '',
        status: (subjectData.status || 'ACTIVE').toUpperCase()
      };

      const response = await axios.put(`${API_BASE_URL}/subjects/${id}`, payload);
      if (response.data?.success && response.data.data) {
        const item = response.data.data;
        const updated = {
          id: item._id || item.id,
          name: item.subjectName || item.name,
          code: item.subjectCode || item.code,
          department: item.department,
          credits: item.credits,
          description: item.description || '',
          status: (item.status || 'ACTIVE').toLowerCase(),
          teacherId: item.teacher?._id || item.teacher || item.teacherId || '',
          assignedClasses: (item.classes || item.assignedClasses || []).map((c) => c._id || c)
        };

        const { subjects } = loadDb();
        const updatedList = subjects.map((s) => (s.id === id ? updated : s));
        setStoredData('academic_subjects', updatedList);
        return updated;
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || err.message;
      throw new Error(serverMsg);
    }

    const { subjects } = loadDb();
    const index = subjects.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Subject not found.');

    subjects[index] = {
      ...subjects[index],
      name: subjectData.name.trim(),
      code: subjectData.code.trim().toUpperCase(),
      department: subjectData.department.trim(),
      credits: Number(subjectData.credits),
      description: subjectData.description?.trim() || '',
      status: subjectData.status || 'active'
    };

    setStoredData('academic_subjects', subjects);
    return subjects[index];
  },

  async deleteSubject(id) {
    try {
      await axios.delete(`${API_BASE_URL}/subjects/${id}`);
      const { subjects } = loadDb();
      const updatedSubjects = subjects.filter((s) => s.id !== id);
      setStoredData('academic_subjects', updatedSubjects);
      return true;
    } catch (err) {
      if (err.response?.data?.error?.message) {
        throw new Error(err.response.data.error.message);
      }
    }

    const { subjects } = loadDb();
    const updatedSubjects = subjects.filter((s) => s.id !== id);
    setStoredData('academic_subjects', updatedSubjects);
    return true;
  },

  async toggleSubjectStatus(id) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/subjects/${id}/status`);
      if (response.data?.success && response.data.data) {
        const item = response.data.data;
        const updated = {
          id: item._id || item.id,
          name: item.subjectName || item.name,
          code: item.subjectCode || item.code,
          department: item.department,
          credits: item.credits,
          description: item.description || '',
          status: (item.status || 'ACTIVE').toLowerCase(),
          teacherId: item.teacher?._id || item.teacher || item.teacherId || '',
          assignedClasses: (item.classes || item.assignedClasses || []).map((c) => c._id || c)
        };

        const { subjects } = loadDb();
        const updatedList = subjects.map((s) => (s.id === id ? updated : s));
        setStoredData('academic_subjects', updatedList);
        return updated;
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || err.message;
      throw new Error(serverMsg);
    }

    const { subjects } = loadDb();
    const index = subjects.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Subject not found.');

    const newStatus = subjects[index].status === 'active' ? 'inactive' : 'active';
    subjects[index] = {
      ...subjects[index],
      status: newStatus
    };

    setStoredData('academic_subjects', subjects);
    return subjects[index];
  },

  async assignSubjectDetails(id, { teacherId, assignedClasses }) {
    try {
      const payload = {
        teacher: teacherId || null,
        classes: assignedClasses || []
      };

      const response = await axios.put(`${API_BASE_URL}/subjects/${id}/assign`, payload);
      if (response.data?.success && response.data.data) {
        const item = response.data.data;
        const updated = {
          id: item._id || item.id,
          name: item.subjectName || item.name,
          code: item.subjectCode || item.code,
          department: item.department,
          credits: item.credits,
          description: item.description || '',
          status: (item.status || 'ACTIVE').toLowerCase(),
          teacherId: item.teacher?._id || item.teacher || item.teacherId || '',
          assignedClasses: (item.classes || item.assignedClasses || []).map((c) => c._id || c)
        };

        const { subjects } = loadDb();
        const updatedList = subjects.map((s) => (s.id === id ? updated : s));
        setStoredData('academic_subjects', updatedList);
        return updated;
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || err.message;
      throw new Error(serverMsg);
    }

    const { subjects } = loadDb();
    const index = subjects.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Subject not found.');

    subjects[index] = {
      ...subjects[index],
      teacherId: teacherId || '',
      assignedClasses: assignedClasses || []
    };

    setStoredData('academic_subjects', subjects);
    return subjects[index];
  }
};
