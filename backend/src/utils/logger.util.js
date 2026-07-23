const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const LOG_DIR = path.resolve(__dirname, '../../logs');

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `[${ts}] [${level.toUpperCase()}]: ${stack || message}`;
});

// ─── Console Transport (Dev) ────────────────────────────────────────────────
const consoleTransport = new winston.transports.Console({
  format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat)
});

// ─── Rotating Info Log ──────────────────────────────────────────────────────
const infoTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'info-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  level: 'info'
});

// ─── Rotating Error Log ─────────────────────────────────────────────────────
const errorTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  level: 'error'
});

// ─── Audit Log ──────────────────────────────────────────────────────────────
const auditTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'audit-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '90d',
  level: 'info'
});

// ─── Application Logger ─────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: combine(errors({ stack: true }), timestamp(), logFormat),
  transports: [consoleTransport, infoTransport, errorTransport],
  exitOnError: false
});

// ─── Audit Logger ───────────────────────────────────────────────────────────
const auditLogger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), logFormat),
  transports: [auditTransport],
  exitOnError: false
});

module.exports = { logger, auditLogger };
