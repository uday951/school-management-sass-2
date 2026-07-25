const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../modules/user/user.model');
const Role = require('../modules/user/models/role.model');
const Permission = require('../modules/user/models/permission.model');
const Department = require('../modules/user/models/department.model');
const Designation = require('../modules/user/models/designation.model');
const SystemSetting = require('../modules/user/models/system-setting.model');
const NotificationSetting = require('../modules/user/models/notification-setting.model');
const BackupHistory = require('../modules/user/models/backup-history.model');
const SecurityPolicy = require('../modules/user/models/security-policy.model');
const Teacher = require('../modules/teacher/models/teacher.model');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_erp';

async function seed() {
  console.log('Connecting to database:', mongoUri);
  await mongoose.connect(mongoUri);
  console.log('[DB] Connected successfully.');

  // Clean old settings data
  console.log('Cleaning administrative tables...');
  await Role.deleteMany({});
  await Permission.deleteMany({});
  await Department.deleteMany({});
  await Designation.deleteMany({});
  await SystemSetting.deleteMany({});
  await NotificationSetting.deleteMany({});
  await BackupHistory.deleteMany({});
  await SecurityPolicy.deleteMany({});
  console.log('Cleanup complete.');

  // 1. Seed Roles
  console.log('Seeding custom roles...');
  const roles = await Role.create([
    { name: 'super_admin', description: 'Complete system access root', isCustom: false },
    { name: 'school_admin', description: 'Academic institution administrator', isCustom: false },
    { name: 'Principal', description: 'Academic director', isCustom: true },
    { name: 'teacher', description: 'Class instructor and evaluator', isCustom: false },
    { name: 'parent', description: 'Student guardian representative', isCustom: false }
  ]);

  // 2. Seed Permissions Matrix
  console.log('Seeding permissions matrix...');
  const modulesList = ['Dashboard', 'Students', 'Teachers', 'Parents', 'Attendance', 'Exams', 'Fees', 'Finance', 'Payroll', 'Transport', 'Library', 'Communication', 'Reports', 'Settings'];
  
  for (const r of roles) {
    for (const m of modulesList) {
      await Permission.create({
        role: r.name,
        module: m,
        actions: {
          create: r.name === 'super_admin' || r.name === 'school_admin',
          read: true,
          update: r.name === 'super_admin' || r.name === 'school_admin',
          delete: r.name === 'super_admin',
          export: true,
          approve: r.name === 'super_admin' || r.name === 'Principal',
          print: true,
          assign: r.name === 'super_admin' || r.name === 'school_admin',
          manage: r.name === 'super_admin'
        }
      });
    }
  }

  // 3. Seed Departments & Designations
  console.log('Seeding departments & designations...');
  await Department.create([
    { name: 'Academic', code: 'DEPT-ACAD', description: 'Instructional staff and program heads' },
    { name: 'Administration', code: 'DEPT-ADMIN', description: 'Office and registrar help' },
    { name: 'Finance', code: 'DEPT-FIN', description: 'Billing and fee collectors' },
    { name: 'IT Support', code: 'DEPT-IT', description: 'Infrastructure administrators' }
  ]);

  await Designation.create([
    { name: 'Principal', code: 'PRIN', description: 'Administrative head' },
    { name: 'Senior Teacher', code: 'SNTCH', description: 'Department lead' },
    { name: 'Accountant', code: 'ACCT', description: 'Ledger controller' },
    { name: 'IT Specialist', code: 'ITSPC', description: 'Network admin' }
  ]);

  // 4. Seed Settings Parameters
  console.log('Seeding default parameters...');
  await SystemSetting.create({
    schoolName: 'ERP International Academy',
    timezone: 'EST',
    language: 'en',
    currency: 'USD',
    fileUploadLimit: 5,
    academicYear: '2026-2027',
    semester: 'Fall Semester',
    terms: ['First Term', 'Mid Term', 'Final Term']
  });

  await NotificationSetting.create({
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    reminderDays: 3
  });

  await SecurityPolicy.create({
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    accountLockDuration: 15,
    jwtExpiry: '15m'
  });

  // 5. Seed Backup History logs
  console.log('Seeding backup history logs...');
  await BackupHistory.create([
    { fileName: 'backup_2026-07-01_10-00-00.zip', status: 'success', size: 1024 },
    { fileName: 'backup_2026-07-15_12-00-00.zip', status: 'success', size: 1048 },
    { fileName: 'backup_2026-07-25_15-30-00.zip', status: 'success', size: 1060 }
  ]);

  // 6. Sync / Link Teachers to User accounts
  console.log('Syncing active teachers to User directory accounts...');
  const teachers = await Teacher.find({ isDeleted: false });
  for (const t of teachers) {
    const existingUser = await User.findOne({ email: t.email });
    if (!existingUser) {
      await User.create({
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
        role: 'teacher',
        username: `${t.firstName.toLowerCase()}${t.lastName.toLowerCase()}`,
        mobile: t.phone || '9999999999',
        department: t.department || 'Academic',
        designation: t.designation || 'Senior Teacher',
        employeeId: t.employeeId,
        status: 'active'
      });
    }
  }

  console.log('\n======================================================');
  console.log('🎉 SETTINGS & USER SEED COMPLETED SUCCESSFULLY!');
  console.log(`Please go to: http://localhost:5173/admin/settings`);
  console.log('Verify user directory, roles, dynamic matrix, and lock settings.');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
