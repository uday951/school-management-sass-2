let MongoMemoryServer;
try {
  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch (err) {
  // Safe fallback if package is not installed
}
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_32_bytes_here';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_32_bytes_here';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.COOKIE_SECRET = 'test_cookie_secret';

let mongod;

beforeAll(async () => {
  if (!MongoMemoryServer) {
    console.log('[Test Setup] MongoMemoryServer not installed. Running in offline fallback mode.');
    return;
  }
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    
    // Inject memory server URI into loaded config
    const env = require('../config/environment');
    env.mongoUri = uri;

    const { connectDB } = require('../config/database');
    await connectDB();
  } catch (err) {
    console.warn('[Test Setup] MongoMemoryServer notice:', err.message);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
});

jest.setTimeout(30000);
