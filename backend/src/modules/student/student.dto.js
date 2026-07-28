/**
 * Transform raw Mongoose student document into clean DTO response structure.
 */
const toStudentDTO = (student, parent = null) => {
  if (!student) return null;

  return {
    id: student._id ? student._id.toString() : student.id,
    admissionNo: student.admissionNo,
    admissionDate: student.admissionDate,
    rollNo: student.rollNo,
    name: `${student.firstName} ${student.lastName}`.trim(),
    firstName: student.firstName,
    middleName: student.middleName || '',
    lastName: student.lastName,
    class: student.class,
    section: student.section,
    gender: student.gender,
    dob: student.dob,
    bloodGroup: student.bloodGroup,
    religion: student.religion,
    nationality: student.nationality,
    campus: student.campus,
    academicYear: student.academicYear,
    house: student.house,
    board: student.board,
    medium: student.medium,
    phone: student.phone,
    email: student.email,
    address: student.address,
    city: student.city,
    state: student.state,
    country: student.country,
    pinCode: student.pinCode,
    status: student.status,
    passoutYear: student.passoutYear,
    avatarUrl: student.avatarUrl || '',
    parentName: parent ? (parent.fatherName || parent.guardianName || 'N/A') : 'N/A',
    parentPhone: parent ? parent.parentPhone : '',
    parentEmail: parent ? parent.parentEmail : '',
    createdAt: student.createdAt,
    updatedAt: student.updatedAt
  };
};

/**
 * Transform aggregated 10-tab profile data into standard API payload structure.
 */
const toStudentProfileDTO = (
  student, 
  parent, 
  medical, 
  documents, 
  attendanceRecords = [], 
  studentFees = [], 
  subjectsList = [], 
  timetableList = [],
  transport = null
) => {
  // Dynamic Attendance calculations
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
  const lateDays = attendanceRecords.filter(r => r.status === 'late').length;
  const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 95;

  const attendanceList = attendanceRecords.map(r => ({
    date: r.date,
    day: new Date(r.date).getDate(),
    title: r.status.charAt(0).toUpperCase() + r.status.slice(1),
    status: r.status
  }));

  // Dynamic Fees calculations
  const totalFees = studentFees.reduce((acc, f) => acc + (f.totalAmount || f.amount || 0), 0);
  const paidFees = studentFees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const pendingFees = studentFees.reduce((acc, f) => acc + (f.pendingAmount || 0), 0);
  
  let feeStatus = 'unpaid';
  if (totalFees > 0) {
    if (pendingFees === 0) feeStatus = 'paid';
    else if (paidFees > 0) feeStatus = 'partial';
  }

  const feesList = studentFees.map(f => ({
    id: f._id ? f._id.toString() : '',
    invoiceCode: f._id ? `INV-${new Date(f.createdAt || Date.now()).getFullYear()}-${f._id.toString().substring(18)}`.toUpperCase() : 'INV-2026',
    categoryName: f.feeStructureId?.category?.name || 'Term Fees',
    totalAmount: f.totalAmount || f.amount || 0,
    paidAmount: f.paidAmount || 0,
    pendingAmount: f.pendingAmount || 0,
    dueDate: f.feeStructureId?.dueDate || new Date(),
    status: f.status
  }));

  // Dynamic Subjects mapping
  const mappedSubjects = subjectsList.map(s => ({
    id: s._id ? s._id.toString() : '',
    subjectName: s.subjectName || s.name || '',
    subjectCode: s.subjectCode || s.code || '',
    credits: s.credits || 0,
    teacherName: s.teacher ? `${s.teacher.firstName || ''} ${s.teacher.lastName || ''}`.trim() : 'N/A'
  }));

  // Dynamic Timetable mapping
  const mappedTimetable = timetableList.map(t => ({
    day: t.day,
    period: t.period,
    subject: t.subject,
    teacher: t.teacher,
    room: t.room
  }));

  return {
    ...toStudentDTO(student, parent),
    // Pass calculated metrics to override fallback totals
    attendancePercent,
    totalFees,
    paidFees,
    pendingFees,
    parentDetails: parent ? {
      fatherName: parent.fatherName,
      motherName: parent.motherName,
      guardianName: parent.guardianName,
      occupation: parent.occupation,
      parentPhone: parent.parentPhone,
      parentEmail: parent.parentEmail,
      emergencyName: parent.emergencyName,
      emergencyPhone: parent.emergencyPhone,
      emergencyRelation: parent.emergencyRelation
    } : {},
    medicalRecords: medical ? {
      bloodGroup: medical.bloodGroup,
      heightCm: medical.heightCm,
      weightKg: medical.weightKg,
      allergies: medical.allergies || [],
      medicalConditions: medical.medicalConditions || [],
      vaccinations: medical.vaccinations || [],
      doctorNotes: medical.doctorNotes
    } : {
      bloodGroup: student.bloodGroup || 'O+',
      heightCm: 0,
      weightKg: 0,
      allergies: [],
      medicalConditions: [],
      vaccinations: [],
      doctorNotes: 'No medical history recorded.'
    },
    documents: documents.map(d => ({
      id: d._id.toString(),
      name: d.name,
      category: d.category,
      url: d.url,
      size: d.size,
      fileType: d.fileType
    })),
    attendanceSummary: {
      attendancePercent,
      presentDays: presentDays,
      absentDays: absentDays,
      lateDays: lateDays
    },
    attendanceList: attendanceList,
    feesSummary: {
      totalFees,
      paidFees,
      pendingFees,
      status: feeStatus
    },
    feesList: feesList,
    subjects: mappedSubjects,
    timetable: mappedTimetable,
    examSummary: {
      gpa: '0.00',
      rank: 'N/A',
      recentMarks: []
    },
    transport: transport ? {
      vehicleNo: transport.routeId?.assignedVehicle?.vehicleNo || 'N/A',
      driverName: transport.routeId?.assignedDriver?.name || 'N/A',
      driverPhone: transport.routeId?.assignedDriver?.phone || 'N/A',
      routeName: transport.routeId?.routeName || 'N/A',
      routeCode: transport.routeId?.routeCode || 'N/A',
      pickupStop: transport.pickupStopId?.stopName || 'N/A',
      dropStop: transport.dropStopId?.stopName || 'N/A',
      status: transport.status || 'inactive'
    } : null
  };
};

module.exports = { toStudentDTO, toStudentProfileDTO };
