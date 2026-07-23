/**
 * Parse raw CSV or JSON data string into clean student record objects.
 */
const parseImportData = (rawText, fileType = 'csv') => {
  const records = [];
  
  if (fileType === 'json') {
    return JSON.parse(rawText);
  }

  // Parse CSV lines
  const lines = rawText.split('\n').filter(line => line.trim().length > 0);
  if (lines.length <= 1) return records;

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 3) continue;

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] || '';
    });

    records.push({
      admissionNo: row['admissionNo'] || row['Admission Number'] || `ADM${Math.floor(1000 + Math.random() * 9000)}`,
      rollNo: row['rollNo'] || row['Roll Number'] || `${100 + i}`,
      firstName: row['firstName'] || row['First Name'] || row['Name']?.split(' ')[0] || 'Student',
      lastName: row['lastName'] || row['Last Name'] || row['Name']?.split(' ')[1] || 'User',
      class: row['class'] || row['Class'] || 'Grade 10',
      section: row['section'] || row['Section'] || 'A',
      dob: row['dob'] || '2011-01-01',
      gender: (row['gender'] || 'male').toLowerCase(),
      parentName: row['parentName'] || row['Parent Name'] || 'Parent User',
      phone: row['phone'] || '(555) 000-0000',
      status: 'active'
    });
  }

  return records;
};

/**
 * Format student records array into CSV downloadable string.
 */
const generateExportCSV = (students) => {
  const headers = ['Admission No', 'Roll No', 'First Name', 'Last Name', 'Class', 'Section', 'Gender', 'Phone', 'Status'];
  const rows = students.map(s => [
    `"${s.admissionNo}"`,
    `"${s.rollNo}"`,
    `"${s.firstName}"`,
    `"${s.lastName}"`,
    `"${s.class}"`,
    `"${s.section}"`,
    `"${s.gender}"`,
    `"${s.phone || ''}"`,
    `"${s.status}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

module.exports = { parseImportData, generateExportCSV };
