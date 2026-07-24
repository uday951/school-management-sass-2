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
    const Parent = require('../src/modules/parent/parent.model');
    const Guardian = require('../src/modules/parent/models/guardian.model');
    const ParentDocument = require('../src/modules/parent/models/parent-document.model');
    const ParentStudentMapping = require('../src/modules/parent/models/parent-student-mapping.model');
    const ParentCommunication = require('../src/modules/parent/models/parent-communication.model');
    const Exam = require('../src/modules/exam/models/exam.model');
    const ExamSchedule = require('../src/modules/exam/models/exam-schedule.model');
    const Marks = require('../src/modules/exam/models/marks.model');
    const Grade = require('../src/modules/exam/models/grade.model');
    const Result = require('../src/modules/exam/models/result.model');
    const ReportCard = require('../src/modules/exam/models/report-card.model');

    await Promise.all([
      Class.createCollection().catch(() => {}),
      Subject.createCollection().catch(() => {}),
      User.createCollection().catch(() => {}),
      Parent.createCollection().catch(() => {}),
      Guardian.createCollection().catch(() => {}),
      ParentDocument.createCollection().catch(() => {}),
      ParentStudentMapping.createCollection().catch(() => {}),
      ParentCommunication.createCollection().catch(() => {}),
      Exam.createCollection().catch(() => {}),
      ExamSchedule.createCollection().catch(() => {}),
      Marks.createCollection().catch(() => {}),
      Grade.createCollection().catch(() => {}),
      Result.createCollection().catch(() => {}),
      ReportCard.createCollection().catch(() => {})
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
