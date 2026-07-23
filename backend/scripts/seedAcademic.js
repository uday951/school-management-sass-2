const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Class = require('../src/modules/academic/class.model');
const Subject = require('../src/modules/academic/subject.model');
const User = require('../src/modules/user/user.model');

const seedAcademic = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Ensuring collections exist...');
    await Class.createCollection();
    await Subject.createCollection();
    await User.createCollection();

    console.log('[Seed] Checking existing records...');
    const teacherCount = await User.countDocuments({ role: 'teacher' });

    let teacher;
    if (teacherCount === 0) {
      console.log('[Seed] Creating sample teacher...');
      teacher = await User.create({
        name: 'Sarah Jenkins',
        email: 's.jenkins@school.edu',
        role: 'teacher',
        department: 'Mathematics',
        status: 'active'
      });
    } else {
      teacher = await User.findOne({ role: 'teacher' });
    }

    const classCount = await Class.countDocuments({ isDeleted: false });
    let classA;
    if (classCount === 0) {
      console.log('[Seed] Creating sample class register...');
      classA = await Class.create({
        className: 'Grade 10-A',
        classCode: 'G10A',
        capacity: 35,
        roomNumber: 'Room 101',
        teacherId: teacher._id,
        status: 'ACTIVE'
      });
    } else {
      classA = await Class.findOne({ isDeleted: false });
    }

    const subjectCount = await Subject.countDocuments({ isDeleted: false });
    if (subjectCount === 0) {
      console.log('[Seed] Creating sample subject setup...');
      await Subject.create({
        subjectName: 'Advanced Algebra',
        subjectCode: 'MTH-401',
        department: 'Mathematics',
        credits: 4,
        description: 'Trigonometry and algebraic equations',
        status: 'ACTIVE',
        teacher: teacher._id,
        classes: [classA._id]
      });
    }

    console.log('✅ [Seed Success] Academic collections and sample records created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ [Seed Error] Failed to seed academic collections:', err.message);
    process.exit(1);
  }
};

seedAcademic();
