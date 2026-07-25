const { body } = require('express-validator');

const announcementSchema = [
  body('title')
    .notEmpty()
    .withMessage('Announcement Title is required')
    .isString(),
  body('content')
    .notEmpty()
    .withMessage('Announcement Content is required')
];

const noticeSchema = [
  body('title')
    .notEmpty()
    .withMessage('Notice Title is required'),
  body('content')
    .notEmpty()
    .withMessage('Notice Content is required')
];

const eventSchema = [
  body('name')
    .notEmpty()
    .withMessage('Event name is required'),
  body('venue')
    .notEmpty()
    .withMessage('Event venue is required'),
  body('date')
    .notEmpty()
    .withMessage('Event date is required'),
  body('time')
    .notEmpty()
    .withMessage('Event time is required'),
  body('organizer')
    .notEmpty()
    .withMessage('Organizer is required')
];

const templateSchema = [
  body('name')
    .notEmpty()
    .withMessage('Template name is required'),
  body('type')
    .isIn(['sms', 'email', 'notification'])
    .withMessage('Template type must be sms, email, or notification'),
  body('content')
    .notEmpty()
    .withMessage('Template content is required')
];

const bulkSMSSchema = [
  body('targetAudience')
    .isIn(['student', 'teacher', 'custom'])
    .withMessage('Invalid target audience selection'),
  body('message')
    .notEmpty()
    .withMessage('SMS message text content is required')
];

const bulkEmailSchema = [
  body('targetAudience')
    .isIn(['student', 'teacher'])
    .withMessage('Invalid target audience selection'),
  body('subject')
    .notEmpty()
    .withMessage('Email subject is required'),
  body('content')
    .notEmpty()
    .withMessage('Email content HTML is required')
];

module.exports = {
  announcementSchema,
  noticeSchema,
  eventSchema,
  templateSchema,
  bulkSMSSchema,
  bulkEmailSchema
};
