const mongoose = require('mongoose');
const env = require('./environment');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: env.nodeEnv === 'development'
    });

    isConnected = true;
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);

    // Ensure collections are created in MongoDB immediately on connect
    const Class = require('../src/modules/academic/class.model');
    const Subject = require('../src/modules/academic/subject.model');
    const User = require('../src/modules/user/user.model');

    await Promise.all([
      Class.createCollection().catch(() => {}),
      Subject.createCollection().catch(() => {}),
      User.createCollection().catch(() => {})
    ]);

    return conn.connection;
  } catch (error) {
    console.error(`[DB Error] MongoDB Connection Failed: ${error.message}`);
    if (env.nodeEnv === 'production') {
      process.exit(1);
    }
  }
};

const checkDBHealth = () => {
  return {
    status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    readyState: mongoose.connection.readyState
  };
};

module.exports = {
  connectDB,
  checkDBHealth
};
