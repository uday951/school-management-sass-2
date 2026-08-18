const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const env = require('../config/environment');

// Import models
const Institution = require('../src/modules/school/institution.model');
const Campus = require('../src/modules/school/campus.model');
const Class = require('../src/modules/academic/class.model');
const Subject = require('../src/modules/academic/subject.model');
const User = require('../src/modules/user/user.model');
const Teacher = require('../src/modules/teacher/models/teacher.model');
const Student = require('../src/modules/student/models/student.model');
const Parent = require('../src/modules/parent/parent.model');
const StudentAttendance = require('../src/modules/attendance/models/student-attendance.model');
const LeaveRequest = require('../src/modules/attendance/models/leave-request.model');
const Exam = require('../src/modules/exam/models/exam.model');
const ExamSchedule = require('../src/modules/exam/models/exam-schedule.model');
const Expense = require('../src/modules/finance/expense.model');
const Income = require('../src/modules/finance/income.model');
const Vehicle = require('../src/modules/transport/models/vehicle.model');
const Route = require('../src/modules/transport/models/route.model');

const { hashPassword } = require('../src/utils/password.util');

const seed = async () => {
  try {
    console.log('[Seed] Connecting to Greenwood database...');
    await connectDB();

    console.log('[Seed] Wiping old mock database records...');
    await Promise.all([
      Institution.deleteMany({}),
      Campus.deleteMany({}),
      Class.deleteMany({}),
      Subject.deleteMany({}),
      User.deleteMany({}),
      Teacher.deleteMany({}),
      Student.deleteMany({}),
      Parent.deleteMany({}),
      StudentAttendance.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Exam.deleteMany({}),
      ExamSchedule.deleteMany({}),
      Expense.deleteMany({}),
      Income.deleteMany({}),
      Vehicle.deleteMany({}),
      Route.deleteMany({})
    ]);
    console.log('[Seed] Clean wipe complete.');

    // 1. Create Institution
    console.log('[Seed] Seeding Greenwood International School...');
    const school = await Institution.create({
      tenantId: 'default_school',
      name: 'Greenwood International School',
      code: 'GWIS',
      affiliationNumber: 'AFF-987654',
      registrationNumber: 'REG-GWIS100',
      establishedYear: 2012,
      type: 'co-educational',
      phone: '+1 (555) 123-4567',
      email: 'info@greenwood.edu',
      website: 'https://greenwood.edu',
      country: 'USA',
      state: 'California',
      city: 'Los Angeles',
      pinCode: '90001',
      address: '100 Greenwood Ave, Los Angeles, CA',
      principalName: 'Dr. Evelyn Greenwood',
      principalContact: '+1 (555) 123-9999',
      principalEmail: 'principal@greenwood.edu'
    });

    // 2. Create Campus
    const campus = await Campus.create({
      tenantId: 'default_school',
      name: 'Greenwood Main Campus',
      code: 'GWIS-MAIN',
      address: '100 Greenwood Ave, Los Angeles, CA',
      principal: 'Dr. Evelyn Greenwood',
      contactNumber: '+1 (555) 123-4567',
      email: 'campus.main@greenwood.edu',
      status: 'active'
    });

    // 3. Create Greenwood Principal User Account (real auth password)
    console.log('[Seed] Creating Greenwood principal user account...');
    const hp = await hashPassword('Password123');
    const principalUser = await User.create({
      _id: '6a6237bed724b22b37b5255a', // Fits the mock test bypass token ID
      name: 'Dr. Evelyn Greenwood',
      email: 'principal@greenwood.edu',
      role: 'school_admin',
      password: hp,
      department: 'Administration',
      designation: 'Principal',
      employeeId: 'EMP000',
      mobile: '+1 (555) 123-9999',
      status: 'active'
    });

    // 4. Create 7 Teachers
    console.log('[Seed] Seeding 7 Teacher accounts...');
    const teacherNames = [
      { first: 'Sarah', last: 'Jenkins', email: 's.jenkins@school.edu', sub: 'Mathematics', dept: 'Science' },
      { first: 'Emma', last: 'Watson', email: 'e.watson@greenwood.edu', sub: 'English', dept: 'Languages' },
      { first: 'Oliver', last: 'Twist', email: 'o.twist@greenwood.edu', sub: 'History', dept: 'Humanities' },
      { first: 'Sophia', last: 'Loren', email: 's.loren@greenwood.edu', sub: 'Physics', dept: 'Science' },
      { first: 'Jackson', last: 'Pollock', email: 'j.pollock@greenwood.edu', sub: 'Fine Arts', dept: 'Arts' },
      { first: 'Liam', last: 'Neeson', email: 'l.neeson@greenwood.edu', sub: 'Physical Ed', dept: 'Sports' },
      { first: 'Mia', last: 'Farrow', email: 'm.farrow@greenwood.edu', sub: 'Music', dept: 'Arts' }
    ];

    const teacherDocs = [];
    for (let i = 0; i < teacherNames.length; i++) {
      const t = teacherNames[i];
      const tUser = await User.create({
        name: `${t.first} ${t.last}`,
        email: t.email,
        role: 'teacher',
        password: hp,
        department: t.dept,
        designation: 'Senior Teacher',
        employeeId: `EMP00${i + 1}`,
        status: 'active'
      });

      const tDoc = await Teacher.create({
        tenantId: 'default_school',
        employeeId: `EMP00${i + 1}`,
        firstName: t.first,
        lastName: t.last,
        gender: i % 2 === 0 ? 'female' : 'male',
        dob: new Date('1985-05-15'),
        phone: `+1 (555) 555-010${i + 1}`,
        email: t.email,
        department: t.dept,
        designation: 'Senior Teacher',
        joiningDate: new Date('2020-08-01'),
        status: 'active'
      });
      teacherDocs.push({ tUser, tDoc, subName: t.sub });
    }

    // 5. Create 3 Classes
    console.log('[Seed] Seeding Greenwood classes...');
    const classA = await Class.create({
      tenantId: 'default_school',
      className: 'Grade 10-A',
      classCode: 'G10A',
      capacity: 30,
      roomNumber: 'Room 101',
      teacherId: teacherDocs[0].tDoc._id.toString(), // Sarah Jenkins
      status: 'ACTIVE'
    });

    const classB = await Class.create({
      tenantId: 'default_school',
      className: 'Grade 10-B',
      classCode: 'G10B',
      capacity: 30,
      roomNumber: 'Room 102',
      teacherId: teacherDocs[1].tDoc._id.toString(), // Emma Watson
      status: 'ACTIVE'
    });

    const classC = await Class.create({
      tenantId: 'default_school',
      className: 'Grade 11-A',
      classCode: 'G11A',
      capacity: 30,
      roomNumber: 'Room 201',
      teacherId: teacherDocs[3].tDoc._id.toString(), // Sophia Loren
      status: 'ACTIVE'
    });

    // Link classes back to teachers
    teacherDocs[0].tDoc.assignedClasses = [{ classId: classA._id.toString(), className: 'Grade 10-A', section: 'A', isClassTeacher: true }];
    await teacherDocs[0].tDoc.save();
    teacherDocs[1].tDoc.assignedClasses = [{ classId: classB._id.toString(), className: 'Grade 10-B', section: 'B', isClassTeacher: true }];
    await teacherDocs[1].tDoc.save();
    teacherDocs[3].tDoc.assignedClasses = [{ classId: classC._id.toString(), className: 'Grade 11-A', section: 'A', isClassTeacher: true }];
    await teacherDocs[3].tDoc.save();

    // 6. Create Subjects
    console.log('[Seed] Seeding Subjects...');
    for (let i = 0; i < teacherDocs.length; i++) {
      const t = teacherDocs[i];
      await Subject.create({
        tenantId: 'default_school',
        subjectName: t.subName,
        subjectCode: `${t.subName.substring(0, 3).toUpperCase()}-101`,
        department: t.tDoc.department,
        credits: 3,
        description: `General study of ${t.subName}`,
        status: 'ACTIVE',
        teacher: t.tDoc._id.toString(),
        classes: [classA._id, classB._id, classC._id]
      });
    }

    // 7. Create 20 Students (placed in 10-A, 10-B, 11-A) and their parents
    console.log('[Seed] Seeding 20 Student accounts...');
    const firstNames = [
      'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Elizabeth',
      'William', 'Linda', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
      'Thomas', 'Sarah', 'Charles', 'Karen'
    ];
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
      'Taylor', 'Moore', 'Jackson', 'Martin'
    ];

    const studentDocs = [];
    for (let i = 0; i < 20; i++) {
      const cls = i < 8 ? classA : (i < 15 ? classB : classC);
      
      const stud = await Student.create({
        tenantId: 'default_school',
        admissionNo: `ADM2026${String(i + 1).padStart(3, '0')}`,
        admissionDate: new Date('2026-08-01'),
        rollNo: String(100 + i + 1),
        firstName: firstNames[i],
        lastName: lastNames[i],
        dob: new Date('2011-04-10'),
        gender: i % 2 === 0 ? 'male' : 'female',
        bloodGroup: 'O+',
        class: cls.className,
        studentClass: cls.className,
        section: cls.className.split('-')[1],
        phone: `+1 (555) 777-${String(i).padStart(4, '0')}`,
        email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@greenwood.edu`,
        status: 'active'
      });
      studentDocs.push(stud);

      // Create Parent details
      const parentUser = await User.create({
        name: `Parent of ${firstNames[i]}`,
        email: `parent${i + 1}@greenwood.edu`,
        role: 'parent',
        password: hp,
        status: 'active'
      });

      await Parent.create({
        tenantId: 'default_school',
        studentId: stud._id,
        name: `Parent of ${firstNames[i]} ${lastNames[i]}`,
        relationship: i % 2 === 0 ? 'Father' : 'Mother',
        email: `parent${i + 1}@greenwood.edu`,
        phone: `+1 (555) 888-${String(i).padStart(4, '0')}`,
        address: '123 Residential Area, LA',
        status: 'active'
      });
    }

    // 8. Seed Attendance for today
    console.log('[Seed] Seeding student attendance rates...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < studentDocs.length; i++) {
      // 15 present, 3 absent, 2 late
      let status = 'present';
      if (i >= 15 && i < 18) status = 'absent';
      if (i >= 18) status = 'late';

      await StudentAttendance.create({
        tenantId: 'default_school',
        studentId: studentDocs[i]._id,
        date: today,
        status,
        remarks: status === 'absent' ? 'Unexcused sick leave' : 'On-time arrival',
        markedBy: 'Sarah Jenkins'
      });
    }

    // 9. Seed pending leaves (for approvals screen testing)
    console.log('[Seed] Seeding teacher pending leaves...');
    await LeaveRequest.create({
      tenantId: 'default_school',
      applicantId: teacherDocs[0].tDoc._id.toString(), // Sarah Jenkins
      applicantName: 'Sarah Jenkins',
      type: 'teacher',
      leaveType: 'sick',
      startDate: new Date('2026-08-25'),
      endDate: new Date('2026-08-26'),
      reason: 'Suffering from severe seasonal flu.',
      status: 'pending'
    });

    await LeaveRequest.create({
      tenantId: 'default_school',
      applicantId: teacherDocs[1].tDoc._id.toString(), // Emma Watson
      applicantName: 'Emma Watson',
      type: 'teacher',
      leaveType: 'casual',
      startDate: new Date('2026-08-28'),
      endDate: new Date('2026-08-28'),
      reason: 'Personal family emergency.',
      status: 'pending'
    });

    // 10. Seed Finance entries (Collections today & Pending dues)
    console.log('[Seed] Seeding Finance collections & logs...');
    // Collections today
    const dateStr = new Date().toISOString().split('T')[0];
    await Income.create({
      tenantId: 'default_school',
      source: 'Student Tuition Fees',
      amount: 1200,
      category: 'Tuition Fee',
      date: dateStr,
      paymentMethod: 'Cash',
      description: 'Tuition payment for Grade 10 student'
    });
    await Income.create({
      tenantId: 'default_school',
      source: 'Student Tuition Fees',
      amount: 800,
      category: 'Tuition Fee',
      date: dateStr,
      paymentMethod: 'Bank Transfer',
      description: 'Tuition payment for Grade 11 student'
    });
    // Billed expenses today
    await Expense.create({
      tenantId: 'default_school',
      expenseName: 'Electricity Bill',
      vendor: 'LA Power',
      amount: 350,
      category: 'Utilities',
      date: dateStr,
      paymentMethod: 'Credit Card',
      description: 'Electricity bill for Main Building'
    });
    await Expense.create({
      tenantId: 'default_school',
      expenseName: 'Office Supplies purchase',
      vendor: 'Staples Inc',
      amount: 250,
      category: 'Office Supplies',
      date: dateStr,
      paymentMethod: 'Cash',
      description: 'Whiteboard markers and A4 papers'
    });

    // 11. Seed Transport
    console.log('[Seed] Seeding Transport lines...');
    const vehicle1 = await Vehicle.create({
      tenantId: 'default_school',
      vehicleNo: 'BUS-01',
      registrationNo: 'CA-98765',
      type: 'bus',
      capacity: 40,
      manufacturer: 'Toyota',
      model: 'Coaster',
      insuranceNo: 'INS-99123',
      insuranceExpiry: new Date('2027-12-31'),
      status: 'active'
    });
    const vehicle2 = await Vehicle.create({
      tenantId: 'default_school',
      vehicleNo: 'VAN-02',
      registrationNo: 'CA-12345',
      type: 'van',
      capacity: 15,
      manufacturer: 'Ford',
      model: 'Transit',
      insuranceNo: 'INS-88123',
      insuranceExpiry: new Date('2027-10-30'),
      status: 'active'
    });

    await Route.create({
      tenantId: 'default_school',
      routeName: 'North Los Angeles Route',
      routeCode: 'R-NLA',
      distance: 12.5,
      estimatedTime: '45 mins',
      assignedVehicle: vehicle1._id,
      status: 'active'
    });

    console.log('✅ [Seed Success] Real database populated with Greenwood school, 20 students, 7 teachers, and principal.');
    process.exit(0);
  } catch (err) {
    console.error('❌ [Seed Error] Seeding failed:', err);
    process.exit(1);
  }
};

seed();
