const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');
const libraryService = require('./library.service');

// ─── DASHBOARD CONTROLLER ─────────────────────────────────────────────────────

const getDashboardData = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const data = await libraryService.getLibraryDashboardData(tenantId);
  return sendSuccess(res, 'Library dashboard metrics retrieved successfully', data);
});

// ─── CATEGORY CONTROLLERS ─────────────────────────────────────────────────────

const getCategories = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await libraryService.getCategories(req.query, tenantId);
  return sendPaginated(res, 'Book categories retrieved successfully', data, pagination);
});

const createCategory = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const category = await libraryService.createCategory(req.body, tenantId);
  return sendCreated(res, 'Book category created successfully', category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const category = await libraryService.updateCategory(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Book category updated successfully', category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await libraryService.deleteCategory(req.params.id, tenantId);
  return sendSuccess(res, 'Book category deleted successfully');
});

// ─── BOOK CONTROLLERS ─────────────────────────────────────────────────────────

const getBooks = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await libraryService.getBooks(req.query, tenantId);
  return sendPaginated(res, 'Books retrieved successfully', data, pagination);
});

const createBook = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const book = await libraryService.createBook(req.body, req.file, tenantId);
  return sendCreated(res, 'Book added to catalog successfully', book);
});

const updateBook = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const book = await libraryService.updateBook(req.params.id, req.body, req.file, tenantId);
  return sendSuccess(res, 'Book details updated successfully', book);
});

const deleteBook = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await libraryService.deleteBook(req.params.id, tenantId);
  return sendSuccess(res, 'Book deleted successfully');
});

// ─── AUTHOR CONTROLLERS ───────────────────────────────────────────────────────

const getAuthors = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await libraryService.getAuthors(req.query, tenantId);
  return sendPaginated(res, 'Authors retrieved successfully', data, pagination);
});

const createAuthor = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const author = await libraryService.createAuthor(req.body, tenantId);
  return sendCreated(res, 'Author added successfully', author);
});

const updateAuthor = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const author = await libraryService.updateAuthor(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Author updated successfully', author);
});

const deleteAuthor = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await libraryService.deleteAuthor(req.params.id, tenantId);
  return sendSuccess(res, 'Author deleted successfully');
});

// ─── PUBLISHER CONTROLLERS ────────────────────────────────────────────────────

const getPublishers = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await libraryService.getPublishers(req.query, tenantId);
  return sendPaginated(res, 'Publishers retrieved successfully', data, pagination);
});

const createPublisher = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const publisher = await libraryService.createPublisher(req.body, tenantId);
  return sendCreated(res, 'Publisher added successfully', publisher);
});

const updatePublisher = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const publisher = await libraryService.updatePublisher(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Publisher updated successfully', publisher);
});

const deletePublisher = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await libraryService.deletePublisher(req.params.id, tenantId);
  return sendSuccess(res, 'Publisher deleted successfully');
});

// ─── BOOK ISSUE CONTROLLERS ───────────────────────────────────────────────────

const getBookIssues = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await libraryService.getBookIssues(req.query, tenantId);
  return sendPaginated(res, 'Book issues retrieved successfully', data, pagination);
});

const createBookIssue = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const issue = await libraryService.createBookIssue(req.body, tenantId);
  return sendCreated(res, 'Book issued successfully', issue);
});

// ─── BOOK RETURN CONTROLLERS ──────────────────────────────────────────────────

const getBookReturns = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await libraryService.getBookReturns(req.query, tenantId);
  return sendPaginated(res, 'Book returns retrieved successfully', data, pagination);
});

const createBookReturn = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const bookReturn = await libraryService.createBookReturn(req.body, tenantId);
  return sendCreated(res, 'Book returned successfully', bookReturn);
});

// ─── RESERVATION CONTROLLERS ──────────────────────────────────────────────────

const getReservations = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await libraryService.getReservations(req.query, tenantId);
  return sendPaginated(res, 'Book reservations retrieved successfully', data, pagination);
});

const createReservation = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const reservation = await libraryService.createReservation(req.body, tenantId);
  return sendCreated(res, 'Book reserved successfully', reservation);
});

const updateReservation = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const reservation = await libraryService.updateReservation(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Reservation updated successfully', reservation);
});

const deleteReservation = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await libraryService.deleteReservation(req.params.id, tenantId);
  return sendSuccess(res, 'Reservation cancelled successfully');
});

// ─── FINE CONTROLLERS ─────────────────────────────────────────────────────────

const getFines = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await libraryService.getFines(req.query, tenantId);
  return sendPaginated(res, 'Library fines retrieved successfully', data, pagination);
});

const updateFineStatus = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const fine = await libraryService.updateFineStatus(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Fine status updated successfully', fine);
});

// ─── REPORTS CONTROLLER ───────────────────────────────────────────────────────

const getLibraryReports = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const reportData = await libraryService.getLibraryReports(req.query, tenantId);
  return sendSuccess(res, 'Library report generated successfully', reportData);
});

module.exports = {
  getDashboardData,

  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  getBooks,
  createBook,
  updateBook,
  deleteBook,

  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,

  getPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher,

  getBookIssues,
  createBookIssue,

  getBookReturns,
  createBookReturn,

  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,

  getFines,
  updateFineStatus,

  getLibraryReports
};
