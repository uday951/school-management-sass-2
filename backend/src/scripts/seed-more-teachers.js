const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: 'd:/main_projects/school management system/backend/.env' });

const Teacher = require('../modules/teacher/models/teacher.model');
const User = require('../modules/user/user.model');

const mongoUri = process.env.MONGODB_URI;

const additionalTeachers = [
  {
    employeeId: 'TCH-9001',
    firstName: 'Thomas',
    lastName: 'Anderson',
    gender: 'male',
    dob: '1984-03-11',
    phone: '(555) 111-2222',
    email: 'thomas.anderson@school.edu',
    address: 'Metropolis, NY',
    department: 'IT Support',
    designation: 'IT Specialist',
    joiningDate: '2021-01-10',
    qualification: 'M.S. Computer Science',
    experienceYears: 6,
    status: 'active'
  },
  {
    employeeId: 'TCH-9002',
    firstName: 'Sarah',
    lastName: 'Connor',
    gender: 'female',
    dob: '1987-05-24',
    phone: '(555) 333-4444',
    email: 'sarah.connor@school.edu',
    address: 'Los Angeles, CA',
    department: 'Science',
    designation: 'Senior Teacher',
    joiningDate: '2019-08-15',
    qualification: 'M.Sc. Physics',
    experienceYears: 8,
    status: 'active'
  },
  {
    employeeId: 'TCH-9003',
    firstName: 'Bruce',
    lastName: 'Wayne',
    gender: 'male',
    dob: '1982-02-19',
    phone: '(555) 555-7777',
    email: 'bruce.wayne@school.edu',
    address: 'Gotham City',
    department: 'Administration',
    designation: 'Principal',
    joiningDate: '2010-09-01',
    qualification: 'Ph.D. Education & Business Administration',
    experienceYears: 16,
    status: 'active'
  },
  {
    employeeId: 'TCH-9004',
    firstName: 'Diana',
    lastName: 'Prince',
    gender: 'female',
    dob: '1989-11-12',
    phone: '(555) 888-9999',
    email: 'diana.prince@school.edu',
    address: 'Themyscira, GR',
    department: 'Humanities',
    designation: 'Senior Teacher',
    joiningDate: '2017-02-28',
    qualification: 'Ph.D. Archaeology & Ancient History',
    experienceYears: 9,
    status: 'active'
  },
  {
    employeeId: 'TCH-9005',
    firstName: 'Peter',
    lastName: 'Parker',
    gender: 'male',
    dob: '1995-08-10',
    phone: '(555) 000-1111',
    email: 'peter.parker@school.edu',
    address: 'Queens, NY',
    department: 'Science',
    designation: 'Senior Teacher',
    joiningDate: '2023-09-05',
    qualification: 'B.Sc. Chemistry & Journalism',
    experienceYears: 3,
    status: 'active'
  }
];

async function seed() {
  console.log('Connecting to database:', mongoUri);
  await mongoose.connect(mongoUri);

  for (const t of additionalTeachers) {
    const existing = await Teacher.findOne({ employeeId: t.employeeId });
    if (!existing) {
      console.log(`Seeding teacher profile: ${t.firstName} ${t.lastName} (${t.employeeId})`);
      const teacher = await Teacher.create(t);

      // Create corresponding User profile
      const existingUser = await User.findOne({ email: teacher.email });
      if (!existingUser) {
        await User.create({
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email,
          role: 'teacher',
          department: teacher.department,
          designation: teacher.designation,
          employeeId: teacher.employeeId,
          mobile: teacher.phone,
          status: 'active'
        });
        console.log(`- Automatically synced User account: ${teacher.email}`);
      }
    } else {
      console.log(`Teacher already exists: ${t.firstName} ${t.lastName} (${t.employeeId})`);
    }
  }

  console.log('🎉 Seeding additional teachers complete.');
  await mongoose.disconnect();
}

seed().catch(console.error);
