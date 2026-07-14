import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

import authRouter from './routes/auth.routes';
import platformRouter from './routes/platform.routes';
import schoolRouter from './routes/school.routes';
import studentRouter from './routes/student.routes';
import employeeRouter from './routes/employee.routes';
import importRouter from './routes/import.routes';
import inviteRouter from './routes/invite.routes';
import onboardingRouter from './routes/onboarding.routes';
import publicRouter from './routes/public.routes';
import attendanceRouter from './routes/attendance.routes';
import timetableRouter from './routes/timetable.routes';
import examsRouter from './routes/exams.routes';
import feesRouter from './routes/fees.routes';
import staffOpsRouter from './routes/staff-ops.routes';
import communicationRouter from './routes/communication.routes';
import learningRouter from './routes/learning.routes';
import libraryRouter from './routes/library.routes';
import transportRouter from './routes/transport.routes';
import calendarOpsRouter from './routes/calendar-ops.routes';
import visitorGateRouter from './routes/visitor-gate.routes';
import mobileRouter from './routes/mobile.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Mounted Routes
app.use('/api/auth', authRouter);
app.use('/api/platform', platformRouter);

// 1. Mount routers containing Student, Guardian, and Teacher routes first
app.use('/api/school/learning', learningRouter);
app.use('/api/school/attendance', attendanceRouter);
app.use('/api/school', timetableRouter);
app.use('/api/school', examsRouter);
app.use('/api/school', feesRouter);
app.use('/api/school/staff-ops', staffOpsRouter);
app.use('/api/school/communication', communicationRouter);
app.use('/api/school/library', libraryRouter);
app.use('/api/school/transport', transportRouter);
app.use('/api/school/calendar', calendarOpsRouter);
app.use('/api/school/gate', visitorGateRouter);
app.use('/api/mobile', mobileRouter);
app.use('/api', publicRouter);

// 2. Mount admin-only directories last to prevent wildcard route interception
app.use('/api/school', schoolRouter);
app.use('/api/school', studentRouter);
app.use('/api/school', employeeRouter);
app.use('/api/school/imports', importRouter);
app.use('/api/school/invites', inviteRouter);
app.use('/api/school/onboarding', onboardingRouter);

// Global Error Catch Handler
app.use(errorMiddleware);

// Boot Express Server
app.listen(port, () => {
  console.log(`🚀 SchoolSaaS API server listening on http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
