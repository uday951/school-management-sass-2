const BookCategory = require('./book-category.model');
const Book = require('./book.model');
const Author = require('./author.model');
const Publisher = require('./publisher.model');
const BookIssue = require('./book-issue.model');
const BookReturn = require('./book-return.model');
const Reservation = require('./reservation.model');
const LibraryFine = require('./fine.model');
const ApiError = require('../../utils/apiError.util');
const { paginate } = require('../../utils/pagination.util');
const { buildSearchQuery, buildSortQuery } = require('../../utils/search.util');
const { uploadImage, deleteFile } = require('../../utils/upload.util');

// ─── DASHBOARD SERVICE ────────────────────────────────────────────────────────

const getLibraryDashboardData = async (tenantId = 'default_tenant') => {
  const [totalBooksCount, books, activeIssues, overdueIssues, fines] = await Promise.all([
    Book.countDocuments({ tenantId }),
    Book.find({ tenantId }).lean(),
    BookIssue.countDocuments({ tenantId, status: 'issued' }),
    BookIssue.countDocuments({ tenantId, status: 'overdue' }),
    LibraryFine.find({ tenantId }).lean()
  ]);

  const availableBooksCount = books.reduce((acc, curr) => acc + (curr.availableCopies || 0), 0);
  const totalFinesCollected = fines.filter(f => f.status === 'paid').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalFinesPending = fines.filter(f => f.status === 'unpaid').reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const recentIssues = await BookIssue.find({ tenantId }).sort({ issueDate: -1 }).limit(5).lean();

  return {
    summary: {
      totalBooks: totalBooksCount,
      availableBooks: availableBooksCount,
      issuedBooks: activeIssues,
      overdueBooks: overdueIssues,
      finesCollected: totalFinesCollected,
      finesPending: totalFinesPending
    },
    recentIssues
  };
};

// ─── BOOK CATEGORY SERVICES ───────────────────────────────────────────────────

const getCategories = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'categoryName', status } = queryParams;
  const filter = { tenantId };

  if (status) filter.status = status;

  const searchQuery = buildSearchQuery(search, ['categoryName', 'description']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await BookCategory.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await BookCategory.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createCategory = async (data, tenantId = 'default_tenant') => {
  const name = data.categoryName.trim();
  const existing = await BookCategory.findOne({ tenantId, categoryName: name });
  if (existing) throw ApiError.conflict(`Category '${name}' already exists.`);

  const category = await BookCategory.create({ ...data, categoryName: name, tenantId });
  return category;
};

const updateCategory = async (id, data, tenantId = 'default_tenant') => {
  const category = await BookCategory.findOne({ _id: id, tenantId });
  if (!category) throw ApiError.notFound('Category not found.');

  if (data.categoryName && data.categoryName.trim() !== category.categoryName) {
    const name = data.categoryName.trim();
    const existing = await BookCategory.findOne({ tenantId, categoryName: name });
    if (existing) throw ApiError.conflict(`Category '${name}' already exists.`);
  }

  Object.assign(category, data);
  if (data.categoryName) category.categoryName = data.categoryName.trim();
  await category.save();
  return category;
};

const deleteCategory = async (id, tenantId = 'default_tenant') => {
  const category = await BookCategory.findOne({ _id: id, tenantId });
  if (!category) throw ApiError.notFound('Category not found.');
  await BookCategory.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── BOOK SERVICES ────────────────────────────────────────────────────────────

const getBooks = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'title', category, status } = queryParams;
  const filter = { tenantId };

  if (category) filter.category = category;
  if (status) filter.status = status;

  const searchQuery = buildSearchQuery(search, ['title', 'isbn', 'category', 'author', 'publisher', 'shelfNumber']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Book.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Book.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createBook = async (data, file = null, tenantId = 'default_tenant') => {
  const isbnCode = data.isbn.trim().toUpperCase();
  const existing = await Book.findOne({ tenantId, isbn: isbnCode });
  if (existing) throw ApiError.conflict(`Book with ISBN '${isbnCode}' already exists.`);

  let coverUrl = null;
  let coverPublicId = null;

  if (file) {
    const uploaded = await uploadImage(file.path, 'library/covers');
    coverUrl = uploaded.url;
    coverPublicId = uploaded.publicId;
  }

  const quantity = parseInt(data.quantity, 10) || 1;
  const availableCopies = data.availableCopies !== undefined ? parseInt(data.availableCopies, 10) : quantity;

  const book = await Book.create({
    ...data,
    isbn: isbnCode,
    quantity,
    availableCopies,
    tenantId,
    coverUrl,
    coverPublicId
  });

  return book;
};

const updateBook = async (id, data, file = null, tenantId = 'default_tenant') => {
  const book = await Book.findOne({ _id: id, tenantId });
  if (!book) throw ApiError.notFound('Book not found.');

  if (data.isbn && data.isbn.trim().toUpperCase() !== book.isbn) {
    const isbnCode = data.isbn.trim().toUpperCase();
    const existing = await Book.findOne({ tenantId, isbn: isbnCode });
    if (existing) throw ApiError.conflict(`Book with ISBN '${isbnCode}' already exists.`);
  }

  if (file) {
    if (book.coverPublicId) {
      await deleteFile(book.coverPublicId).catch(() => {});
    }
    const uploaded = await uploadImage(file.path, 'library/covers');
    book.coverUrl = uploaded.url;
    book.coverPublicId = uploaded.publicId;
  }

  Object.assign(book, data);
  if (data.isbn) book.isbn = data.isbn.trim().toUpperCase();
  await book.save();
  return book;
};

const deleteBook = async (id, tenantId = 'default_tenant') => {
  const book = await Book.findOne({ _id: id, tenantId });
  if (!book) throw ApiError.notFound('Book not found.');

  if (book.coverPublicId) {
    await deleteFile(book.coverPublicId).catch(() => {});
  }

  await Book.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── AUTHOR SERVICES ──────────────────────────────────────────────────────────

const getAuthors = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'name' } = queryParams;
  const filter = { tenantId };

  const searchQuery = buildSearchQuery(search, ['name', 'nationality', 'biography']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Author.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Author.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createAuthor = async (data, tenantId = 'default_tenant') => {
  const name = data.name.trim();
  const existing = await Author.findOne({ tenantId, name });
  if (existing) throw ApiError.conflict(`Author '${name}' already exists.`);

  const author = await Author.create({ ...data, name, tenantId });
  return author;
};

const updateAuthor = async (id, data, tenantId = 'default_tenant') => {
  const author = await Author.findOne({ _id: id, tenantId });
  if (!author) throw ApiError.notFound('Author not found.');

  if (data.name && data.name.trim() !== author.name) {
    const name = data.name.trim();
    const existing = await Author.findOne({ tenantId, name });
    if (existing) throw ApiError.conflict(`Author '${name}' already exists.`);
  }

  Object.assign(author, data);
  if (data.name) author.name = data.name.trim();
  await author.save();
  return author;
};

const deleteAuthor = async (id, tenantId = 'default_tenant') => {
  const author = await Author.findOne({ _id: id, tenantId });
  if (!author) throw ApiError.notFound('Author not found.');
  await Author.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── PUBLISHER SERVICES ───────────────────────────────────────────────────────

const getPublishers = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'publisherName' } = queryParams;
  const filter = { tenantId };

  const searchQuery = buildSearchQuery(search, ['publisherName', 'contact', 'address']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Publisher.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Publisher.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createPublisher = async (data, tenantId = 'default_tenant') => {
  const name = data.publisherName.trim();
  const existing = await Publisher.findOne({ tenantId, publisherName: name });
  if (existing) throw ApiError.conflict(`Publisher '${name}' already exists.`);

  const publisher = await Publisher.create({ ...data, publisherName: name, tenantId });
  return publisher;
};

const updatePublisher = async (id, data, tenantId = 'default_tenant') => {
  const publisher = await Publisher.findOne({ _id: id, tenantId });
  if (!publisher) throw ApiError.notFound('Publisher not found.');

  if (data.publisherName && data.publisherName.trim() !== publisher.publisherName) {
    const name = data.publisherName.trim();
    const existing = await Publisher.findOne({ tenantId, publisherName: name });
    if (existing) throw ApiError.conflict(`Publisher '${name}' already exists.`);
  }

  Object.assign(publisher, data);
  if (data.publisherName) publisher.publisherName = data.publisherName.trim();
  await publisher.save();
  return publisher;
};

const deletePublisher = async (id, tenantId = 'default_tenant') => {
  const publisher = await Publisher.findOne({ _id: id, tenantId });
  if (!publisher) throw ApiError.notFound('Publisher not found.');
  await Publisher.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── BOOK ISSUE SERVICES (AUTOMATIC AVAILABILITY DECREMENT) ─────────────────

const getBookIssues = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-issueDate', status } = queryParams;
  const filter = { tenantId };

  if (status) filter.status = status;

  const searchQuery = buildSearchQuery(search, ['member', 'book', 'isbn', 'issueDate', 'dueDate']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await BookIssue.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await BookIssue.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createBookIssue = async (data, tenantId = 'default_tenant') => {
  const isbnCode = data.isbn ? data.isbn.trim().toUpperCase() : '';
  const bookTitle = data.book ? data.book.trim() : '';

  let book = await Book.findOne({
    tenantId,
    $or: [{ isbn: isbnCode }, { title: bookTitle }]
  });

  if (!book) {
    // Auto-create book in inventory if missing
    book = await Book.create({
      tenantId,
      isbn: isbnCode || `ISBN-${Date.now()}`,
      title: bookTitle || 'Uncategorized Book',
      category: 'General',
      author: 'General Author',
      publisher: 'General Publisher',
      quantity: 5,
      availableCopies: 5,
      status: 'available'
    });
  }

  if (book.availableCopies <= 0) {
    throw ApiError.conflict(`Book '${book.title}' is currently out of stock.`);
  }

  const existingActive = await BookIssue.findOne({
    tenantId,
    member: data.member.trim(),
    isbn: book.isbn,
    status: 'issued'
  });
  if (existingActive) {
    throw ApiError.conflict(`Member '${data.member}' already has an active issue of this book.`);
  }

  const issue = await BookIssue.create({
    ...data,
    isbn: book.isbn,
    book: book.title,
    tenantId,
    status: 'issued'
  });

  // Automatically decrease available copies by 1
  book.availableCopies = Math.max(0, book.availableCopies - 1);
  if (book.availableCopies === 0) book.status = 'out_of_stock';
  await book.save();

  return issue;
};

// ─── BOOK RETURN SERVICES (AUTOMATIC AVAILABILITY INCREMENT & FINE CALC) ───

const getBookReturns = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-returnDate' } = queryParams;
  const filter = { tenantId };

  const searchQuery = buildSearchQuery(search, ['member', 'book', 'returnDate', 'damageStatus']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await BookReturn.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await BookReturn.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createBookReturn = async (data, tenantId = 'default_tenant') => {
  const issue = await BookIssue.findOne({ _id: data.issueId, tenantId });
  if (!issue) throw ApiError.notFound('Book issue record not found.');

  if (issue.status === 'returned') {
    throw ApiError.badRequest('This book issue has already been returned.');
  }

  // Calculate Overdue Fine ($2 per overdue day)
  let fineAmount = 0;
  const returnDateObj = new Date(data.returnDate);
  const dueDateObj = new Date(issue.dueDate);
  if (!isNaN(returnDateObj) && !isNaN(dueDateObj) && returnDateObj > dueDateObj) {
    const diffDays = Math.ceil((returnDateObj - dueDateObj) / (1000 * 60 * 60 * 24));
    fineAmount = diffDays * 2;
  }

  const bookReturn = await BookReturn.create({
    tenantId,
    issueId: issue._id,
    member: issue.member,
    book: issue.book,
    returnDate: data.returnDate,
    fineAmount,
    damageStatus: data.damageStatus || 'None',
    remarks: data.remarks || ''
  });

  // Mark issue as returned
  issue.status = 'returned';
  await issue.save();

  // Automatically increase available copies by 1
  const book = await Book.findOne({ tenantId, isbn: issue.isbn });
  if (book) {
    book.availableCopies += 1;
    if (book.availableCopies > 0) book.status = 'available';
    await book.save();
  }

  // Create fine record if late
  if (fineAmount > 0) {
    await LibraryFine.create({
      tenantId,
      issueId: issue._id,
      member: issue.member,
      book: issue.book,
      amount: fineAmount,
      status: 'unpaid',
      remarks: `Overdue fine for ${issue.book}`
    });
  }

  return bookReturn;
};

// ─── RESERVATION SERVICES ────────────────────────────────────────────────────

const getReservations = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-reservationDate', status } = queryParams;
  const filter = { tenantId };

  if (status) filter.status = status;

  const searchQuery = buildSearchQuery(search, ['member', 'book', 'reservationDate']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Reservation.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Reservation.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createReservation = async (data, tenantId = 'default_tenant') => {
  const existing = await Reservation.findOne({
    tenantId,
    member: data.member.trim(),
    book: data.book.trim(),
    status: 'pending'
  });
  if (existing) throw ApiError.conflict(`Member '${data.member}' already has a pending reservation for '${data.book}'.`);

  const reservation = await Reservation.create({ ...data, tenantId, status: 'pending' });
  return reservation;
};

const updateReservation = async (id, data, tenantId = 'default_tenant') => {
  const reservation = await Reservation.findOne({ _id: id, tenantId });
  if (!reservation) throw ApiError.notFound('Reservation not found.');

  Object.assign(reservation, data);
  await reservation.save();
  return reservation;
};

const deleteReservation = async (id, tenantId = 'default_tenant') => {
  const reservation = await Reservation.findOne({ _id: id, tenantId });
  if (!reservation) throw ApiError.notFound('Reservation not found.');
  await Reservation.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── FINE MANAGEMENT SERVICES ────────────────────────────────────────────────

const getFines = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-createdAt', status } = queryParams;
  const filter = { tenantId };

  if (status) filter.status = status;

  const searchQuery = buildSearchQuery(search, ['member', 'book', 'remarks']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await LibraryFine.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await LibraryFine.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const updateFineStatus = async (id, data, tenantId = 'default_tenant') => {
  const fine = await LibraryFine.findOne({ _id: id, tenantId });
  if (!fine) throw ApiError.notFound('Fine record not found.');

  if (data.status === 'paid') {
    fine.status = 'paid';
    fine.paidDate = new Date().toISOString().split('T')[0];
  } else if (data.status) {
    fine.status = data.status;
  }

  await fine.save();
  return fine;
};

// ─── REPORTS SERVICE ──────────────────────────────────────────────────────────

const getLibraryReports = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { reportType = 'inventory' } = queryParams;

  if (reportType === 'inventory') {
    const data = await Book.find({ tenantId }).sort({ title: 1 }).lean();
    return { reportType, data };
  }

  if (reportType === 'issues') {
    const data = await BookIssue.find({ tenantId }).sort({ issueDate: -1 }).lean();
    return { reportType, data };
  }

  if (reportType === 'returns') {
    const data = await BookReturn.find({ tenantId }).sort({ returnDate: -1 }).lean();
    return { reportType, data };
  }

  const data = await LibraryFine.find({ tenantId }).sort({ createdAt: -1 }).lean();
  return { reportType, data };
};

module.exports = {
  getLibraryDashboardData,

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
