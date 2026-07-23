require('../config/environment'); // Load and validate env vars first
const app = require('./app');
const { connectDB } = require('../config/database');
const { logger } = require('./utils/logger.util');

const PORT = process.env.PORT || 5000;

let server;

// ─── Start Server ─────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    server = app.listen(PORT, () => {
      logger.info(`🚀 School ERP Server started on port ${PORT}`);
      logger.info(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 URL: http://localhost:${PORT}`);
      logger.info(`❤️  Health: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

// ─── Graceful Shutdown ─────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  logger.info(`\n[Server] ${signal} received. Initiating graceful shutdown...`);

  if (server) {
    server.close(() => {
      logger.info('[Server] HTTP server closed.');
      process.exit(0);
    });

    // Force exit if not closed within 10s
    setTimeout(() => {
      logger.error('[Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// ─── Process Signal Handlers ───────────────────────────────────────────────
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', { reason, promise });
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// ─── Boot ──────────────────────────────────────────────────────────────────
startServer();
