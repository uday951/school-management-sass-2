const parentRepository = require('./parent.repository');
const ApiError = require('../../utils/apiError.util');

class ParentService {
  async getParentList(queryParams = {}) {
    const { search = '', status = '', page = 1, limit = 10 } = queryParams;
    const result = await parentRepository.findAll({ search, status, page, limit });
    return result;
  }

  async getParentById(id) {
    if (!id) throw ApiError.badRequest('Parent ID is required.');
    const parent = await parentRepository.findById(id);
    if (!parent) throw ApiError.notFound('Parent not found.');

    const [guardians, linkedStudents, documents, communications] = await Promise.all([
      parentRepository.getGuardians(id),
      parentRepository.getLinkedStudents(id),
      parentRepository.getDocuments(id),
      parentRepository.getCommunications(id)
    ]);

    return {
      ...parent,
      guardians,
      linkedStudents,
      documents,
      communications
    };
  }

  async createParent(parentData) {
    if (!parentData.name || !parentData.name.trim()) {
      throw ApiError.badRequest('Parent full name is required.');
    }
    if (!parentData.phone || !parentData.phone.trim()) {
      throw ApiError.badRequest('Parent phone number is required.');
    }

    const parent = await parentRepository.createParent(parentData);
    return parent;
  }

  async updateParent(id, updateData) {
    if (!id) throw ApiError.badRequest('Parent ID is required.');
    const existing = await parentRepository.findById(id);
    if (!existing) throw ApiError.notFound('Parent record not found.');

    const updated = await parentRepository.updateParent(id, updateData);
    return updated;
  }

  async deleteParent(id) {
    if (!id) throw ApiError.badRequest('Parent ID is required.');
    const existing = await parentRepository.findById(id);
    if (!existing) throw ApiError.notFound('Parent record not found.');

    await parentRepository.softDelete(id);
    return { message: 'Parent deleted successfully.' };
  }

  // --- Student Linking ---
  async getLinkedStudents(parentId) {
    if (!parentId) throw ApiError.badRequest('Parent ID is required.');
    return parentRepository.getLinkedStudents(parentId);
  }

  async linkStudent(parentId, studentId, relationship = 'Parent', isPrimary = true) {
    if (!parentId) throw ApiError.badRequest('Parent ID is required.');
    if (!studentId) throw ApiError.badRequest('Student ID is required.');

    try {
      const result = await parentRepository.linkStudent(parentId, studentId, relationship, isPrimary);
      return result;
    } catch (err) {
      if (err.message.includes('already linked') || err.code === 11000) {
        throw ApiError.badRequest('This student is already linked to the parent.');
      }
      if (err.message.includes('does not exist')) {
        throw ApiError.notFound(err.message);
      }
      throw ApiError.badRequest(err.message);
    }
  }

  async unlinkStudent(parentId, studentId) {
    if (!parentId || !studentId) throw ApiError.badRequest('Parent ID and Student ID are required.');
    return parentRepository.unlinkStudent(parentId, studentId);
  }

  // --- Guardians ---
  async addGuardian(parentId, guardianData) {
    if (!parentId) throw ApiError.badRequest('Parent ID is required.');
    if (!guardianData.guardianName) throw ApiError.badRequest('Guardian name is required.');
    if (!guardianData.phone) throw ApiError.badRequest('Guardian phone number is required.');

    return parentRepository.addGuardian(parentId, guardianData);
  }

  // --- Documents ---
  async getDocuments(parentId) {
    if (!parentId) throw ApiError.badRequest('Parent ID is required.');
    return parentRepository.getDocuments(parentId);
  }

  async addDocument(parentId, docData) {
    if (!parentId) throw ApiError.badRequest('Parent ID is required.');
    if (!docData.documentName) throw ApiError.badRequest('Document name is required.');
    if (!docData.fileUrl) throw ApiError.badRequest('Document file URL is required.');

    return parentRepository.addDocument(parentId, docData);
  }

  async deleteDocument(parentId, docId) {
    if (!parentId || !docId) throw ApiError.badRequest('Parent ID and Document ID are required.');
    return parentRepository.deleteDocument(docId);
  }

  // --- Communications ---
  async getCommunications(parentId) {
    if (!parentId) throw ApiError.badRequest('Parent ID is required.');
    return parentRepository.getCommunications(parentId);
  }

  async addCommunication(parentId, commData) {
    if (!parentId) throw ApiError.badRequest('Parent ID is required.');
    if (!commData.title || !commData.message) {
      throw ApiError.badRequest('Communication title and message are required.');
    }
    return parentRepository.addCommunication(parentId, commData);
  }

  // --- Bulk Import Parents & Linked Students ---
  async importParents(records = []) {
    if (!Array.isArray(records) || records.length === 0) {
      throw ApiError.badRequest('No valid parent records provided for bulk import.');
    }

    let importedCount = 0;
    let linkedCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      try {
        const parentName = rec.name || rec.parentName || rec.fullName;
        const parentPhone = rec.phone || rec.parentPhone;

        if (!parentName || !parentPhone) {
          errors.push(`Row ${i + 1}: Missing parent name or phone number.`);
          continue;
        }

        const parent = await this.createParent({
          name: parentName,
          relationship: rec.relationship || 'Father',
          email: rec.email || '',
          phone: parentPhone,
          altPhone: rec.altPhone || '',
          address: rec.address || '',
          city: rec.city || '',
          state: rec.state || '',
          occupation: rec.occupation || '',
          guardianName: rec.guardianName || '',
          guardianPhone: rec.guardianPhone || ''
        });
        importedCount++;

        const studentRef = rec.admissionNo || rec.studentAdmissionNo || rec.studentId;
        if (studentRef && parent) {
          const parentId = parent._id || parent.id;
          try {
            await this.linkStudent(parentId, studentRef, rec.relationship || 'Parent', true);
            linkedCount++;
          } catch (_linkErr) {
            // Ignore link error
          }
        }
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return { importedCount, totalParsed: records.length, linkedCount, errors };
  }

  // --- Parent Portal Feature Services ---
  async getDashboard(parentId, studentId) {
    return parentRepository.getDashboardData(parentId, studentId);
  }

  async getChildren(parentId) {
    return parentRepository.getChildren(parentId);
  }

  async getChildProfile(childId) {
    return parentRepository.getChildProfile(childId);
  }

  async getAttendanceSummary(childId) {
    return parentRepository.getAttendanceSummary(childId);
  }

  async getTimetable(childId) {
    return parentRepository.getTimetable(childId);
  }

  async getCalendar() {
    return parentRepository.getCalendar();
  }
}

module.exports = new ParentService();
