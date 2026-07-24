const Period = require('./period.model');
const Timetable = require('./timetable.model');
const Room = require('./room.model');
const SubjectAllocation = require('./subject-allocation.model');
const SubstituteTeacher = require('./substitute.model');
const ApiError = require('../../utils/apiError.util');
const { paginate } = require('../../utils/pagination.util');
const { buildSearchQuery, buildSortQuery, buildFilterQuery } = require('../../utils/search.util');

// ─── PERIOD SERVICES ─────────────────────────────────────────────────────────

const getPeriods = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'startTime', status, isBreak } = queryParams;
  const filter = { tenantId };

  if (status) filter.status = status;
  if (isBreak !== undefined) filter.isBreak = isBreak === 'true';

  const searchQuery = buildSearchQuery(search, ['name', 'startTime', 'endTime']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Period.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Period.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createPeriod = async (data, tenantId = 'default_tenant') => {
  const existing = await Period.findOne({ tenantId, name: data.name.trim() });
  if (existing) {
    throw ApiError.conflict(`Period with name '${data.name}' already exists.`);
  }

  const period = await Period.create({ ...data, tenantId });
  return period;
};

const updatePeriod = async (id, data, tenantId = 'default_tenant') => {
  const period = await Period.findOne({ _id: id, tenantId });
  if (!period) throw ApiError.notFound('Period not found.');

  if (data.name && data.name.trim() !== period.name) {
    const existing = await Period.findOne({ tenantId, name: data.name.trim() });
    if (existing) throw ApiError.conflict(`Period with name '${data.name}' already exists.`);
  }

  Object.assign(period, data);
  await period.save();
  return period;
};

const deletePeriod = async (id, tenantId = 'default_tenant') => {
  const period = await Period.findOne({ _id: id, tenantId });
  if (!period) throw ApiError.notFound('Period not found.');
  await Period.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── TIMETABLE SERVICES WITH CONFLICT VALIDATION ────────────────────────────

const getTimetables = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 50, search = '', sort = 'day', academicYear, campus, class: className, section, day, teacher, room, subject } = queryParams;
  const filter = { tenantId };

  if (academicYear) filter.academicYear = academicYear;
  if (campus) filter.campus = campus;
  if (className) filter.class = className;
  if (section) filter.section = section;
  if (day) filter.day = day;
  if (teacher) filter.teacher = teacher;
  if (room) filter.room = room;
  if (subject) filter.subject = subject;

  const searchQuery = buildSearchQuery(search, ['class', 'section', 'subject', 'teacher', 'room', 'period', 'day']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Timetable.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Timetable.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

/**
 * Validate Timetable Slot Conflicts (Teacher double-booking, Room double-booking, Class double-booking)
 */
const validateTimetableConflict = async (data, excludeId = null, tenantId = 'default_tenant') => {
  const { day, period, teacher, room, class: className, section } = data;

  // 1. Teacher double-booking check
  const teacherConflict = await Timetable.findOne({
    tenantId,
    day,
    period,
    teacher,
    ...(_id => (excludeId ? { _id: { $ne: excludeId } } : {}))()
  });
  if (teacherConflict) {
    throw ApiError.conflict(
      `Teacher Conflict: Teacher '${teacher}' is already assigned to Class ${teacherConflict.class}-${teacherConflict.section} during ${period} on ${day}.`
    );
  }

  // 2. Room double-booking check
  const roomConflict = await Timetable.findOne({
    tenantId,
    day,
    period,
    room,
    ...(_id => (excludeId ? { _id: { $ne: excludeId } } : {}))()
  });
  if (roomConflict) {
    throw ApiError.conflict(
      `Room Conflict: Room '${room}' is already allocated to Class ${roomConflict.class}-${roomConflict.section} during ${period} on ${day}.`
    );
  }

  // 3. Class schedule double-booking check
  const classConflict = await Timetable.findOne({
    tenantId,
    day,
    period,
    class: className,
    section,
    ...(_id => (excludeId ? { _id: { $ne: excludeId } } : {}))()
  });
  if (classConflict) {
    throw ApiError.conflict(
      `Class Schedule Conflict: Class ${className}-${section} already has '${classConflict.subject}' assigned during ${period} on ${day}.`
    );
  }
};

const createTimetable = async (data, tenantId = 'default_tenant') => {
  await validateTimetableConflict(data, null, tenantId);
  const entry = await Timetable.create({ ...data, tenantId });
  return entry;
};

const updateTimetable = async (id, data, tenantId = 'default_tenant') => {
  const entry = await Timetable.findOne({ _id: id, tenantId });
  if (!entry) throw ApiError.notFound('Timetable entry not found.');

  const updatedPayload = { ...entry.toObject(), ...data };
  await validateTimetableConflict(updatedPayload, id, tenantId);

  Object.assign(entry, data);
  await entry.save();
  return entry;
};

const deleteTimetable = async (id, tenantId = 'default_tenant') => {
  const entry = await Timetable.findOne({ _id: id, tenantId });
  if (!entry) throw ApiError.notFound('Timetable entry not found.');
  await Timetable.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── ROOM SERVICES ───────────────────────────────────────────────────────────

const getRooms = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'roomNumber', roomType } = queryParams;
  const filter = { tenantId };

  if (roomType) filter.roomType = roomType;

  const searchQuery = buildSearchQuery(search, ['roomNumber', 'roomType']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Room.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Room.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createRoom = async (data, tenantId = 'default_tenant') => {
  const roomNum = data.roomNumber.toUpperCase().trim();
  const existing = await Room.findOne({ tenantId, roomNumber: roomNum });
  if (existing) {
    throw ApiError.conflict(`Room Number '${roomNum}' already exists.`);
  }

  const room = await Room.create({ ...data, roomNumber: roomNum, tenantId });
  return room;
};

const updateRoom = async (id, data, tenantId = 'default_tenant') => {
  const room = await Room.findOne({ _id: id, tenantId });
  if (!room) throw ApiError.notFound('Room not found.');

  if (data.roomNumber && data.roomNumber.toUpperCase().trim() !== room.roomNumber) {
    const roomNum = data.roomNumber.toUpperCase().trim();
    const existing = await Room.findOne({ tenantId, roomNumber: roomNum });
    if (existing) throw ApiError.conflict(`Room Number '${roomNum}' already exists.`);
  }

  Object.assign(room, data);
  if (data.roomNumber) room.roomNumber = data.roomNumber.toUpperCase().trim();
  await room.save();
  return room;
};

const deleteRoom = async (id, tenantId = 'default_tenant') => {
  const room = await Room.findOne({ _id: id, tenantId });
  if (!room) throw ApiError.notFound('Room not found.');
  await Room.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── SUBJECT ALLOCATION SERVICES ─────────────────────────────────────────────

const getSubjectAllocations = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'subject', class: className, teacher } = queryParams;
  const filter = { tenantId };

  if (className) filter.class = className;
  if (teacher) filter.teacher = teacher;

  const searchQuery = buildSearchQuery(search, ['subject', 'teacher', 'class']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await SubjectAllocation.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await SubjectAllocation.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createSubjectAllocation = async (data, tenantId = 'default_tenant') => {
  const existing = await SubjectAllocation.findOne({
    tenantId,
    subject: data.subject.trim(),
    teacher: data.teacher.trim(),
    class: data.class.trim()
  });
  if (existing) {
    throw ApiError.conflict(
      `Subject Allocation Conflict: Teacher '${data.teacher}' is already assigned to subject '${data.subject}' for Class ${data.class}.`
    );
  }

  const allocation = await SubjectAllocation.create({ ...data, tenantId });
  return allocation;
};

const updateSubjectAllocation = async (id, data, tenantId = 'default_tenant') => {
  const allocation = await SubjectAllocation.findOne({ _id: id, tenantId });
  if (!allocation) throw ApiError.notFound('Subject Allocation not found.');

  Object.assign(allocation, data);
  await allocation.save();
  return allocation;
};

const deleteSubjectAllocation = async (id, tenantId = 'default_tenant') => {
  const allocation = await SubjectAllocation.findOne({ _id: id, tenantId });
  if (!allocation) throw ApiError.notFound('Subject Allocation not found.');
  await SubjectAllocation.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── SUBSTITUTE MANAGEMENT SERVICES ──────────────────────────────────────────

const getSubstitutes = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-date', date, teacher } = queryParams;
  const filter = { tenantId };

  if (date) filter.date = date;
  if (teacher) {
    filter.$or = [{ originalTeacher: teacher }, { substituteTeacher: teacher }];
  }

  const searchQuery = buildSearchQuery(search, ['originalTeacher', 'substituteTeacher', 'reason', 'date']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await SubstituteTeacher.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await SubstituteTeacher.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createSubstitute = async (data, tenantId = 'default_tenant') => {
  if (data.originalTeacher.trim().toLowerCase() === data.substituteTeacher.trim().toLowerCase()) {
    throw ApiError.badRequest('Substitute teacher cannot be the same as the original teacher.');
  }

  const existing = await SubstituteTeacher.findOne({
    tenantId,
    originalTeacher: data.originalTeacher.trim(),
    date: data.date.trim()
  });
  if (existing) {
    throw ApiError.conflict(
      `Substitute Conflict: A substitute teacher is already assigned for '${data.originalTeacher}' on ${data.date}.`
    );
  }

  const substitute = await SubstituteTeacher.create({ ...data, tenantId });
  return substitute;
};

const updateSubstitute = async (id, data, tenantId = 'default_tenant') => {
  const substitute = await SubstituteTeacher.findOne({ _id: id, tenantId });
  if (!substitute) throw ApiError.notFound('Substitute record not found.');

  if (data.originalTeacher && data.substituteTeacher && data.originalTeacher.trim().toLowerCase() === data.substituteTeacher.trim().toLowerCase()) {
    throw ApiError.badRequest('Substitute teacher cannot be the same as the original teacher.');
  }

  Object.assign(substitute, data);
  await substitute.save();
  return substitute;
};

const deleteSubstitute = async (id, tenantId = 'default_tenant') => {
  const substitute = await SubstituteTeacher.findOne({ _id: id, tenantId });
  if (!substitute) throw ApiError.notFound('Substitute record not found.');
  await SubstituteTeacher.deleteOne({ _id: id, tenantId });
  return true;
};

module.exports = {
  getPeriods,
  createPeriod,
  updatePeriod,
  deletePeriod,

  getTimetables,
  createTimetable,
  updateTimetable,
  deleteTimetable,

  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,

  getSubjectAllocations,
  createSubjectAllocation,
  updateSubjectAllocation,
  deleteSubjectAllocation,

  getSubstitutes,
  createSubstitute,
  updateSubstitute,
  deleteSubstitute
};
