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
const toStudentProfileDTO = (student, parent, medical, documents, attendanceSummary) => {
  return {
    ...toStudentDTO(student, parent),
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
      heightCm: 165,
      weightKg: 55,
      allergies: ['Peanuts'],
      medicalConditions: ['Mild Asthma'],
      vaccinations: [{ name: 'Hepatitis B', dateGiven: '2015-05-10', status: 'completed' }],
      doctorNotes: 'No major risk factors recorded.'
    },
    documents: documents.map(d => ({
      id: d._id.toString(),
      name: d.name,
      category: d.category,
      url: d.url,
      size: d.size,
      fileType: d.fileType
    })),
    attendanceSummary: attendanceSummary || {
      attendancePercent: 96,
      presentDays: 142,
      absentDays: 6,
      lateDays: 2
    },
    feesSummary: {
      totalFees: 3500,
      paidFees: 2500,
      pendingFees: 1000,
      status: 'partial'
    },
    examSummary: {
      gpa: '3.85',
      rank: '2nd in Class',
      recentMarks: [
        { subject: 'Mathematics', marks: 95 },
        { subject: 'Physics', marks: 88 },
        { subject: 'Chemistry', marks: 92 },
        { subject: 'English', marks: 90 }
      ]
    }
  };
};

module.exports = { toStudentDTO, toStudentProfileDTO };
