const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const User = require('../src/modules/user/user.model');
const { comparePassword } = require('../src/utils/password.util');

const test = async () => {
  try {
    await connectDB();
    const users = await User.find({ isDeleted: false });
    console.log(`Found ${users.length} users:`);
    for (const u of users) {
      const match = await comparePassword('Password123', u.password);
      console.log(`- Email: ${u.email}, Role: ${u.role}, Password: ${u.password.substring(0, 10)}..., Match with Password123: ${match}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

test();
