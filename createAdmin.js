// Run this ONCE to create your admin account, then you can delete this file.
// Usage (from restaurant-backend folder): node createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User'); // adjust path if you place User.js elsewhere

// ⬇️ CHANGE THESE before running
const USERNAME = 'youradminusername';
const PASSWORD = 'ChooseAStrongPassword123!';

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const existing = await User.findOne({ username: USERNAME });
    if (existing) {
      console.log('A user with that username already exists.');
      process.exit(0);
    }
    const user = new User({ username: USERNAME, password: PASSWORD });
    await user.save();
    console.log(`✅ Admin user "${USERNAME}" created successfully.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error creating admin user:', err.message);
    process.exit(1);
  });
