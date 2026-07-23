const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const corsOptions = require('../config/cors');
const helmetOptions = require('../config/helmet');
const globalRateLimiter = require('../config/rate-limit');
const apiRoutes = require('./routes/index');
const { notFound } = require('./middlewares/not-found.middleware');
const { errorHandler } = require('./middlewares/error.middleware');
const { logger } = require('./utils/logger.util');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.use(globalRateLimiter);

// ─── Request Parsing ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// ─── HTTP Request Logger ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    })
  );
}

// ─── Root Route ────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to School ERP SaaS API',
    version: 'v1',
    docs: '/api/v1/docs'
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ─── 404 & Global Error Handlers ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
