const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Teacher = require('../modules/teacher/models/teacher.model');
const TeacherAttendance = require('../modules/attendance/models/teacher-attendance.model');
const LeaveRequest = require('../modules/attendance/models/leave-request.model');
const SalaryStructure = require('../modules/payroll/models/salary-structure.model');
const SalaryComponent = require('../modules/payroll/models/salary-component.model');
const EmployeeSalary = require('../modules/payroll/models/employee-salary.model');
const Payroll = require('../modules/payroll/models/payroll.model');
const Payslip = require('../modules/payroll/models/payslip.model');
const Bonus = require('../modules/payroll/models/bonus.model');
const Allowance = require('../modules/payroll/models/allowance.model');
const Deduction = require('../modules/payroll/models/deduction.model');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_erp';

async function seed() {
  console.log('Connecting to database:', mongoUri);
  await mongoose.connect(mongoUri);
  console.log('[DB] Connected successfully.');

  // Clean old payroll records
  console.log('Cleaning existing payroll database structures...');
  await SalaryStructure.deleteMany({});
  await SalaryComponent.deleteMany({});
  await EmployeeSalary.deleteMany({});
  await Payroll.deleteMany({});
  await Payslip.deleteMany({});
  await Bonus.deleteMany({});
  await Allowance.deleteMany({});
  await Deduction.deleteMany({});
  console.log('Cleanup complete.');

  // Find or create test teachers
  console.log('Checking for active teachers...');
  let teachers = await Teacher.find({ isDeleted: false, status: 'active' });
  if (teachers.length === 0) {
    console.log('No teachers found. Seeding realistic teacher profiles...');
    teachers = await Teacher.create([
      {
        employeeId: 'TCH-001',
        firstName: 'Albert',
        lastName: 'Einstein',
        gender: 'male',
        dob: new Date('1979-03-14'),
        phone: '9876543210',
        email: 'albert.physics@school.com',
        department: 'Science',
        designation: 'Department Head',
        joiningDate: new Date('2015-08-15')
      },
      {
        employeeId: 'TCH-002',
        firstName: 'Marie',
        lastName: 'Curie',
        gender: 'female',
        dob: new Date('1867-11-07'),
        phone: '9876543211',
        email: 'marie.chemistry@school.com',
        department: 'Science',
        designation: 'Senior Teacher',
        joiningDate: new Date('2018-09-01')
      },
      {
        employeeId: 'TCH-003',
        firstName: 'Ada',
        lastName: 'Lovelace',
        gender: 'female',
        dob: new Date('1815-12-10'),
        phone: '9876543212',
        email: 'ada.maths@school.com',
        department: 'Mathematics',
        designation: 'Senior Teacher',
        joiningDate: new Date('2020-01-10')
      }
    ]);
    console.log(`Created ${teachers.length} teachers.`);
  } else {
    console.log(`Found ${teachers.length} existing teachers.`);
  }

  // Create standard Salary Structures
  console.log('Creating standard salary structures...');
  const structures = await SalaryStructure.create([
    {
      name: 'Department Head Compensation Model',
      basicSalary: 5000,
      hra: 1000,
      da: 500,
      medicalAllowance: 300,
      transportAllowance: 300,
      otherAllowances: 200,
      grossSalary: 7300,
      effectiveDate: new Date()
    },
    {
      name: 'Senior Teacher Compensation Model',
      basicSalary: 3500,
      hra: 700,
      da: 350,
      medicalAllowance: 200,
      transportAllowance: 200,
      otherAllowances: 150,
      grossSalary: 5100,
      effectiveDate: new Date()
    }
  ]);
  console.log('Structures generated.');

  // Create Salary Components
  console.log('Seeding standard salary components...');
  await SalaryComponent.create([
    { name: 'Provident Fund (PF)', type: 'deduction', calculationType: 'percentage', value: 12 },
    { name: 'State Insurance (ESI)', type: 'deduction', calculationType: 'percentage', value: 0.75 },
    { name: 'Professional Tax', type: 'deduction', calculationType: 'fixed', value: 20 },
    { name: 'Festival Bonus', type: 'earning', calculationType: 'fixed', value: 150 },
    { name: 'Medical Allowance', type: 'earning', calculationType: 'fixed', value: 200 }
  ]);
  console.log('Salary components seeded.');

  // Configure employee salaries mapping
  console.log('Mapping employee salary configurations...');
  const activeMonth = new Date().getMonth() + 1;
  const activeYear = new Date().getFullYear();

  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    const struct = t.designation === 'Department Head' ? structures[0] : structures[1];
    
    const pf = struct.basicSalary * 0.12;
    const esi = struct.grossSalary * 0.0075;
    const profTax = 20;
    const incomeTax = struct.grossSalary > 5000 ? (struct.grossSalary - 5000) * 0.10 : 0;
    const netSalary = struct.grossSalary - (pf + esi + profTax + incomeTax);

    await EmployeeSalary.create({
      teacherId: t._id,
      salaryStructureId: struct._id,
      basicSalary: struct.basicSalary,
      hra: struct.hra,
      da: struct.da,
      medicalAllowance: struct.medicalAllowance,
      transportAllowance: struct.transportAllowance,
      otherAllowances: struct.otherAllowances,
      pf,
      esi,
      profTax,
      incomeTax,
      netSalary,
      status: 'active'
    });

    // Seed attendance logs for this teacher for the current month
    // Present: 26, Absent: 2, Late: 1, Halfday: 1
    console.log(`Seeding attendance logs for teacher: ${t.firstName} ${t.lastName}...`);
    await TeacherAttendance.deleteMany({ teacherId: t._id.toString() }); // Clear old
    const totalDays = new Date(activeYear, activeMonth, 0).getDate();
    
    let daysPresentCount = 0;
    let daysAbsentCount = 0;
    let daysLateCount = 0;
    let daysHalfdayCount = 0;

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(activeYear, activeMonth - 1, day);
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

      let status = 'present';
      if (day === 5 || day === 15) {
        status = 'absent';
        daysAbsentCount++;
      } else if (day === 10) {
        status = 'late';
        daysLateCount++;
      } else if (day === 20) {
        status = 'halfday';
        daysHalfdayCount++;
      } else {
        daysPresentCount++;
      }

      await TeacherAttendance.create({
        teacherId: t._id.toString(),
        date: d,
        status,
        remarks: 'Automated seed verify check-in log'
      });
    }

    // Seed 1 approved leave
    await LeaveRequest.create({
      applicantId: t._id.toString(),
      applicantName: `${t.firstName} ${t.lastName}`,
      type: 'teacher',
      leaveType: 'sick',
      startDate: new Date(activeYear, activeMonth - 1, 3),
      endDate: new Date(activeYear, activeMonth - 1, 4),
      reason: 'Medical seed check recovery',
      status: 'approved'
    });

    // Schedule dynamic additions
    await Bonus.create({
      teacherId: t._id,
      amount: 150,
      type: 'Festival Bonus',
      date: new Date(activeYear, activeMonth - 1, 12),
      status: 'pending',
      remarks: 'Seeded Annual Incentive'
    });

    await Allowance.create({
      teacherId: t._id,
      amount: 50,
      type: 'Special Project Allowance',
      date: new Date(activeYear, activeMonth - 1, 14),
      status: 'pending',
      remarks: 'Seeded Travel Compensation'
    });

    await Deduction.create({
      teacherId: t._id,
      amount: 30,
      type: 'Uniform Charge Deduction',
      date: new Date(activeYear, activeMonth - 1, 18),
      status: 'pending',
      remarks: 'Seeded tool recovery deductions'
    });
  }

  console.log('\n======================================================');
  console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
  console.log(`Seeded active period: Month ${activeMonth}/${activeYear}`);
  console.log(`Please go to: http://localhost:5173/admin/payroll`);
  console.log('Select "Monthly Batches" tab, click "Process Batch", enter:');
  console.log(`Month: ${activeMonth}`);
  console.log(`Year: ${activeYear}`);
  console.log('Execute Run and verify calculations, payslips, and ledgers.');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
