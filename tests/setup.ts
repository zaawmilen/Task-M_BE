// tests/setup.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/user';
import Task from '../src/models/task';
import jwt from 'jsonwebtoken';

dotenv.config({ path: '.env.test' });

export let adminToken = '';
export let adminUserId = '';
export let userToken = '';
export let regularUserId = '';

beforeAll(async () => {
  console.log('🔧 Global test setup starting...');
  
  await mongoose.connect(process.env.MONGO_TEST_URI!);
  console.log('✅ Connected to MongoDB test database.');

  // Clear existing data
  await User.deleteMany({});
  await Task.deleteMany({});

  // Create admin user
  const adminUser = await User.create({
    name: 'Test Admin',
    email: `admin+${Date.now()}@example.com`,
    password: '123456',
    role: 'admin',
  });
  adminUserId = adminUser._id.toString();
  adminToken = jwt.sign(
    { userId: adminUserId, role: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // Create regular user for task tests
  const regularUser = await User.create({
    name: 'Test User',
    email: `user+${Date.now()}@example.com`,
    password: '123456',
    role: 'user',
  });
  regularUserId = regularUser._id.toString();
  userToken = jwt.sign(
    { userId: regularUserId, role: 'user' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  console.log('✅ Test users created');
});

afterAll(async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB test connection closed.');
});