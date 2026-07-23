/**
 * Certificate Layout Template Data Builder.
 */
const buildCertificateTemplate = (type, student, certificateNo) => {
  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const templates = {
    bonafide: {
      title: 'BONAFIDE CERTIFICATE',
      certificateNo,
      issueDate,
      body: `This is to certify that ${student.firstName} ${student.lastName}, son/daughter of ${student.parentName || 'Parent'}, Admission No: ${student.admissionNo}, is a bonafide student of this institution studying in ${student.class}, Section ${student.section} for the Academic Session ${student.academicYear || '2026-2027'}.`,
      remarks: 'He/She bears good moral character and conduct.'
    },
    study: {
      title: 'STUDY CERTIFICATE',
      certificateNo,
      issueDate,
      body: `This certificate confirms that ${student.firstName} ${student.lastName} has continuously studied in ${student.class} during the academic period ${student.academicYear || '2026-2027'} in English medium under ${student.board || 'CBSE'} board syllabus.`,
      remarks: 'Issued upon student request.'
    },
    character: {
      title: 'CHARACTER & CONDUCT CERTIFICATE',
      certificateNo,
      issueDate,
      body: `This is to certify that ${student.firstName} ${student.lastName} has been a student of ${student.class} during session ${student.academicYear || '2026-2027'}. To the best of our knowledge, his/her conduct and behavior have been exemplary.`,
      remarks: 'We wish him/her all success in future endeavors.'
    },
    transfer: {
      title: 'TRANSFER CERTIFICATE (TC)',
      certificateNo,
      issueDate,
      body: `This Transfer Certificate certifies that ${student.firstName} ${student.lastName} (Admission No: ${student.admissionNo}) has been officially struck off the school registers. All school dues have been cleared.`,
      remarks: 'Reason for leaving: School Transfer / Course Completion.'
    }
  };

  return templates[type] || templates.bonafide;
};

module.exports = { buildCertificateTemplate };
