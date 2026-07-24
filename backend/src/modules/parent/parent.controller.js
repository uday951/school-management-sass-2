const parentService = require('./parent.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');

class ParentController {
  // GET /api/v1/parents
  getParents = asyncHandler(async (req, res) => {
    const { parents, total, page, limit, totalPages } = await parentService.getParentList(req.query);
    return sendPaginated(res, 'Parent records retrieved successfully.', parents, {
      totalRecords: total,
      currentPage: page,
      limit,
      totalPages
    });
  });

  // GET /api/v1/parents/:id
  getParentById = asyncHandler(async (req, res) => {
    const parent = await parentService.getParentById(req.params.id);
    return sendSuccess(res, 'Parent details retrieved successfully.', parent);
  });

  // POST /api/v1/parents
  createParent = asyncHandler(async (req, res) => {
    const parent = await parentService.createParent(req.body);
    return sendCreated(res, 'Parent created successfully.', parent);
  });

  // PUT /api/v1/parents/:id
  updateParent = asyncHandler(async (req, res) => {
    const parent = await parentService.updateParent(req.params.id, req.body);
    return sendSuccess(res, 'Parent updated successfully.', parent);
  });

  // DELETE /api/v1/parents/:id
  deleteParent = asyncHandler(async (req, res) => {
    const result = await parentService.deleteParent(req.params.id);
    return sendSuccess(res, result.message);
  });

  // GET /api/v1/parents/:id/students
  getLinkedStudents = asyncHandler(async (req, res) => {
    const students = await parentService.getLinkedStudents(req.params.id);
    return sendSuccess(res, 'Linked student records retrieved.', students);
  });

  // POST /api/v1/parents/:id/link-student
  linkStudent = asyncHandler(async (req, res) => {
    const { studentId, relationship, isPrimary } = req.body;
    const mapping = await parentService.linkStudent(req.params.id, studentId, relationship, isPrimary);
    return sendCreated(res, 'Student linked to parent successfully.', mapping);
  });

  // DELETE /api/v1/parents/:id/unlink-student/:studentId
  unlinkStudent = asyncHandler(async (req, res) => {
    const result = await parentService.unlinkStudent(req.params.id, req.params.studentId);
    return sendSuccess(res, result.message);
  });

  // GET /api/v1/parents/:id/guardians
  getGuardians = asyncHandler(async (req, res) => {
    const guardians = await parentService.getGuardians(req.params.id);
    return sendSuccess(res, 'Guardians retrieved successfully.', guardians);
  });

  // POST /api/v1/parents/:id/guardians
  addGuardian = asyncHandler(async (req, res) => {
    const guardian = await parentService.addGuardian(req.params.id, req.body);
    return sendCreated(res, 'Guardian added successfully.', guardian);
  });

  // GET /api/v1/parents/:id/documents
  getDocuments = asyncHandler(async (req, res) => {
    const documents = await parentService.getDocuments(req.params.id);
    return sendSuccess(res, 'Parent documents retrieved.', documents);
  });

  // POST /api/v1/parents/:id/documents
  uploadDocument = asyncHandler(async (req, res) => {
    let fileUrl = req.body.fileUrl || '';
    let publicId = req.body.publicId || '';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      publicId = req.file.filename;
    }

    const docData = {
      documentName: req.body.documentName || req.file?.originalname || 'Parent Document',
      documentType: req.body.documentType || 'Identity Proof',
      fileUrl,
      publicId
    };

    const doc = await parentService.addDocument(req.params.id, docData);
    return sendCreated(res, 'Document uploaded successfully.', doc);
  });

  // DELETE /api/v1/parents/:id/documents/:docId
  deleteDocument = asyncHandler(async (req, res) => {
    const result = await parentService.deleteDocument(req.params.id, req.params.docId);
    return sendSuccess(res, result.message);
  });

  // GET /api/v1/parents/:id/communications
  getCommunications = asyncHandler(async (req, res) => {
    const comms = await parentService.getCommunications(req.params.id);
    return sendSuccess(res, 'Communication logs retrieved.', comms);
  });

  // POST /api/v1/parents/:id/communications
  addCommunication = asyncHandler(async (req, res) => {
    const comm = await parentService.addCommunication(req.params.id, req.body);
    return sendCreated(res, 'Communication log recorded.', comm);
  });

  // POST /api/v1/parents/import
  importParents = asyncHandler(async (req, res) => {
    const records = Array.isArray(req.body.records) ? req.body.records : Array.isArray(req.body) ? req.body : [];
    const result = await parentService.importParents(records);
    return sendSuccess(res, `Bulk import processed. ${result.importedCount} parents imported, ${result.linkedCount} students linked.`, result);
  });
}

module.exports = new ParentController();
