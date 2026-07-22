// Mock Academic Service Layer with LocalStorage persistence and simulated network delay.

const DELAY = 400; // Simulated latency in ms to show loading/skeleton states

// Initial teachers dataset
const INITIAL_TEACHERS = [
  { id: "T101", name: "Sarah Jenkins", email: "s.jenkins@school.edu", department: "Mathematics" },
  { id: "T102", name: "Michael Chang", email: "m.chang@school.edu", department: "Science" },
  { id: "T103", name: "Emily Rodriguez", email: "e.rodriguez@school.edu", department: "English" },
  { id: "T104", name: "David Alabo", email: "d.alabo@school.edu", department: "Social Studies" },
  { id: "T105", name: "Linda Chen", email: "l.chen@school.edu", department: "Computer Science" },
  { id: "T106", name: "James Wilson", email: "j.wilson@school.edu", department: "Science" },
  { id: "T107", name: "Sophia Martinez", email: "s.martinez@school.edu", department: "Mathematics" },
  { id: "T108", name: "Robert Taylor", email: "r.taylor@school.edu", department: "Art" },
  { id: "T109", name: "Olivia Anderson", email: "o.anderson@school.edu", department: "History" },
  { id: "T110", name: "Daniel Kim", email: "d.kim@school.edu", department: "Languages" }
];

// Initial classes dataset
const INITIAL_CLASSES = [
  { id: "C001", name: "Grade 10-A", code: "G10A", capacity: 35, roomNumber: "Room 101", teacherId: "T101", status: "active" },
  { id: "C002", name: "Grade 10-B", code: "G10B", capacity: 30, roomNumber: "Room 102", teacherId: "T102", status: "active" },
  { id: "C003", name: "Grade 11-A", code: "G11A", capacity: 40, roomNumber: "Room 201", teacherId: "T103", status: "active" },
  { id: "C004", name: "Grade 11-B", code: "G11B", capacity: 35, roomNumber: "Room 202", teacherId: "T104", status: "inactive" },
  { id: "C005", name: "Grade 12-A", code: "G12A", capacity: 30, roomNumber: "Lab 1", teacherId: "T105", status: "active" }
];

// Initial subjects dataset
const INITIAL_SUBJECTS = [
  { id: "S001", name: "Advanced Algebra", code: "MTH-401", department: "Mathematics", credits: 4, description: "Trigonometry and algebraic equations.", status: "active", assignedClasses: ["C001", "C002"], teacherId: "T101" },
  { id: "S002", name: "General Chemistry", code: "CHM-302", department: "Science", credits: 3, description: "Introduction to chemical structures and reactions.", status: "active", assignedClasses: ["C001", "C002", "C003"], teacherId: "T102" },
  { id: "S003", name: "English Literature", code: "ENG-101", department: "Languages", credits: 3, description: "Survey of classic and contemporary literature.", status: "active", assignedClasses: ["C001", "C002", "C003", "C004"], teacherId: "T103" },
  { id: "S004", name: "World History", code: "HIS-202", department: "Humanities", credits: 3, description: "Major events in human history from medieval to modern era.", status: "active", assignedClasses: ["C003", "C004"], teacherId: "T109" },
  { id: "S005", name: "Intro to Python", code: "CS-101", department: "Computer Science", credits: 4, description: "Basics of coding logic and algorithms in Python.", status: "inactive", assignedClasses: ["C005"], teacherId: "T105" }
];

// LocalStorage helpers
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

// Initialize datasets in local storage if not present
const loadDb = () => {
  const teachers = getStoredData("academic_teachers", INITIAL_TEACHERS);
  const classes = getStoredData("academic_classes", INITIAL_CLASSES);
  const subjects = getStoredData("academic_subjects", INITIAL_SUBJECTS);
  
  // Make sure they exist in store
  setStoredData("academic_teachers", teachers);
  setStoredData("academic_classes", classes);
  setStoredData("academic_subjects", subjects);
  
  return { teachers, classes, subjects };
};

const delayResponse = (result) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result);
    }, DELAY);
  });
};

export const academicService = {
  // --- Teachers ---
  async getTeachers() {
    const { teachers } = loadDb();
    return delayResponse(teachers);
  },

  // --- Classes ---
  async getClasses() {
    const { classes } = loadDb();
    return delayResponse(classes);
  },

  async getClassById(id) {
    const { classes } = loadDb();
    const item = classes.find(c => c.id === id);
    if (!item) throw new Error("Class not found.");
    return delayResponse(item);
  },

  async addClass(classData) {
    const { classes } = loadDb();
    
    // Validations
    if (!classData.name?.trim()) throw new Error("Class Name is required.");
    if (!classData.code?.trim()) throw new Error("Class Code is required.");
    if (!classData.roomNumber?.trim()) throw new Error("Room Number is required.");
    
    const codeUpper = classData.code.trim().toUpperCase();
    if (classes.some(c => c.code.toUpperCase() === codeUpper)) {
      throw new Error(`Class Code "${codeUpper}" already exists.`);
    }
    
    const capacityNum = Number(classData.capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      throw new Error("Capacity must be a valid positive number.");
    }

    const newClass = {
      id: "C" + Math.floor(Math.random() * 9000 + 1000),
      name: classData.name.trim(),
      code: codeUpper,
      capacity: capacityNum,
      roomNumber: classData.roomNumber.trim(),
      teacherId: classData.teacherId || "",
      status: classData.status || "active"
    };

    classes.push(newClass);
    setStoredData("academic_classes", classes);
    return delayResponse(newClass);
  },

  async updateClass(id, classData) {
    const { classes } = loadDb();
    const index = classes.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Class not found.");

    // Validations
    if (!classData.name?.trim()) throw new Error("Class Name is required.");
    if (!classData.code?.trim()) throw new Error("Class Code is required.");
    if (!classData.roomNumber?.trim()) throw new Error("Room Number is required.");

    const codeUpper = classData.code.trim().toUpperCase();
    const duplicate = classes.find(c => c.code.toUpperCase() === codeUpper && c.id !== id);
    if (duplicate) {
      throw new Error(`Class Code "${codeUpper}" already exists on another class.`);
    }

    const capacityNum = Number(classData.capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      throw new Error("Capacity must be a valid positive number.");
    }

    classes[index] = {
      ...classes[index],
      name: classData.name.trim(),
      code: codeUpper,
      capacity: capacityNum,
      roomNumber: classData.roomNumber.trim(),
      teacherId: classData.teacherId || "",
      status: classData.status || "active"
    };

    setStoredData("academic_classes", classes);
    return delayResponse(classes[index]);
  },

  async deleteClass(id) {
    const { classes, subjects } = loadDb();
    const updatedClasses = classes.filter(c => c.id !== id);
    
    if (updatedClasses.length === classes.length) {
      throw new Error("Class not found.");
    }

    // Cascade: Remove this class ID from all assigned subjects
    const updatedSubjects = subjects.map(subj => {
      if (subj.assignedClasses && subj.assignedClasses.includes(id)) {
        return {
          ...subj,
          assignedClasses: subj.assignedClasses.filter(cId => cId !== id)
        };
      }
      return subj;
    });

    setStoredData("academic_classes", updatedClasses);
    setStoredData("academic_subjects", updatedSubjects);
    return delayResponse(true);
  },

  // --- Subjects ---
  async getSubjects() {
    const { subjects } = loadDb();
    return delayResponse(subjects);
  },

  async getSubjectById(id) {
    const { subjects } = loadDb();
    const item = subjects.find(s => s.id === id);
    if (!item) throw new Error("Subject not found.");
    return delayResponse(item);
  },

  async addSubject(subjectData) {
    const { subjects } = loadDb();

    // Validations
    if (!subjectData.name?.trim()) throw new Error("Subject Name is required.");
    if (!subjectData.code?.trim()) throw new Error("Subject Code is required.");
    if (!subjectData.department?.trim()) throw new Error("Department is required.");

    const codeUpper = subjectData.code.trim().toUpperCase();
    if (subjects.some(s => s.code.toUpperCase() === codeUpper)) {
      throw new Error(`Subject Code "${codeUpper}" already exists.`);
    }

    const creditsNum = Number(subjectData.credits);
    if (isNaN(creditsNum) || creditsNum < 0) {
      throw new Error("Credits must be a valid non-negative number.");
    }

    const newSubject = {
      id: "S" + Math.floor(Math.random() * 9000 + 1000),
      name: subjectData.name.trim(),
      code: codeUpper,
      department: subjectData.department.trim(),
      credits: creditsNum,
      description: subjectData.description?.trim() || "",
      status: subjectData.status || "active",
      assignedClasses: subjectData.assignedClasses || [],
      teacherId: subjectData.teacherId || ""
    };

    subjects.push(newSubject);
    setStoredData("academic_subjects", subjects);
    return delayResponse(newSubject);
  },

  async updateSubject(id, subjectData) {
    const { subjects } = loadDb();
    const index = subjects.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Subject not found.");

    // Validations
    if (!subjectData.name?.trim()) throw new Error("Subject Name is required.");
    if (!subjectData.code?.trim()) throw new Error("Subject Code is required.");
    if (!subjectData.department?.trim()) throw new Error("Department is required.");

    const codeUpper = subjectData.code.trim().toUpperCase();
    const duplicate = subjects.find(s => s.code.toUpperCase() === codeUpper && s.id !== id);
    if (duplicate) {
      throw new Error(`Subject Code "${codeUpper}" already exists on another subject.`);
    }

    const creditsNum = Number(subjectData.credits);
    if (isNaN(creditsNum) || creditsNum < 0) {
      throw new Error("Credits must be a valid non-negative number.");
    }

    subjects[index] = {
      ...subjects[index],
      name: subjectData.name.trim(),
      code: codeUpper,
      department: subjectData.department.trim(),
      credits: creditsNum,
      description: subjectData.description?.trim() || "",
      status: subjectData.status || "active"
    };

    setStoredData("academic_subjects", subjects);
    return delayResponse(subjects[index]);
  },

  async deleteSubject(id) {
    const { subjects } = loadDb();
    const updatedSubjects = subjects.filter(s => s.id !== id);
    if (updatedSubjects.length === subjects.length) {
      throw new Error("Subject not found.");
    }
    setStoredData("academic_subjects", updatedSubjects);
    return delayResponse(true);
  },

  async toggleSubjectStatus(id) {
    const { subjects } = loadDb();
    const index = subjects.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Subject not found.");

    const newStatus = subjects[index].status === "active" ? "inactive" : "active";
    subjects[index] = {
      ...subjects[index],
      status: newStatus
    };

    setStoredData("academic_subjects", subjects);
    return delayResponse(subjects[index]);
  },

  async assignSubjectDetails(id, { teacherId, assignedClasses }) {
    const { subjects } = loadDb();
    const index = subjects.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Subject not found.");

    subjects[index] = {
      ...subjects[index],
      teacherId: teacherId || "",
      assignedClasses: assignedClasses || []
    };

    setStoredData("academic_subjects", subjects);
    return delayResponse(subjects[index]);
  }
};
