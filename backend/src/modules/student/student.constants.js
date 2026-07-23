const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TRANSFERRED: 'transferred',
  ALUMNI: 'alumni'
};

const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DOCUMENT_CATEGORIES = {
  BIRTH_CERTIFICATE: 'birth_certificate',
  AADHAAR: 'aadhaar',
  TRANSFER_CERTIFICATE: 'tc',
  MEDICAL_CERTIFICATE: 'medical',
  REPORT_CARD: 'report_card',
  OTHER: 'other'
};

const CERTIFICATE_TYPES = {
  BONAFIDE: 'bonafide',
  STUDY: 'study',
  CHARACTER: 'character',
  TRANSFER: 'transfer',
  LEAVING: 'leaving'
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALFDAY: 'halfday'
};

module.exports = {
  STUDENT_STATUS,
  GENDER,
  BLOOD_GROUPS,
  DOCUMENT_CATEGORIES,
  CERTIFICATE_TYPES,
  ATTENDANCE_STATUS
};
